import { Search, Bell, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useNotificationStore } from '../../store/useNotificationStore';

export default function TopNav() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const addToast = useNotificationStore((state) => state.addToast);

  return (
    <div className="sticky top-0 h-16 bg-yeah-bg/80 backdrop-blur-md flex items-center justify-between px-8 z-40">
      {/* Navigation Arrows */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={() => navigate(1)}
          className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-md ml-8">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-white transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="What do you want to listen to?" 
            className="w-full bg-[#242424] text-white text-sm rounded-full py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all hover:bg-[#2a2a2a]"
          />
        </div>
      </div>

      {/* Profile & Notifications */}
      <div className="flex items-center gap-6 ml-8">
        <button
          onClick={() =>
            addToast({
              type: 'info',
              title: 'Notifications',
              message: 'No new alerts right now.',
            })
          }
          className="text-gray-400 hover:text-white transition-colors"
        >
          <Bell size={20} />
        </button>
        <button
          onClick={logout}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <LogOut size={18} />
        </button>
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 bg-black/60 hover:bg-[#282828] rounded-full p-1 pr-3 transition-colors"
        >
          <img 
            src={
              user?.avatar ||
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'
            }
            alt="Profile" 
            className="w-7 h-7 rounded-full object-cover"
          />
          <span className="text-sm font-bold text-white">{user?.username || 'YeahMusic'}</span>
        </button>
      </div>
    </div>
  );
}