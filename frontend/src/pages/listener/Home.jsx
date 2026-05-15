import TopNav from '../../components/layout/TopNav';
import SongCard from '../../components/shared/SongCard';
import { useDataStore } from '../../store/useDataStore';

export default function Home() {
  const { library, history } = useDataStore();

  const trending = library.slice(0, 6);
  const recent = history.length > 0 ? history.slice(0, 6) : library.slice(2, 8);

  return (
    <div className="flex-1 bg-gradient-to-b from-[#1a1a1a] to-yeah-bg overflow-y-auto no-scrollbar pb-32">
      <TopNav />

      <div className="px-8 py-6">
        <h1 className="text-3xl font-bold text-white mb-6 mt-2">Good Evening</h1>

        <h2 className="text-xl font-bold text-white mb-4">Trending Now</h2>
        {trending.length === 0 ? (
          <div className="bg-[#141414] border border-gray-800 rounded-2xl p-6 text-gray-400">
            No tracks yet. Upload a song to start the library.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {trending.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        )}

        <h2 className="text-xl font-bold text-white mb-4 mt-12">Recently Played</h2>
        {recent.length === 0 ? (
          <div className="bg-[#141414] border border-gray-800 rounded-2xl p-6 text-gray-400">
            Play a track to see your listening history here.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {recent.map((song) => (
              <SongCard key={`recent-${song.id}`} song={song} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
