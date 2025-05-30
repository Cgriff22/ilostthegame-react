import { useState } from 'react';

function LoginModal({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isCreating ? 'submit_text' : 'sign_in';
    const response = await fetch(`http://127.0.0.1:8000/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (!isCreating && data.access_token) {
      onLogin(data.access_token);
    } else if (isCreating) {
      alert("Account Created! You can now sign in.");
      setIsCreating(false);
    } else { 
      alert("Login failed.")
    }
  };

  return (
    <div className="modal">
      <form onSubmit={handleSubmit}>
        <h2>{isCreating ? "Create Account" : "Login"}</h2>
        <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
        <button type="submit">{isCreating ? "Create Account" : "Log In"}</button>
        
      </form>
      <button onClick={() => setIsCreating(!isCreating)} style={{margin: '10px'}}>
        {isCreating ? "Switch to Login" : "Switch to Create Account"}
      </button>
    </div>
  );
}

export default LoginModal;
