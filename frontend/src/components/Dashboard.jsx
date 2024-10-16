import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState('');
  const [url, setUrl] = useState('');
  const apiKey = localStorage.getItem('apiKey');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
    axios.get(`http://localhost:5001/notifications?key=${apiKey}`, {
      headers: { Authorization: token }
    })
      .then(res => setNotifications(res.data.notifications))
      .catch(err => console.error("Error fetching notifications", err));
  }, [apiKey, token]);

  const handleCreate = () => {
    axios.post(`http://localhost:5001/notifications?key=${apiKey}`, { message, url }, {
      headers: { Authorization: token }
    })
      .then(res => {
        setNotifications([...notifications, res.data]);
        setMessage('');
        setUrl('');
      })
      .catch(err => console.error("Error creating notification", err));
  };

  const handleDelete = (id) => {
    axios.delete(`http://localhost:5001/notifications/${id}?key=${apiKey}`, {
      headers: { Authorization: token }
    })
      .then(() => {
        setNotifications(notifications.filter(n => n._id !== id));
      })
      .catch(err => console.error("Error deleting notification", err));
  };

  return (
    <div>
      <h1>Manage Notifications</h1>
      <div>
        <input type="text" placeholder="Message" value={message} onChange={e => setMessage(e.target.value)} />
        <input type="text" placeholder="URL" value={url} onChange={e => setUrl(e.target.value)} />
        <button onClick={handleCreate}>Create Notification</button>
      </div>

      <ul>
        {notifications.map(notification => (
          <li key={notification._id}>
            {notification.message} - {notification.url}
            <button onClick={() => handleDelete(notification._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
