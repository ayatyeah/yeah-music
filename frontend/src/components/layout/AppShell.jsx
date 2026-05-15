import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import PlayerBar from './PlayerBar';
import LyricsOverlay from './LyricsOverlay';

export default function AppShell() {
  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-yeah-base">
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0">
          <Outlet />
        </main>
      </div>
      <LyricsOverlay />
      <PlayerBar />
    </div>
  );
}
