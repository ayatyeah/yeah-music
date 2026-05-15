import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Activity, Heart, Plus, ListMusic } from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useDataStore } from '../../store/useDataStore';
import { getTrackCover } from '../../utils/cover';

export default function SongCard({ song }) {
  const { currentTrack, isPlaying, playTrack, togglePlay, addToQueueNext } = usePlayerStore();
  const { playlists, addTrackToPlaylist, likedSongs, likeTrack } = useDataStore();
  const isThisPlaying = currentTrack?.id === song.id;
  const [menuOpen, setMenuOpen] = useState(false);
  const isLiked = likedSongs.includes(song.id);
  const coverUrl = getTrackCover(song);

  const handlePlayClick = () => {
    if (isThisPlaying) {
      togglePlay();
    } else {
      playTrack(song);
    }
  };

  return (
    <motion.div
      whileHover={{ backgroundColor: '#282828', y: -4 }}
      onClick={handlePlayClick}
      className={`bg-[#181818] p-4 rounded-xl cursor-pointer group transition-all duration-300 relative border ${
        isThisPlaying ? 'border-yeah-accent/50' : 'border-transparent'
      }`}
    >
      <div className="absolute top-3 left-3">
        <button
          onClick={(event) => {
            event.stopPropagation();
            likeTrack(song.id);
          }}
          className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center"
        >
          <Heart size={14} className={isLiked ? 'text-yeah-accent fill-yeah-accent' : 'text-gray-400'} />
        </button>
      </div>

      <div className="absolute top-3 right-3">
        <button
          onClick={(event) => {
            event.stopPropagation();
            setMenuOpen((value) => !value);
          }}
          className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-gray-300"
        >
          <Plus size={16} />
        </button>
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-44 bg-[#101010] border border-gray-800 rounded-lg p-2 z-20">
            <button
              onClick={(event) => {
                event.stopPropagation();
                addToQueueNext(song);
                setMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 px-2 py-2 text-sm text-gray-300 hover:text-white"
            >
              <ListMusic size={14} /> Queue next
            </button>
            <div className="mt-2 text-xs text-gray-500 px-2">Add to playlist</div>
            {playlists.length === 0 ? (
              <div className="text-xs text-gray-500 px-2 py-2">Create a playlist first.</div>
            ) : (
              playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={(event) => {
                    event.stopPropagation();
                    addTrackToPlaylist(playlist.id, song);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left text-xs text-gray-300 px-2 py-2 hover:text-white"
                >
                  {playlist.name}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="relative mb-4">
        <img src={coverUrl} alt={song.title} className="w-full aspect-square object-cover rounded-md shadow-lg" />

        <motion.button
          onClick={handlePlayClick}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: isThisPlaying ? 1 : 0, y: isThisPlaying ? 0 : 10 }}
          whileHover={{ scale: 1.1 }}
          className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-yeah-accent flex items-center justify-center group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-xl"
        >
          {isThisPlaying && isPlaying ? (
            <Pause size={24} className="text-black" fill="black" />
          ) : (
            <Play size={24} className="text-black ml-1" fill="black" />
          )}
        </motion.button>
      </div>

      <div className="flex justify-between items-start">
        <div className="min-w-0">
          <h3 className={`font-bold truncate ${isThisPlaying ? 'text-yeah-accent' : 'text-white'}`}>
            {song.title}
          </h3>
          <p className="text-gray-400 text-sm truncate mt-1">{song.artist}</p>
          <p className="text-gray-500 text-xs mt-2">
            {song.duration} · {song.plays?.toLocaleString()} plays
          </p>
        </div>
        {isThisPlaying && isPlaying && <Activity size={16} className="text-yeah-accent animate-pulse" />}
      </div>
    </motion.div>
  );
}