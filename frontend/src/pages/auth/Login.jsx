import { useState } from 'react';
import { Mail, Lock, Music, Disc } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const [isArtist, setIsArtist] = useState(false);
  const { login, isLoading, error, rememberMe, setRememberMe } = useAuthStore();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await login({
      email: form.email,
      password: form.password,
      rememberMe,
      role: isArtist ? 'artist' : 'listener',
    });
    navigate(result.user.role === 'artist' ? '/artist/dashboard' : '/');
  };

  return (
    <div className="min-h-screen w-full flex bg-black">
      {/* Left: Animated Brand Panel */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-yeah-accent/20 to-black z-10" />
        <motion.div 
          animate={{ scale: [1, 1.05, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="w-96 h-96 bg-yeah-accent rounded-full blur-[120px] opacity-30 absolute"
        />
        <div className="z-20 text-center">
          <h1 className="text-6xl font-bold text-white mb-4 tracking-tighter">YeahMusic</h1>
          <p className="text-gray-400 text-lg">The next generation of audio delivery.</p>
        </div>
      </div>

      {/* Right: Glassmorphism Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-yeah-bg px-4 py-6 sm:p-8 relative">
        <div className="w-full max-w-md backdrop-blur-xl bg-white/[0.02] border border-white/10 p-5 sm:p-10 rounded-2xl shadow-2xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-sm sm:text-base text-gray-400 mb-6 sm:mb-8">Sign in to your account</p>

          {/* Role Toggle */}
          <div className="flex bg-[#121212] rounded-lg p-1 mb-6 sm:mb-8">
            <button 
              onClick={() => setIsArtist(false)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${!isArtist ? 'bg-[#282828] text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Music size={16} className="inline mr-2" /> Listener
            </button>
            <button 
              onClick={() => setIsArtist(true)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${isArtist ? 'bg-[#282828] text-yeah-accent shadow' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Disc size={16} className="inline mr-2" /> Artist
            </button>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                className="w-full bg-[#181818] border border-gray-800 text-white rounded-lg py-3 pl-10 pr-4 focus:border-yeah-accent focus:ring-1 focus:ring-yeah-accent outline-none transition-all"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                className="w-full bg-[#181818] border border-gray-800 text-white rounded-lg py-3 pl-10 pr-4 focus:border-yeah-accent focus:ring-1 focus:ring-yeah-accent outline-none transition-all"
                required
              />
            </div>

            <label className="flex items-center gap-3 text-sm text-gray-400">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="accent-yeah-accent"
              />
              Remember me on this device
            </label>

            {error && (
              <div className="bg-red-500/10 text-red-300 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-yeah-accent hover:bg-[#1cd05a] text-black font-bold py-3 rounded-lg mt-4 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="text-sm text-gray-400 mt-6">
            New here?{' '}
            <Link to="/register" className="text-yeah-accent font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
