import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Calendar, Users, Activity, LogOut } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);

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
            <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-blue-500/20">
              Find Common Time
            </button>
            <button className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-medium transition-colors border border-gray-700">
              Ask AI Planner
            </button>
            <button className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-medium transition-colors border border-gray-700">
              Manage Friends
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
