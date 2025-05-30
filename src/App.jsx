import { useEffect, useState } from 'react';
import LoginModal from './loginmodal'; 
import './App.css'; 
import MyCalendar from './MyCalendar';


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsAuthenticated(!!token);
    loadTableData();
    if (token) {
      loadTableData();
    }
  }, []);

  const authFetch = (url, options = {}) => {
    const token = localStorage.getItem("access_token");
    options.headers = {
      ...options.headers,
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    };
    return fetch(url, options);
  };

  const iLostTheGame = () => {
    authFetch('http://127.0.0.1:8000/protected_route')
      .then(res => res.json())
      .then(data => {
        console.log(data);
        loadTableData(data);
      });
  };

  const handleLoginSuccess = (token) => {
    localStorage.setItem("access_token", token);
    setIsAuthenticated(true);
    setShowLoginModal(false);
    loadTableData();
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setIsAuthenticated(false);
    setShowLoginModal(false);
    loadTableData();
  };

  const loadTableData = () => {
    fetch('http://127.0.0.1:8000/get_data')
      .then(res => res.json())
      .then(data => setTableData(data))
      .catch(err => console.error("Failed to fetch data:", err));
  };
  
  return (
    <div>
      {showLoginModal && <LoginModal onLogin={handleLoginSuccess} />}
      
        <div>
          <h2>Welcome to the game!</h2>
          {!isAuthenticated ? (
           <button onClick={() => setShowLoginModal(true)}>Login</button>   
          ) : (
            <button onClick={handleLogout}>Logout</button>
          )}
          {isAuthenticated && (
            <button onClick={iLostTheGame}>I lost the game</button>
          )}
          {!showLoginModal && (
            <>
          <h3>Users:</h3>
          <div style={{display: 'flex', justifyContent: 'center', marginTop: '20px'}}>
          <table>
            <thead>
              <tr><th>ID</th><th>Username</th><th>Losses</th></tr>
            </thead>
            <tbody>
              {tableData.map(row => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>{row.username}</td>
                  <td>{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          <div>
            <h1 style={{margin: '0 auto', marginTop:'20px'}}>Calendar</h1>
              <MyCalendar/>
          </div>
          </>
          )}
        </div>

    </div>
  );
}

export default App;

