import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/onboarding');
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white">
      <div className="flex flex-col items-center space-y-4 animate-pulse">
        <div className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50">
          <span className="text-4xl font-bold">O</span>
        </div>
        <h1 className="text-4xl font-bold tracking-widest bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          ORBIT
        </h1>
      </div>
    </div>
  );
}
