import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  Calendar, Users, Activity, LogOut, X, UserPlus, Trash2,
  Loader2, RefreshCw, CalendarCheck, Clock, CheckCircle2,
  Bell, ThumbsUp, ThumbsDown,
} from 'lucide-react';
import AIPlannerModal from '../components/AIPlannerModal';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function ManageFriendsModal({ isOpen, onClose, friends, onFriendsChange }) {
  const [newEmail, setNewEmail] = useState('');
  const [error, setError]       = useState('');
  if (!isOpen) return null;

  const addFriend = async () => {
    if (!newEmail.trim()) return;
    setError('');
    try {
      await axios.post(`${API}/api/friends`, { friendEmail: newEmail.trim() });
      setNewEmail('');
      onFriendsChange();
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to add friend');
    }
  };

  const removeFriend = async (friendId) => {
    await axios.delete(`${API}/api/friends/${friendId}`);
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
          {friends.length === 0 && (
            <p className="text-gray-500 text-center py-4">No friends yet. Add one below!</p>
          )}
          {friends.map((f) => (
            <div key={f.id} className="flex items-center justify-between bg-gray-800/60
                                       border border-gray-700 rounded-xl px-4 py-3">
              <div>
                <p className="text-white font-medium">{f.name}</p>
                <p className="text-xs text-gray-400">{f.email}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Last met: {f.last_met ? new Date(f.last_met).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
              <button onClick={() => removeFriend(f.id)}
                      className="text-red-400 hover:text-red-300 transition-colors ml-3">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        <div className="p-5 border-t border-gray-800 space-y-2">
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <p className="text-xs text-gray-500">
            Add friends by their Google account email address.
          </p>
          <div className="flex gap-3">
            <input
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addFriend()}
              placeholder="friend@gmail.com"
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5
                         text-white placeholder-gray-500 focus:outline-none focus:border-purple-500
                         transition-colors"
            />
            <button onClick={addFriend}
                    className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2.5
                               rounded-xl transition-colors flex items-center gap-2 font-medium">
              <UserPlus size={16} /> Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function UpcomingEventsModal({ isOpen, onClose, events }) {
  if (!isOpen) return null;
  const fmt = (iso) => new Date(iso).toLocaleString('en-IN', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <CalendarCheck size={20} className="text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Upcoming Events</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
          {(!events || events.length === 0) ? (
            <p className="text-gray-400 text-center py-8 text-sm">
              No upcoming events found. Sync your calendar to see them here.
            </p>
          ) : events.map((ev) => {
            const others = (ev.attendees || []).filter(a => a.email !== ev.host_email);
            return (
              <div key={ev.id}
                   className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 space-y-1.5
                              hover:border-blue-500/40 transition-colors">
                <p className="text-white font-semibold text-sm">{ev.title}</p>
                <p className="text-blue-400 text-xs flex items-center gap-1.5">
                  <Clock size={12} /> {fmt(ev.start_time)}
                </p>
                {others.length > 0 && (
                  <p className="text-gray-400 text-xs flex items-center gap-1.5">
                    <Users size={12} />
                    {others.map(a => a.name || a.email).join(', ')}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub, color, onClick }) {
  return (
    <div onClick={onClick}
         className={`bg-gray-900 p-6 rounded-2xl flex flex-col justify-center border border-gray-800
                     hover:border-gray-600 transition-all shadow-sm relative overflow-hidden group
                     ${onClick ? 'cursor-pointer' : ''}`}>
      <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
        {React.cloneElement(icon, { size: 100 })}
      </div>
      <h2 className="text-gray-400 text-sm font-medium mb-2 flex items-center gap-2">
        {React.cloneElement(icon, { size: 16, className: `text-${color}-400` })} {label}
      </h2>
      <p className={`text-2xl font-semibold text-${color}-400 truncate`}>{value}</p>
      <p className="text-gray-500 text-sm mt-1">{sub}</p>
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);

  const [isPlannerOpen,    setIsPlannerOpen]    = useState(false);
  const [isFriendsOpen,    setIsFriendsOpen]    = useState(false);
  const [isEventsOpen,     setIsEventsOpen]     = useState(false);
  const [dashData,         setDashData]         = useState(null);
  const [friends,          setFriends]          = useState([]);
  const [pendingRequests,  setPendingRequests]  = useState([]);
  const [syncing,          setSyncing]          = useState(false);
  const [syncMessage,      setSyncMessage]      = useState('');
  const [responding,       setResponding]       = useState(null); // meetupId being responded to

  const fetchDashboard = () =>
    axios.get(`${API}/api/dashboard`).then(r => setDashData(r.data)).catch(() => {});

  const fetchFriends = () =>
    axios.get(`${API}/api/friends`).then(r => setFriends(r.data.friends)).catch(() => {});

  const fetchPendingRequests = () =>
    axios.get(`${API}/api/meetups/pending`).then(r => setPendingRequests(r.data.requests)).catch(() => {});

  useEffect(() => {
    fetchDashboard();
    fetchFriends();
    fetchPendingRequests();
  }, []);

  const respondToRequest = async (meetupId, response) => {
    setResponding(meetupId);
    try {
      const r = await axios.post(`${API}/api/meetups/${meetupId}/respond`, { response });
      const calMsg = r.data.calendarEventsCreated ? ' · Added to both Google Calendars!' : '';
      setSyncMessage(response === 'accepted' ? `✓ Meetup accepted!${calMsg}` : '✓ Request declined.');
      fetchPendingRequests();
      fetchDashboard();
      setTimeout(() => setSyncMessage(''), 7000);
    } catch (e) {
      setSyncMessage(`✗ ${e.response?.data?.error || 'Failed to respond'}`);
    } finally {
      setResponding(null);
    }
  };

  const handleSyncCalendar = async () => {
    setSyncing(true);
    setSyncMessage('');
    try {
      const r = await axios.post(`${API}/api/dashboard/sync-calendar`);
      setSyncMessage(`✓ ${r.data.message}`);
      fetchDashboard();
    } catch (e) {
      const msg = e.response?.data?.error || 'Sync failed';
      if (msg.includes('not connected')) {
        setSyncMessage('⚠ Connect Google Calendar first.');
      } else {
        setSyncMessage(`✗ ${msg}`);
      }
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMessage(''), 6000);
    }
  };

  const formatSlotTime = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    const isToday = d.toDateString() === new Date().toDateString();
    return (isToday ? 'Today, ' : d.toLocaleDateString('en-IN', { weekday: 'long' }) + ', ') +
      d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatMeetup = (m, isSynced) => {
    if (!m) {
      return { 
        title: 'No upcoming events', 
        time: isSynced ? 'Use AI Planner to schedule' : 'Sync your calendar' 
      };
    }
    return {
      title: m.title,
      time: new Date(m.start_time).toLocaleDateString('en-IN', {
        weekday: 'long', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      }),
    };
  };

  const isSynced = Boolean(dashData?.calendarSyncedAt);
  const meetup = formatMeetup(dashData?.upcomingMeetup, isSynced);

  const syncedAt = dashData?.calendarSyncedAt
    ? `Last synced ${new Date(dashData.calendarSyncedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
    : 'Not yet synced';

  const aiFriends = friends.map(f => ({
    id:        f.id,
    name:      f.name,
    interests: f.interests || [],
    lastMet:   f.last_met ? new Date(f.last_met).toLocaleDateString() : 'Unknown',
  }));

  const freeSlots = dashData?.nextFreeSlot ? [dashData.nextFreeSlot] : [];

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 md:p-10"
         style={{ fontFamily: "'Inter', 'Outfit', sans-serif" }}>
      <div className="max-w-5xl mx-auto space-y-8">

        {}
        <header className="flex justify-between items-center bg-gray-900/50 p-6
                           rounded-2xl border border-gray-800 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-tr from-blue-500 to-purple-500
                            rounded-full flex items-center justify-center text-lg font-bold shadow-lg">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Welcome back, {user?.name?.split(' ')[0] || 'User'}
              </h1>
              <p className="text-gray-400 text-sm mt-0.5">
                {user?.email} · {syncedAt}
              </p>
            </div>
          </div>
          <button onClick={logout}
                  className="flex items-center gap-2 bg-red-500/10 text-red-400 px-4 py-2.5
                             rounded-xl hover:bg-red-500/20 transition-all font-medium">
            <LogOut size={18} />
            <span className="hidden md:inline">Logout</span>
          </button>
        </header>

        {}
        {!dashData ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-gray-500" size={32} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              icon={<Calendar />} label="Next Free Slot" color="blue"
              value={dashData.nextFreeSlot ? formatSlotTime(dashData.nextFreeSlot.start_time) : 'None found'}
              sub={dashData.nextFreeSlot ? 'From your Google Calendar' : 'Sync calendar to populate'}
            />
            <StatCard
              icon={<CalendarCheck />} label="Upcoming Event" color="purple"
              value={meetup.title}
              sub={meetup.time}
              onClick={dashData.upcomingEvents?.length > 0 ? () => setIsEventsOpen(true) : undefined}
            />
            <StatCard
              icon={<Users />} label="Friends Connected" color="green"
              value={dashData.totalFriends || 0}
              sub="People you can schedule with"
              onClick={() => setIsFriendsOpen(true)}
            />
          </div>
        )}

        {}
        {dashData?.upcomingEvents?.length > 0 && (
          <section className="bg-gray-900/40 p-5 rounded-2xl border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                <CalendarCheck size={16} className="text-blue-400" /> Upcoming Events from Google Calendar
              </h2>
              <button onClick={() => setIsEventsOpen(true)}
                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                View all →
              </button>
            </div>
            <div className="space-y-2">
              {dashData.upcomingEvents.slice(0, 3).map(ev => {
                const others = (ev.attendees || []).filter(a => a.email !== user?.email);
                return (
                  <div key={ev.id}
                       className="flex items-center gap-4 bg-gray-800/40 border border-gray-700/50
                                  rounded-xl px-4 py-3">
                    <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar size={15} className="text-blue-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-sm font-medium truncate">{ev.title}</p>
                      <p className="text-gray-400 text-xs">
                        {new Date(ev.start_time).toLocaleString('en-IN', {
                          weekday: 'short', month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                        {others.length > 0 && ` · with ${others.map(a => a.name || a.email).join(', ')}`}
                      </p>
                    </div>
                    <CheckCircle2 size={16} className="text-green-500/60 flex-shrink-0" />
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {}
        {pendingRequests.length > 0 && (
          <section className="bg-gray-900/40 p-5 rounded-2xl border border-purple-500/30">
            <div className="flex items-center gap-2 mb-4">
              <Bell size={16} className="text-purple-400" />
              <h2 className="text-sm font-semibold text-gray-200">Pending Meetup Requests</h2>
              <span className="ml-auto text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full font-medium">
                {pendingRequests.length}
              </span>
            </div>
            <div className="space-y-3">
              {pendingRequests.map(req => (
                <div key={req.id}
                     className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-medium text-sm">{req.title}</p>
                      <p className="text-gray-400 text-xs mt-0.5">
                        From <span className="text-purple-300">{req.host_name}</span>
                        {' · '}
                        {new Date(req.start_time).toLocaleString('en-IN', {
                          weekday: 'short', month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                      {req.note && (
                        <p className="text-gray-400 text-xs italic mt-1">"{req.note}"</p>
                      )}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => respondToRequest(req.id, 'accepted')}
                        disabled={responding === req.id}
                        className="flex items-center gap-1 bg-green-600/20 hover:bg-green-600/40
                                   text-green-400 text-xs px-3 py-1.5 rounded-lg transition-colors"
                      >
                        {responding === req.id
                          ? <Loader2 size={11} className="animate-spin" />
                          : <ThumbsUp size={11} />}
                        Accept
                      </button>
                      <button
                        onClick={() => respondToRequest(req.id, 'declined')}
                        disabled={responding === req.id}
                        className="flex items-center gap-1 bg-red-600/20 hover:bg-red-600/40
                                   text-red-400 text-xs px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <ThumbsDown size={11} /> Decline
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {}
        <section className="bg-gray-900/40 p-6 rounded-2xl border border-gray-800">
          <h2 className="text-lg font-semibold mb-4 text-gray-200">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">

            {}
            <button
              id="sync-calendar-btn"
              onClick={handleSyncCalendar}
              disabled={syncing}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60
                         text-white px-5 py-3 rounded-xl font-medium transition-all shadow-lg
                         shadow-blue-500/20">
              {syncing
                ? <Loader2 size={16} className="animate-spin" />
                : <RefreshCw size={16} />}
              {syncing ? 'Syncing…' : 'Sync Calendar'}
            </button>

            <button
              onClick={() => setIsPlannerOpen(true)}
              className="bg-gray-800 hover:bg-gray-700 text-white px-5 py-3 rounded-xl
                         font-medium transition-colors border border-gray-700">
              Ask AI Planner
            </button>

            <button
              onClick={() => setIsFriendsOpen(true)}
              className="bg-gray-800 hover:bg-gray-700 text-white px-5 py-3 rounded-xl
                         font-medium transition-colors border border-gray-700">
              Manage Friends
            </button>
          </div>

          {}
          {syncMessage && (
            <p className={`mt-3 text-sm ${syncMessage.startsWith('✓') ? 'text-green-400' : 'text-yellow-400'}`}>
              {syncMessage}
            </p>
          )}
        </section>
      </div>

      {}
      <AIPlannerModal
        isOpen={isPlannerOpen}
        onClose={() => setIsPlannerOpen(false)}
        user={user}
        friends={aiFriends}
        freeSlots={freeSlots}
      />
      <ManageFriendsModal
        isOpen={isFriendsOpen}
        onClose={() => setIsFriendsOpen(false)}
        friends={friends}
        onFriendsChange={() => { fetchFriends(); fetchDashboard(); }}
      />
      <UpcomingEventsModal
        isOpen={isEventsOpen}
        onClose={() => setIsEventsOpen(false)}
        events={dashData?.upcomingEvents}
      />
    </div>
  );
}
