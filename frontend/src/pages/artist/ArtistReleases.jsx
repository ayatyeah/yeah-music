import { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, Save, Trash2, X } from 'lucide-react';
import TopNav from '../../components/layout/TopNav';
import LyricsEditor from '../../components/artist/LyricsEditor';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import { getAudioBlob } from '../../services/localMedia';
import { getTrackCover } from '../../utils/cover';

export default function ArtistReleases() {
  const { library, updateTrack, deleteTrack, isLoading } = useDataStore();
  const user = useAuthStore((state) => state.user);
  const [editingTrack, setEditingTrack] = useState(null);
  const userId = user?.id;
  const username = user?.username;

  const artistReleases = useMemo(
    () =>
      library.filter(
        (track) =>
          track.artistId === userId ||
          (!track.artistId && username && track.artist?.toLowerCase() === username.toLowerCase())
      ),
    [library, userId, username]
  );

  const handleDelete = async (track) => {
    const confirmed = window.confirm(`Delete "${track.title}"? This cannot be undone.`);
    if (!confirmed) return;
    await deleteTrack(track.id, user);
  };

  return (
    <div className="flex-1 bg-yeah-bg overflow-y-auto no-scrollbar pb-48 md:pb-32">
      <TopNav />
      <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">Release Manager</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {artistReleases.map((track) => (
            <div key={track.id} className="bg-[#151515] border border-gray-800 rounded-2xl p-4">
              <img src={getTrackCover(track)} alt={track.title} className="w-full h-40 object-cover rounded-xl" />
              <div className="mt-4">
                <h3 className="text-white font-semibold">{track.title}</h3>
                <p className="text-gray-400 text-sm">{track.artist}</p>
                <div className="text-xs text-gray-500 mt-2">{track.plays?.toLocaleString()} streams</div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setEditingTrack(track)}
                  className="flex-1 bg-[#222] text-white py-2 rounded-lg text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(track)}
                  disabled={isLoading}
                  className="flex-1 bg-red-950/70 text-red-100 py-2 rounded-lg text-sm inline-flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Trash2 size={15} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editingTrack && (
        <EditReleaseModal
          track={editingTrack}
          userId={user?.id}
          isLoading={isLoading}
          onClose={() => setEditingTrack(null)}
          onSave={async (trackId, updates, userId) => {
            await updateTrack(trackId, updates, userId);
            setEditingTrack(null);
          }}
        />
      )}
    </div>
  );
}

function EditReleaseModal({ track, userId, isLoading, onClose, onSave }) {
  const [form, setForm] = useState({
    title: track.title || '',
    album: track.album || '',
    genre: track.genre || '',
    description: track.description || '',
    lyrics: track.lyrics || '',
    cover: track.cover || '',
  });
  const [audioSrc, setAudioSrc] = useState(track.audioUrl || track.previewUrl || '');
  const [coverFileUrl, setCoverFileUrl] = useState('');

  useEffect(() => {
    let objectUrl = '';
    let cancelled = false;

    const loadAudio = async () => {
      if (track.audioUrl || track.previewUrl || !track.audioId) return;
      const blob = await getAudioBlob(track.audioId);
      if (!blob || cancelled) return;
      objectUrl = URL.createObjectURL(blob);
      setAudioSrc(objectUrl);
    };

    loadAudio();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [track.audioId, track.audioUrl, track.previewUrl]);

  useEffect(() => {
    return () => {
      if (coverFileUrl) URL.revokeObjectURL(coverFileUrl);
    };
  }, [coverFileUrl]);

  const updateField = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

  const handleCoverFile = async (file) => {
    if (!file) return;
    if (coverFileUrl) URL.revokeObjectURL(coverFileUrl);
    setCoverFileUrl(URL.createObjectURL(file));
    updateField('cover', await readFileAsDataUrl(file));
  };

  const submit = async (event) => {
    event.preventDefault();
    await onSave(track.id, form, userId);
  };

  const coverPreview = coverFileUrl || form.cover || getTrackCover({ ...track, ...form });

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-5xl max-h-[92vh] overflow-y-auto no-scrollbar bg-[#141414] border border-gray-800 rounded-2xl"
      >
        <div className="sticky top-0 bg-[#141414] border-b border-gray-800 px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-white">Edit Release</h2>
            <p className="text-sm text-gray-400">{track.artist}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-lg bg-[#222] text-white inline-flex items-center justify-center"
            aria-label="Close editor"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
            <div>
              <img src={coverPreview} alt="" className="w-full aspect-square rounded-xl object-cover mb-4" />
              <label className="border border-dashed border-gray-700 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-yeah-accent/50 transition-colors">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(event) => handleCoverFile(event.target.files[0])}
                />
                <Image size={24} className="text-yeah-accent mb-2" />
                <span className="text-sm text-white font-semibold">Upload cover art</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 self-start">
              <Input label="Title" value={form.title} onChange={(value) => updateField('title', value)} />
              <Input label="Album" value={form.album} onChange={(value) => updateField('album', value)} />
              <Input label="Genre" value={form.genre} onChange={(value) => updateField('genre', value)} />
              <Input
                label="Description"
                value={form.description}
                onChange={(value) => updateField('description', value)}
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Lyrics</h3>
            <LyricsEditor
              value={form.lyrics}
              onChange={(value) => updateField('lyrics', value)}
              audioSrc={audioSrc}
              compact
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-[#141414] border-t border-gray-800 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-[#222] text-white">
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !form.title}
            className="px-5 py-2 rounded-lg bg-yeah-accent text-black font-bold inline-flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <Save size={17} /> Save
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({ label, value, onChange }) {
  return (
    <div>
      <label className="text-xs uppercase text-gray-500">{label}</label>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-[#1c1c1c] text-white rounded-lg px-3 py-2 border border-gray-800 focus:border-yeah-accent outline-none mt-2"
      />
    </div>
  );
}
