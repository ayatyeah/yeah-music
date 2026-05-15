import { useState } from 'react';
import { Link } from 'react-router-dom';
import TopNav from '../../components/layout/TopNav';
import { useDataStore } from '../../store/useDataStore';
import SongCard from '../../components/shared/SongCard';
import { getPlaylistCover } from '../../utils/cover';

export default function Library() {
  const { playlists, likedSongs, library, createPlaylist } = useDataStore();
  const [name, setName] = useState('');

  const likedTracks = library.filter((track) => likedSongs.includes(track.id));

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!name.trim()) return;
    await createPlaylist({ name: name.trim(), tracks: [] });
    setName('');
  };

  return (
    <div className="flex-1 bg-yeah-bg overflow-y-auto no-scrollbar pb-48 md:pb-32">
      <TopNav />
      <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">Your Library</h1>

        <div className="bg-[#141414] border border-gray-800 rounded-2xl p-4 sm:p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Create Playlist</h2>
          <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Playlist name"
              className="flex-1 bg-[#1c1c1c] text-white rounded-lg px-4 py-3 border border-gray-800 focus:border-yeah-accent outline-none"
            />
            <button className="bg-yeah-accent text-black px-6 py-3 rounded-lg font-semibold">Create</button>
          </form>
        </div>

        <section>
          <h2 className="text-xl font-semibold text-white mb-4">Playlists</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {playlists.map((playlist) => (
              <Link
                key={playlist.id}
                to={`/playlist/${playlist.id}`}
                className="bg-[#151515] p-4 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors"
              >
                <img src={getPlaylistCover(playlist)} alt={playlist.name} className="w-full h-32 object-cover rounded-lg" />
                <h3 className="text-white font-semibold mt-3">{playlist.name}</h3>
                <p className="text-xs text-gray-400">{playlist.tracks.length} tracks</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-white mb-4">Liked Songs</h2>
          {likedTracks.length === 0 ? (
            <p className="text-gray-500">No liked songs yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {likedTracks.map((song) => (
                <SongCard key={song.id} song={song} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
