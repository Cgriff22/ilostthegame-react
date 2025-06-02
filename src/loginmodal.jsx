import { useState } from 'react';

function LoginModal({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint = isCreating ? 'submit_text' : 'sign_in';
    const API_URL = import.meta.env.VITE_API_URL;

    try {
      const response = await fetch(`${API_URL}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Request failed.");
        return;
      }

      if (!isCreating && data.access_token) {
        onLogin(data.access_token);
      } else if (isCreating) {
        alert("Account created! You can now sign in.");
        setIsCreating(false);
      } else {
        alert("Login failed.");
      }

    } catch (error) {
      console.error("Network error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="modal">
      <form onSubmit={handleSubmit}>
        <h2>{isCreating ? "Create Account" : "Login"}</h2>
        <input
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">{isCreating ? "Create Account" : "Log In"}</button>
      </form>
      <button onClick={() => setIsCreating(!isCreating)} style={{ margin: '10px' }}>
        {isCreating ? "Switch to Login" : "Switch to Create Account"}
      </button>
    </div>
  );
}

export default LoginModal;

