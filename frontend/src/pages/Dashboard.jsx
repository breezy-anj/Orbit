import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Calendar, Users, Activity, LogOut, X, UserPlus, Trash2 } from 'lucide-react';
import AIPlannerModal from '../components/AIPlannerModal';

const MOCK_FRIENDS = [
  { name: 'Sidhi', interests: ['coffee', 'hiking'], lastMet: '2 weeks ago' },
  { name: 'Rohan', interests: ['gaming', 'cricket'], lastMet: '1 month ago' },
  { name: 'Meher', interests: ['books', 'art galleries'], lastMet: '3 days ago' },
];

function ManageFriendsModal({ isOpen, onClose }) {
  const [friends, setFriends] = useState(MOCK_FRIENDS);
  const [newName, setNewName] = useState('');
  if (!isOpen) return null;
  const addFriend = () => {
    if (!newName.trim()) return;
    setFriends([...friends, { name: newName.trim(), interests: [], lastMet: 'Just added' }]);
    setNewName('');
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
          {friends.map((f, i) => (
            <div key={i} className="flex items-center justify-between bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-3">
              <div>
                <p className="text-white font-medium">{f.name}</p>
                <p className="text-xs text-gray-400">Last met: {f.lastMet}</p>
              </div>
              <button onClick={() => setFriends(friends.filter((_, fi) => fi !== i))} className="text-red-400 hover:text-red-300 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        <div className="p-5 border-t border-gray-800 flex gap-3">
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addFriend()}
            placeholder="Add a friend..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
          <button onClick={addFriend} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 font-medium">
            <UserPlus size={16} /> Add
          </button>
        </div>
      </div>
    </div>
  );
}

function FindCommonTimeModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  const slots = [
    { day: 'Today', time: '6:00 PM – 8:00 PM', friends: ['Sidhi', 'Rohan'] },
    { day: 'Tomorrow', time: '11:00 AM – 1:00 PM', friends: ['Meher'] },
    { day: 'Saturday', time: '3:00 PM – 6:00 PM', friends: ['Sidhi', 'Rohan', 'Meher'] },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Common Free Time</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-5 space-y-3">
          {slots.map((s, i) => (
            <div key={i} className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 hover:border-blue-500/50 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <p className="text-white font-semibold">{s.day}</p>
                <span className="text-xs text-blue-300 bg-blue-500/10 px-2 py-1 rounded-full">{s.friends.length} friend{s.friends.length > 1 ? 's' : ''} free</span>
              </div>
              <p className="text-blue-400 font-medium">{s.time}</p>
              <p className="text-xs text-gray-400 mt-1">{s.friends.join(', ')}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);
  const [isFriendsOpen, setIsFriendsOpen] = useState(false);
  const [isCommonTimeOpen, setIsCommonTimeOpen] = useState(false);

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
          <button 
            onClick={logout}
            className="flex items-center gap-2 bg-red-500/10 text-red-400 px-4 py-2.5 rounded-xl hover:bg-red-500/20 transition-all font-medium"
          >
            <LogOut size={18} />
            <span className="hidden md:inline">Logout</span>
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900 p-6 rounded-2xl flex flex-col justify-center border border-gray-800 hover:border-gray-700 transition-colors shadow-sm relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Calendar size={100} />
            </div>
            <h2 className="text-gray-400 text-sm font-medium mb-2 flex items-center gap-2">
              <Calendar size={16} className="text-blue-400"/> Next Free Slot
            </h2>
            <p className="text-2xl font-semibold text-blue-400">Today, 6:00 PM</p>
            <p className="text-gray-500 text-sm mt-1">You have 2 hours free block</p>
          </div>
          
          <div className="bg-gray-900 p-6 rounded-2xl flex flex-col justify-center border border-gray-800 hover:border-gray-700 transition-colors shadow-sm relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Users size={100} />
            </div>
            <h2 className="text-gray-400 text-sm font-medium mb-2 flex items-center gap-2">
              <Users size={16} className="text-purple-400"/> Upcoming Meetup
            </h2>
            <p className="text-2xl font-semibold text-purple-400">Coffee w/ Sidhi</p>
            <p className="text-gray-500 text-sm mt-1">Tomorrow, 4:00 PM</p>
          </div>

          <div className="bg-gray-900 p-6 rounded-2xl flex flex-col justify-center border border-gray-800 hover:border-gray-700 transition-colors shadow-sm relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Activity size={100} />
            </div>
            <h2 className="text-gray-400 text-sm font-medium mb-2 flex items-center gap-2">
              <Activity size={16} className="text-green-400"/> Friendship Score
            </h2>
            <p className="text-2xl font-semibold text-green-400">92%</p>
            <p className="text-gray-500 text-sm mt-1 text-green-500/70">+5% from last week</p>
          </div>
        </div>

        <section className="bg-gray-900/40 p-6 rounded-2xl border border-gray-800">
          <h2 className="text-lg font-semibold mb-4 text-gray-200">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setIsCommonTimeOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-blue-500/20"
            >
              Find Common Time
            </button>
            <button
              onClick={() => setIsPlannerOpen(true)}
              className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-medium transition-colors border border-gray-700"
            >
              Ask AI Planner
            </button>
            <button
              onClick={() => setIsFriendsOpen(true)}
              className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-medium transition-colors border border-gray-700"
            >
              Manage Friends
            </button>
          </div>
        </section>
      </div>

      <AIPlannerModal
        isOpen={isPlannerOpen}
        onClose={() => setIsPlannerOpen(false)}
        user={user}
      />
      <ManageFriendsModal
        isOpen={isFriendsOpen}
        onClose={() => setIsFriendsOpen(false)}
      />
      <FindCommonTimeModal
        isOpen={isCommonTimeOpen}
        onClose={() => setIsCommonTimeOpen(false)}
      />
    </div>
  );
}
