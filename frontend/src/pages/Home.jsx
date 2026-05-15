import TopNav from '../components/layout/TopNav';
import SongCard from '../components/shared/SongCard';
import { trendingSongs } from '../utils/mockData';

export default function Home() {
  return (
    <div className="flex-1 bg-gradient-to-b from-[#1a1a1a] to-yeah-bg overflow-y-auto no-scrollbar pb-32">
      <TopNav />

      <div className="px-8 py-6">
        <h1 className="text-3xl font-bold text-white mb-6 mt-2">Good Evening</h1>
        
        <h2 className="text-xl font-bold text-white mb-4">Trending Now</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {trendingSongs.map(song => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>

        <h2 className="text-xl font-bold text-white mb-4 mt-12">Recently Played</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {/* Reversing the array just to make the second row look slightly different for now */}
          {trendingSongs.slice().reverse().map(song => (
            <SongCard key={`recent-${song.id}`} song={song} />
          ))}
        </div>
      </div>
    </div>
  );
}