import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import TopNav from '../../components/layout/TopNav';
import { useDataStore } from '../../store/useDataStore';
import SongCard from '../../components/shared/SongCard';
import { getPlaylistCover } from '../../utils/cover';

export default function PlaylistDetails() {
  const { playlistId } = useParams();
  const { playlists } = useDataStore();

  const playlist = useMemo(
    () => playlists.find((entry) => entry.id === playlistId),
    [playlists, playlistId]
  );

  if (!playlist) {
    return (
      <div className="flex-1 bg-yeah-bg">
        <TopNav />
        <div className="px-8 py-12 text-gray-400">Playlist not found.</div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-yeah-bg overflow-y-auto no-scrollbar pb-32">
      <TopNav />
      <div className="px-8 py-6">
        <div className="flex items-center gap-6">
          <img src={getPlaylistCover(playlist)} alt={playlist.name} className="w-32 h-32 rounded-xl" />
          <div>
            <p className="text-xs uppercase text-gray-500">Playlist</p>
            <h1 className="text-3xl font-bold text-white">{playlist.name}</h1>
            <p className="text-gray-400 mt-2">{playlist.description || 'Curated just for you.'}</p>
          </div>
        </div>

        <div className="mt-10">
          {playlist.tracks.length === 0 ? (
            <p className="text-gray-500">No tracks yet. Add a song to get started.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {playlist.tracks.map((song) => (
                <SongCard key={song.id} song={song} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
