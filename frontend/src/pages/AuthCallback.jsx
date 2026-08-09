import React, { useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginFromCallback } = useContext(AuthContext);

  useEffect(() => {
    const token  = searchParams.get('token');
    const userId = searchParams.get('userId');
    const name   = searchParams.get('name');
    const email  = searchParams.get('email');
    const error  = searchParams.get('error');

    if (error) {
      navigate(`/login?error=${error}`);
      return;
    }

    if (!token || !userId) {
      navigate('/login?error=missing_params');
      return;
    }

    loginFromCallback(token, { id: userId, name, email });
    navigate('/connect-calendar');
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
      <div className="flex flex-col items-center gap-4 text-gray-400">
        <Loader2 size={36} className="animate-spin text-blue-400" />
        <p className="text-sm">Signing you in…</p>
      </div>
    </div>
  );
}
