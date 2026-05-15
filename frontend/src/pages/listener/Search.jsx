import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import TopNav from '../../components/layout/TopNav';
import SongCard from '../../components/shared/SongCard';
import { getPlaylistCover } from '../../utils/cover';
import useDebounce from '../../hooks/useDebounce';
import { useDataStore } from '../../store/useDataStore';

const tabs = ['all', 'songs', 'artists', 'playlists'];

export default function Search() {
  const { library, artists, playlists, recentSearches, addRecentSearch } = useDataStore();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const debounced = useDebounce(query, 300);

  const results = useMemo(() => {
    if (!debounced) {
      return {
        songs: library,
        artists,
        playlists,
      };
    }

    const term = debounced.toLowerCase();
    return {
      songs: library.filter((song) =>
        `${song.title} ${song.artist} ${song.genre}`.toLowerCase().includes(term)
      ),
      artists: artists.filter((artist) => artist.name.toLowerCase().includes(term)),
      playlists: playlists.filter((playlist) => playlist.name.toLowerCase().includes(term)),
    };
  }, [debounced, library, artists, playlists]);

  const handleSearch = (value) => {
    setQuery(value);
    if (value.trim().length > 2) addRecentSearch(value.trim());
  };

  const visibleSongs = activeTab === 'all' || activeTab === 'songs' ? results.songs : [];
  const visibleArtists = activeTab === 'all' || activeTab === 'artists' ? results.artists : [];
  const visiblePlaylists = activeTab === 'all' || activeTab === 'playlists' ? results.playlists : [];

  return (
    <div className="flex-1 bg-yeah-bg overflow-y-auto no-scrollbar pb-32">
      <TopNav />
      <div className="px-8 py-6">
        <h1 className="text-3xl font-bold text-white mb-4">Search</h1>
        <input
          value={query}
          onChange={(event) => handleSearch(event.target.value)}
          placeholder="Search songs, artists, playlists"
          className="w-full max-w-xl bg-[#1c1c1c] text-white rounded-xl px-4 py-3 border border-gray-800 focus:border-yeah-accent outline-none"
        />

        <div className="flex gap-2 mt-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                activeTab === tab ? 'bg-yeah-accent text-black' : 'bg-[#1c1c1c] text-gray-300'
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {recentSearches.length > 0 && (
          <div className="mt-6 text-sm text-gray-400">
            Recent: {recentSearches.join(' · ')}
          </div>
        )}

        <div className="mt-8">
          <Section title="Songs" items={visibleSongs.length}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {visibleSongs.map((song) => (
                <SongCard key={song.id} song={song} />
              ))}
            </div>
          </Section>

          <Section title="Artists" items={visibleArtists.length}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {visibleArtists.map((artist) => (
                <div key={artist.id} className="bg-[#151515] p-4 rounded-xl border border-gray-800">
                  <img src={artist.avatar} alt={artist.name} className="w-14 h-14 rounded-full" />
                  <h3 className="text-white font-semibold mt-3">{artist.name}</h3>
                  <p className="text-xs text-gray-400">{artist.followers.toLocaleString()} followers</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Playlists" items={visiblePlaylists.length}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {visiblePlaylists.map((playlist) => (
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
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, items, children }) {
  if (!items) {
    return (
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <p className="text-gray-500 text-sm mt-2">No results found.</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold text-white mb-4">{title}</h2>
      {children}
    </div>
  );
}
