import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Calendar, Users, Activity, LogOut, X, UserPlus, Trash2, Loader2 } from 'lucide-react';
import AIPlannerModal from '../components/AIPlannerModal';
import axios from 'axios';

function ManageFriendsModal({ isOpen, onClose, friends, onFriendsChange }) {
  const [newEmail, setNewEmail] = useState('');
  const [error, setError] = useState('');
  if (!isOpen) return null;

  const addFriend = async () => {
    if (!newEmail.trim()) return;
    setError('');
    try {
      await axios.post('http://localhost:5001/api/friends', { friendEmail: newEmail.trim() });
      setNewEmail('');
      onFriendsChange();
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to add friend');
    }
  };

  const removeFriend = async (friendId) => {
    await axios.delete(`http://localhost:5001/api/friends/${friendId}`);
    onFriendsChange();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Users size={20} className="text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Manage Friends</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-5 space-y-3 max-h-[50vh] overflow-y-auto">
          {friends.length === 0 && <p className="text-gray-500 text-center py-4">No friends yet</p>}
          {friends.map((f) => (
            <div key={f.id} className="flex items-center justify-between bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-3">
              <div>
                <p className="text-white font-medium">{f.name}</p>
                <p className="text-xs text-gray-400">Last met: {f.last_met ? new Date(f.last_met).toLocaleDateString() : 'Unknown'}</p>
              </div>
              <button onClick={() => removeFriend(f.id)} className="text-red-400 hover:text-red-300 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        <div className="p-5 border-t border-gray-800 space-y-2">
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-3">
            <input
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addFriend()}
              placeholder="Add by email address..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
            <button onClick={addFriend} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 font-medium">
              <UserPlus size={16} /> Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FindCommonTimeModal({ isOpen, onClose, nextSlot }) {
  if (!isOpen) return null;

  const formatTime = (iso) => new Date(iso).toLocaleString('en-IN', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Your Free Slots</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-5 space-y-3">
          {nextSlot ? (
            <div className="bg-gray-800/60 border border-blue-500/30 rounded-xl p-4">
              <p className="text-gray-400 text-sm mb-1">Next available block</p>
              <p className="text-blue-400 font-semibold">{formatTime(nextSlot.start_time)}</p>
              <p className="text-gray-400 text-sm mt-1">Until {formatTime(nextSlot.end_time)}</p>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-6">No upcoming free slots found</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="bg-gray-900 p-6 rounded-2xl flex flex-col justify-center border border-gray-800 hover:border-gray-700 transition-colors shadow-sm relative overflow-hidden group">
      <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
        {React.cloneElement(icon, { size: 100 })}
      </div>
      <h2 className="text-gray-400 text-sm font-medium mb-2 flex items-center gap-2">
        {React.cloneElement(icon, { size: 16, className: `text-${color}-400` })} {label}
      </h2>
      <p className={`text-2xl font-semibold text-${color}-400`}>{value}</p>
      <p className="text-gray-500 text-sm mt-1">{sub}</p>
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);
  const [isFriendsOpen, setIsFriendsOpen] = useState(false);
  const [isCommonTimeOpen, setIsCommonTimeOpen] = useState(false);
  const [dashData, setDashData] = useState(null);
  const [friends, setFriends] = useState([]);

  const fetchDashboard = () =>
    axios.get('http://localhost:5001/api/dashboard').then(r => setDashData(r.data)).catch(() => {});

  const fetchFriends = () =>
    axios.get('http://localhost:5001/api/friends').then(r => setFriends(r.data.friends)).catch(() => {});

  useEffect(() => {
    fetchDashboard();
    fetchFriends();
  }, []);

  const formatSlotTime = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    const isToday = d.toDateString() === new Date().toDateString();
    return (isToday ? 'Today, ' : d.toLocaleDateString('en-IN', { weekday: 'long' }) + ', ') +
      d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatMeetup = (m) => {
    if (!m) return { title: 'No upcoming meetups', time: '' };
    return { title: m.title, time: new Date(m.start_time).toLocaleDateString('en-IN', { weekday: 'long', hour: '2-digit', minute: '2-digit' }) };
  };

  const meetup = formatMeetup(dashData?.upcomingMeetup);
  const aiFriends = friends.map(f => ({
    name: f.name,
    interests: f.interests || [],
    lastMet: f.last_met ? new Date(f.last_met).toLocaleDateString() : 'Unknown'
  }));

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex justify-between items-center bg-gray-900/50 p-6 rounded-2xl border border-gray-800 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-lg font-bold shadow-lg">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user?.name || 'User'}</h1>
              <p className="text-gray-400 text-sm mt-0.5">Here is your social & wellness summary.</p>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-2 bg-red-500/10 text-red-400 px-4 py-2.5 rounded-xl hover:bg-red-500/20 transition-all font-medium">
            <LogOut size={18} />
            <span className="hidden md:inline">Logout</span>
          </button>
        </header>

        {!dashData ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-gray-500" size={32} /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              icon={<Calendar />} label="Next Free Slot" color="blue"
              value={dashData.nextFreeSlot ? formatSlotTime(dashData.nextFreeSlot.start_time) : 'None scheduled'}
              sub={dashData.nextFreeSlot ? 'Available block' : 'Add your availability'}
            />
            <StatCard
              icon={<Users />} label="Upcoming Meetup" color="purple"
              value={meetup.title}
              sub={meetup.time}
            />
            <StatCard
              icon={<Activity />} label="Friendship Score" color="green"
              value={`${dashData.friendshipScore}%`}
              sub={dashData.friendshipScore >= 50 ? 'Great work staying connected!' : 'Schedule more meetups'}
            />
          </div>
        )}

        <section className="bg-gray-900/40 p-6 rounded-2xl border border-gray-800">
          <h2 className="text-lg font-semibold mb-4 text-gray-200">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button onClick={() => setIsCommonTimeOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-blue-500/20">
              Find Common Time
            </button>
            <button onClick={() => setIsPlannerOpen(true)} className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-medium transition-colors border border-gray-700">
              Ask AI Planner
            </button>
            <button onClick={() => setIsFriendsOpen(true)} className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-medium transition-colors border border-gray-700">
              Manage Friends
            </button>
          </div>
        </section>
      </div>

      <AIPlannerModal isOpen={isPlannerOpen} onClose={() => setIsPlannerOpen(false)} user={user} friends={aiFriends} />
      <ManageFriendsModal isOpen={isFriendsOpen} onClose={() => setIsFriendsOpen(false)} friends={friends} onFriendsChange={() => { fetchFriends(); fetchDashboard(); }} />
      <FindCommonTimeModal isOpen={isCommonTimeOpen} onClose={() => setIsCommonTimeOpen(false)} nextSlot={dashData?.nextFreeSlot} />
    </div>
  );
}
