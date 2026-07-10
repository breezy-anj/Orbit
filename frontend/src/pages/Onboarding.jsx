import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Zap } from 'lucide-react';

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const slides = [
    {
      icon: <Users size={80} className="text-blue-400" />,
      title: "Keep Friendships Alive",
      description: "Don't let busy schedules ruin meaningful connections."
    },
    {
      icon: <Calendar size={80} className="text-purple-400" />,
      title: "Smart Scheduling",
      description: "Automatically find overlapping free time without the back-and-forth."
    },
    {
      icon: <Zap size={80} className="text-green-400" />,
      title: "Work-Life Balance",
      description: "Stay productive without sacrificing your mental well-being."
    }
  ];

  const handleNext = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white p-6">
      <div className="max-w-md w-full flex flex-col items-center text-center space-y-12">
        <div className="h-48 flex items-end justify-center animate-bounce">
          {slides[step].icon}
        </div>
        
        <div className="space-y-4 min-h-[120px]">
          <h2 className="text-3xl font-bold">{slides[step].title}</h2>
          <p className="text-gray-400 leading-relaxed">{slides[step].description}</p>
        </div>

        <div className="flex gap-3 mb-8">
          {slides.map((_, index) => (
            <div 
              key={index} 
              className={`h-2 w-10 rounded-full transition-all duration-300 ${index === step ? 'bg-blue-500 w-16' : 'bg-gray-800'}`}
            />
          ))}
        </div>

        <div className="w-full space-y-4 pt-4">
          <button 
            onClick={handleNext}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20 text-lg"
          >
            {step === slides.length - 1 ? "Get Started" : "Next"}
          </button>
          
          <button 
            onClick={() => navigate('/login')}
            className="w-full text-gray-500 hover:text-gray-300 py-2 transition-colors font-medium"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
