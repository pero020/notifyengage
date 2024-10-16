import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async () => {
    try {
      const res = await axios.post(`${process.env.REACT_APP_SERVER_URL || 'http://localhost:5001'}/signup`, { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('apiKey', res.data.apiKey);
      navigate('/dashboard');
    } catch (err) {
      setError("Signup failed. Please try again.");
    }
  };

  return (
    <div>
      <h1>Signup</h1>
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <button onClick={handleSignup}>Signup</button>
      {error && <p>{error}</p>}
    </div>
  );
}
