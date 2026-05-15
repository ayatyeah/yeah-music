import TopNav from '../../components/layout/TopNav';
import { useDataStore } from '../../store/useDataStore';
import { getTrackCover } from '../../utils/cover';

export default function History() {
  const { history } = useDataStore();

  return (
    <div className="flex-1 bg-yeah-bg overflow-y-auto no-scrollbar pb-32">
      <TopNav />
      <div className="px-8 py-6">
        <h1 className="text-3xl font-bold text-white mb-6">Listening History</h1>

        {history.length === 0 ? (
          <p className="text-gray-500">No listening history yet.</p>
        ) : (
          <div className="space-y-4">
            {history.map((track) => (
              <div key={track.id} className="flex items-center gap-4 bg-[#151515] border border-gray-800 rounded-xl p-4">
                <img src={getTrackCover(track)} alt={track.title} className="w-14 h-14 rounded-md" />
                <div className="flex-1">
                  <h3 className="text-white font-semibold">{track.title}</h3>
                  <p className="text-gray-400 text-sm">{track.artist}</p>
                </div>
                <div className="text-xs text-gray-500">{new Date(track.lastPlayedAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
