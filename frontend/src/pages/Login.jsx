import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function Login() {
  const { loginWithGoogle, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  useEffect(() => {
    const err = searchParams.get('error');
    if (err === 'oauth_failed')   setErrorMsg('Google sign-in failed. Please try again.');
    if (err === 'missing_params') setErrorMsg('Something went wrong during sign-in. Please try again.');
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white p-4"
         style={{ fontFamily: "'Inter', 'Outfit', sans-serif" }}>

      {}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-700/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-md w-full bg-gray-900/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl
                      text-center space-y-8 border border-gray-800/60">

        {}
        <div className="space-y-3">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-600
                            flex items-center justify-center shadow-lg shadow-blue-500/25">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-white fill-current">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 2a8 8 0 110 16A8 8 0 0112 4z" opacity=".3"/>
                <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="12" cy="4"  r="1.5"/>
                <circle cx="12" cy="20" r="1.5"/>
                <circle cx="4"  cy="12" r="1.5"/>
                <circle cx="20" cy="12" r="1.5"/>
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-500
                         bg-clip-text text-transparent">
            Flowsphere
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            Keep friendships alive.<br />Manage your time intelligently.
          </p>
        </div>

        {}
        <div className="flex flex-wrap justify-center gap-2 text-xs">
          {['📅 Real calendar sync', '🤝 Friendship tracking', '🤖 AI meetup planner'].map(f => (
            <span key={f} className="bg-gray-800/80 border border-gray-700/50 text-gray-300
                                     px-3 py-1.5 rounded-full">
              {f}
            </span>
          ))}
        </div>

        {}
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm
                          rounded-xl px-4 py-3 text-left">
            {errorMsg}
          </div>
        )}

        {}
        <button
          id="google-signin-btn"
          onClick={loginWithGoogle}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100
                     text-gray-800 font-semibold py-3.5 rounded-xl transition-all duration-200
                     shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30
                     hover:-translate-y-0.5 active:translate-y-0"
        >
          {}
          <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <p className="text-xs text-gray-500">
          By signing in you agree to share your Google Calendar free/busy info
          to power smart scheduling. Event details stay private.
        </p>
      </div>
    </div>
  );
}
