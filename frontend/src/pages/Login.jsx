import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate('/connect-calendar');
  }, [user, navigate]);

  useEffect(() => {
    axios.get('http://localhost:5001/api/users')
      .then(r => {
        setUsers(r.data.users);
        if (r.data.users.length > 0) setSelectedId(r.data.users[0].id);
      })
      .catch(() => {});
  }, []);

  const handleLogin = async () => {
    if (!selectedId) return;
    setLoading(true);
    await login(selectedId);
    navigate('/connect-calendar');
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white p-4">
      <div className="max-w-md w-full bg-gray-900 p-8 rounded-2xl shadow-2xl text-center space-y-8 border border-gray-800">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Orbit</h1>
          <p className="text-gray-400 text-sm">Keep friendships alive. Manage your time intelligently.</p>
        </div>

        <div className="space-y-4 text-left">
          <label className="block text-sm font-medium text-gray-400">Log in as</label>
          <select
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
          >
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading || !selectedId}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-colors shadow-lg shadow-blue-500/20"
        >
          {loading ? 'Logging in...' : 'Mock Login'}
        </button>
      </div>
    </div>
  );
}
