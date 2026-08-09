import React, { useState, useContext } from 'react';
import {
  Sparkles, X, Clock, MapPin, Loader2, RefreshCw,
  Send, ChevronDown, ChevronUp, Check,
} from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';

async function fetchMeetupSuggestions(payload) {
  const res = await axios.post(`${API}/api/ai/meetup-suggestions`, payload);
  return res.data.suggestions;
}

function SuggestionCard({ s, index, friends, onSent }) {
  const [sending,  setSending]  = useState(false);
  const [sent,     setSent]     = useState(false);
  const [error,    setError]    = useState('');

  const friend = friends.find(f =>
    f.name?.toLowerCase() === s.friendName?.toLowerCase()
  );

  const handleSend = async () => {
    if (!friend?.id) {
      setError('Friend not found in list.');
      return;
    }
    
    // Fallback if AI didn't provide exact ISOs (defaults to tomorrow)
    const startIso = s.startIso || new Date(Date.now() + 24 * 3600 * 1000).toISOString();
    const endIso = s.endIso || new Date(Date.now() + 26 * 3600 * 1000).toISOString();

    setSending(true);
    setError('');
    try {
      await axios.post(`${API}/api/meetups/request`, {
        friendId:  friend.id,
        title:     s.activity,
        startTime: startIso,
        endTime:   endIso,
        note:      s.reason,
      });
      setSent(true);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to send request.');
      setSending(false);
    }
  };

  return (
    <div className={`border rounded-xl p-4 space-y-2 transition-all
                     ${sent
                       ? 'bg-green-900/20 border-green-600/40'
                       : 'bg-gray-800/60 border-gray-700 hover:border-purple-500/50'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-white text-sm">{s.activity}</h3>
            <span className="text-xs bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded-full flex-shrink-0">
              {s.friendName}
            </span>
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-gray-400 mt-1.5">
            <span className="flex items-center gap-1">
              <Clock size={11} /> {s.suggestedTime}
            </span>
            {s.venueType && (
              <span className="flex items-center gap-1">
                <MapPin size={11} /> {s.venueType}
              </span>
            )}
          </div>

          <p className="text-xs text-gray-300 italic mt-1.5">"{s.reason}"</p>
          {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        </div>

        {sent ? (
          <span className="flex items-center gap-1 text-green-400 text-xs flex-shrink-0">
            <Check size={14} /> Sent!
          </span>
        ) : (
          <button
            onClick={handleSend}
            disabled={sending || !friend}
            className="flex items-center gap-1.5 text-xs bg-purple-600 hover:bg-purple-500
                       text-white px-3 py-2 rounded-lg transition-colors flex-shrink-0 font-medium"
          >
            {sending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
            {sending ? 'Sending...' : 'Create Event'}
          </button>
        )}
      </div>
    </div>
  );
}

export default function AIPlannerModal({ isOpen, onClose, user, friends = [], freeSlots = [] }) {
  const [suggestions,   setSuggestions]   = useState([]);
  const [status,        setStatus]        = useState('idle');
  const [errorMessage,  setErrorMessage]  = useState('');

  const runSuggestions = async () => {
    setStatus('loading');
    setErrorMessage('');
    try {
      const results = await fetchMeetupSuggestions({
        user:        user ? { name: user.name } : undefined,
        friends:     friends.length > 0 ? friends : [{ name: 'a friend', interests: [], lastMet: 'recently' }],
        freeSlots,
        preferences: { budget: 'medium', activityType: 'varied' },
      });
      setSuggestions(results || []);
      setStatus('success');
    } catch (err) {
      console.error(err);
      setErrorMessage(err.response?.data?.error || 'Something went wrong talking to the AI planner.');
      setStatus('error');
    }
  };

  React.useEffect(() => {
    if (isOpen && status === 'idle') runSuggestions();
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen) setStatus('idle');
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        {}
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-purple-400" />
            <h2 className="text-lg font-semibold text-white">AI Meetup Planner</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {}
        <div className="p-5 max-h-[65vh] overflow-y-auto space-y-3">
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-3">
              <Loader2 size={28} className="animate-spin text-purple-400" />
              <p className="text-sm">Finding the best time to see your friends…</p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-8 space-y-3">
              <p className="text-red-400 text-sm">{errorMessage}</p>
              <button
                onClick={runSuggestions}
                className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white
                           px-4 py-2 rounded-xl border border-gray-700 transition-colors text-sm"
              >
                <RefreshCw size={14} /> Try again
              </button>
            </div>
          )}

          {status === 'success' && suggestions.length === 0 && (
            <p className="text-gray-400 text-center py-8 text-sm">
              No suggestions came back. Try syncing your calendar or adding friends first.
            </p>
          )}

          {status === 'success' && suggestions.map((s, i) => (
            <SuggestionCard
              key={i}
              s={s}
              index={i}
              friends={friends}
              onSent={() => {}}
            />
          ))}
        </div>

        {}
        {status === 'success' && (
          <div className="p-4 border-t border-gray-800">
            <button
              onClick={runSuggestions}
              className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700
                         text-white py-2.5 rounded-xl border border-gray-700 transition-colors font-medium text-sm"
            >
              <RefreshCw size={14} /> Regenerate suggestions
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
