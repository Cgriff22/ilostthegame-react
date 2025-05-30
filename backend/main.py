from sqlalchemy import orm
from sqlalchemy import create_engine
from sqlalchemy import LargeBinary
import jwt

engine = create_engine('sqlite:///./ilostthegame.db')

from sqlalchemy import Column, Integer, String

import bcrypt
def hash_password(password):
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed_password

def verify_password(password, hashed_password):
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password)

Base = orm.declarative_base()
class MyTable(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True)
    password = Column(LargeBinary)
    value = Column(Integer)

Base.metadata.create_all(engine)

from sqlalchemy.orm import sessionmaker

# receive input from javascript frontend
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from sqlalchemy import select, exists
@app.post('/submit_text')
async def submit_text(request: Request):
    data = await request.json()
    username_text = data.get("username")
    password_text = hash_password(data.get("password"))


    # open session
    Session = sessionmaker(bind=engine)
    session = Session()

    # check if username is already in database
    query = select(exists().where(MyTable.username == username_text))
    result = session.scalar(query)
    if result:
        print(f"User with name '{username_text}' already exists.")
    else:
        # add data
        new_row = MyTable(username=username_text, password=password_text, value=1)
        session.add(new_row)
        session.commit()

        # query date
        retrieved_row = session.query(MyTable).filter_by(username=username_text).first()
        print(retrieved_row)
        session.close()

        print('Received:', username_text)
        return{"message": f"Text '{username_text}' and '{password_text}' received"}



@app.get('/get_data')
def get_data():
    Session = sessionmaker(bind=engine)
    session = Session()
    rows = session.query(MyTable).all()
    result = [{"id": r.id, "username": r.username, "password": r.password, "value": r.value} for r in rows]
    #print(result)
    session.close()
    return result

SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
@app.post('/sign_in')
async def sign_in(request: Request):
    data = await request.json()
    name_to_find = data.get("username")
    password_text = data.get("password")


    Session = sessionmaker(bind=engine)
    session = Session()


    # check to see if username exists in database
    query = select(exists().where(MyTable.username == name_to_find))
    query_result = session.scalar(query)

    if query_result:
        data = session.query(MyTable).filter_by(username=name_to_find)
        result = data.first()
        pword = result.password
        username = name_to_find
        if verify_password(password_text, pword):
            encoded_jwt = jwt.encode({"sub": name_to_find}, SECRET_KEY, algorithm=ALGORITHM)
            print(f"encoded_jwt: {encoded_jwt}")
            #jwt.decode(encoded_jwt, "secret", algorithms=["HS256"])
            return {"access_token": encoded_jwt, "token_type": "bearer"}
        else:
            print("Invalid password")
        print(pword)
    else:
        print(f"Username {name_to_find} does not exist in the database")
    session.close()

from fastapi import Request, HTTPException, status, Depends

def get_current_user(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")

    token = auth_header.split(" ")[1]

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if not username:
            raise HTTPException(status_code=401, detail="Token missing subject (sub)")
        return username
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


@app.get('/protected_route')
def protected_route(current_user: str = Depends(get_current_user)):
    Session = sessionmaker(bind=engine)
    session = Session()

    user_to_update = session.query(MyTable).filter_by(username=current_user).first()
    user_to_update.value += 1
    session.commit()

    new_value = user_to_update.value
    session.close()

    return {"message": f"Loss recorded for {current_user}", "new_value": new_value}