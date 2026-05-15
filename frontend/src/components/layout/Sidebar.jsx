import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Library, UploadCloud, BarChart2, Settings, Clock, User, Disc3 } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useNotificationStore } from '../../store/useNotificationStore';

export default function Sidebar() {
  const { user } = useAuthStore();
  const addToast = useNotificationStore((state) => state.addToast);
  const location = useLocation();

  const listenerNav = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Discover', path: '/search' },
    { icon: Library, label: 'Your Library', path: '/library' },
    { icon: Clock, label: 'History', path: '/history' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  const artistNav = [
    { icon: UploadCloud, label: 'Upload Track', path: '/artist/upload' },
    { icon: Disc3, label: 'Releases', path: '/artist/releases' },
    { icon: BarChart2, label: 'SRE Dashboard', path: '/artist/dashboard' },
    { icon: BarChart2, label: 'Monitoring', path: '/artist/analytics' },
  ];

  return (
    <div className="w-64 bg-black h-full flex flex-col p-6 hidden md:flex border-r border-gray-800/50">
      <div className="text-white font-bold text-2xl tracking-tighter mb-10 flex items-center gap-2">
        <img src="/logo.png" alt="YeahMusic Logo" className="w-8 h-8 object-contain" />
        YeahMusic
      </div>
      
      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Discover</div>
      <nav className="flex flex-col gap-2 mb-8">
        {listenerNav.map((item) => (
          <Link key={item.label} to={item.path} className={`flex items-center gap-4 px-3 py-2.5 rounded-lg transition-all ${location.pathname === item.path ? 'bg-[#282828] text-white' : 'text-gray-400 hover:text-white'}`}>
            <item.icon size={20} className={location.pathname === item.path ? 'text-yeah-accent' : ''} />
            <span className="font-medium text-sm">{item.label}</span>
          </Link>
        ))}
      </nav>

      {user?.role === 'artist' && (
        <>
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Artist Tools</div>
          <nav className="flex flex-col gap-2 flex-1">
            {artistNav.map((item) => (
              <Link key={item.label} to={item.path} className={`flex items-center gap-4 px-3 py-2.5 rounded-lg transition-all ${location.pathname === item.path ? 'bg-[#282828] text-white' : 'text-gray-400 hover:text-white'}`}>
                <item.icon size={20} className={location.pathname === item.path ? 'text-yeah-accent' : ''} />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            ))}
          </nav>
        </>
      )}

      <div className="mt-auto pt-4 border-t border-gray-800">
        <button
          onClick={() =>
            addToast({
              type: 'info',
              title: 'Settings',
              message: 'Settings panel is coming soon.',
            })
          }
          className="flex items-center gap-4 text-gray-400 hover:text-white transition-colors w-full px-3 py-2 text-sm font-medium"
        >
          <Settings size={20} /> Settings
        </button>
      </div>
    </div>
  );
}
