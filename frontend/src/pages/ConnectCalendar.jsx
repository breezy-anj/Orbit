import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';

export default function ConnectCalendar() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white p-6">
      <div className="max-w-md w-full bg-gray-900 p-10 rounded-3xl shadow-2xl text-center space-y-8 border border-gray-800">
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center">
            <Calendar size={48} className="text-blue-400" />
          </div>
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">Connect Calendar</h1>
          <p className="text-gray-400 text-sm leading-relaxed">Orbit needs access to your calendar to find overlapping free time with your friends.</p>
        </div>
        
        <div className="bg-gray-950 p-5 rounded-2xl text-left space-y-3 text-sm text-gray-300 border border-gray-800/50">
          <div className="flex gap-3 items-center"><span className="text-green-400 font-bold">✓</span> We only read free/busy status</div>
          <div className="flex gap-3 items-center"><span className="text-green-400 font-bold">✓</span> We never share event details</div>
          <div className="flex gap-3 items-center"><span className="text-green-400 font-bold">✓</span> Your privacy is fully preserved</div>
        </div>

        <div className="space-y-4 pt-2">
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20"
          >
            Connect Google Calendar
          </button>

          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full text-gray-500 hover:text-gray-300 py-2 transition-colors font-medium text-sm"
          >
            I'll do this later
          </button>
        </div>
      </div>
    </div>
  );
}
