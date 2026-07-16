import React, { useState } from 'react';
import { Sparkles, X, Clock, MapPin, Loader2, RefreshCw } from 'lucide-react';
import { fetchMeetupSuggestions } from '../services/aiService';

// TODO: once the Friends and Calendar features store real data, replace these
// mocks with whatever comes out of that context/API. The shape below is what
// the backend (and Gemini prompt) already expect, so nothing else changes.
const MOCK_FRIENDS = [
  { name: 'Sidhi', interests: ['coffee', 'hiking'], lastMet: '2 weeks ago' },
  { name: 'Rohan', interests: ['gaming', 'cricket'], lastMet: '1 month ago' },
  { name: 'Meher', interests: ['books', 'art galleries'], lastMet: '3 days ago' }
];

const MOCK_FREE_SLOTS = [
  { day: 'Today', time: '6:00 PM - 8:00 PM' },
  { day: 'Saturday', time: '11:00 AM - 2:00 PM' }
];

export default function AIPlannerModal({ isOpen, onClose, user }) {
  const [suggestions, setSuggestions] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMessage, setErrorMessage] = useState('');

  const runSuggestions = async () => {
    setStatus('loading');
    setErrorMessage('');
    try {
      const results = await fetchMeetupSuggestions({
        user: user ? { name: user.name } : undefined,
        friends: MOCK_FRIENDS,
        freeSlots: MOCK_FREE_SLOTS,
        preferences: { budget: 'medium', activityType: 'casual' }
      });
      setSuggestions(results || []);
      setStatus('success');
    } catch (err) {
      console.error(err);
      setErrorMessage(
        err.response?.data?.error || 'Something went wrong talking to the AI planner.'
      );
      setStatus('error');
    }
  };

  // Kick off a request the first time the modal opens.
  React.useEffect(() => {
    if (isOpen && status === 'idle') {
      runSuggestions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-purple-400" />
            <h2 className="text-lg font-semibold text-white">AI Meetup Planner</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4">
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-3">
              <Loader2 size={28} className="animate-spin text-purple-400" />
              <p>Finding the best time to see your friends...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-8 space-y-3">
              <p className="text-red-400">{errorMessage}</p>
              <button
                onClick={runSuggestions}
                className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-xl border border-gray-700 transition-colors"
              >
                <RefreshCw size={16} /> Try again
              </button>
            </div>
          )}

          {status === 'success' && suggestions.length === 0 && (
            <p className="text-gray-400 text-center py-8">
              No suggestions came back. Try adding more free time or friends.
            </p>
          )}

          {status === 'success' &&
            suggestions.map((s, i) => (
              <div
                key={i}
                className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 space-y-2 hover:border-purple-500/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white">{s.activity}</h3>
                  <span className="text-xs bg-purple-500/10 text-purple-300 px-2 py-1 rounded-full">
                    {s.friendName}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} /> {s.suggestedTime}
                    {s.duration ? ` · ${s.duration}` : ''}
                  </span>
                  {s.venueType && (
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} /> {s.venueType}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-300 italic">"{s.reason}"</p>
              </div>
            ))}
        </div>

        {status === 'success' && (
          <div className="p-4 border-t border-gray-800">
            <button
              onClick={runSuggestions}
              className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white py-2.5 rounded-xl border border-gray-700 transition-colors font-medium"
            >
              <RefreshCw size={16} /> Regenerate suggestions
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
