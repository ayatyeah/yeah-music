import { useCallback, useEffect, useMemo, useState } from 'react';
import { UploadCloud, Music2, Image, FileAudio, AlertTriangle } from 'lucide-react';
import TopNav from '../../components/layout/TopNav';
import LyricsEditor from '../../components/artist/LyricsEditor';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import { saveAudioFile } from '../../services/localMedia';
import { getTrackCover } from '../../utils/cover';

const initialForm = {
  title: '',
  genre: 'Synthwave',
  album: '',
  description: '',
  lyrics: '',
};

export default function ArtistUpload() {
  const { uploadTrack, isLoading } = useDataStore();
  const user = useAuthStore((state) => state.user);
  const [form, setForm] = useState(initialForm);
  const [fileName, setFileName] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [audioFileUrl, setAudioFileUrl] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [coverFileUrl, setCoverFileUrl] = useState('');
  const [state, setState] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const coverPreview = useMemo(() => {
    if (coverFileUrl) return coverFileUrl;
    return getTrackCover({ title: form.title || 'New Release', artist: user?.username || '' });
  }, [coverFileUrl, form.title, user?.username]);

  useEffect(() => {
    return () => {
      if (coverFileUrl) {
        URL.revokeObjectURL(coverFileUrl);
      }
    };
  }, [coverFileUrl]);

  useEffect(() => {
    return () => {
      if (audioFileUrl) {
        URL.revokeObjectURL(audioFileUrl);
      }
    };
  }, [audioFileUrl]);

  const updateField = useCallback((key, value) => setForm((prev) => ({ ...prev, [key]: value })), []);
  const updateLyrics = useCallback((value) => updateField('lyrics', value), [updateField]);

  const handleFile = (file) => {
    if (!file) return;
    if (audioFileUrl) {
      URL.revokeObjectURL(audioFileUrl);
    }
    setFileName(file.name);
    setAudioFile(file);
    setAudioFileUrl(URL.createObjectURL(file));
  };

  const handleCoverFile = (file) => {
    if (!file) return;
    if (coverFileUrl) {
      URL.revokeObjectURL(coverFileUrl);
    }
    setCoverFile(file);
    setCoverFileUrl(URL.createObjectURL(file));
  };

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

  const simulateUpload = () =>
    new Promise((resolve) => {
      setState('uploading');
      setProgress(0);
      const timer = setInterval(() => {
        setProgress((prev) => {
          const next = prev + Math.floor(Math.random() * 12 + 6);
          if (next >= 100) {
            clearInterval(timer);
            resolve();
            return 100;
          }
          return next;
        });
      }, 200);
    });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!audioFile) {
      setError('Please select an audio file to upload.');
      setState('failed');
      return;
    }
    try {
      await simulateUpload();
      setState('processing');
      const audioId = await saveAudioFile(audioFile);
      const coverDataUrl = coverFile ? await readFileAsDataUrl(coverFile) : '';
      await uploadTrack({
        title: form.title,
        artist: user?.username || 'Artist',
        artistId: user?.id,
        genre: form.genre,
        album: form.album,
        description: form.description,
        lyrics: form.lyrics,
        cover: coverDataUrl || '',
        audioId,
        duration: '3:34',
      });
      setState('success');
      setForm(initialForm);
      setFileName('');
      setAudioFile(null);
      setAudioFileUrl('');
      setCoverFile(null);
      setCoverFileUrl('');
      setTimeout(() => setState('idle'), 2000);
    } catch (err) {
      setState('failed');
      setError(err.message);
    }
  };

  return (
    <div className="flex-1 bg-yeah-bg overflow-y-auto no-scrollbar pb-32">
      <TopNav />
      <div className="px-8 py-6">
        <h1 className="text-3xl font-bold text-white mb-6">Upload Manager</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="bg-[#141414] border border-gray-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Track Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Title" value={form.title} onChange={(value) => updateField('title', value)} />
                <Input label="Album" value={form.album} onChange={(value) => updateField('album', value)} />
                <Input label="Genre" value={form.genre} onChange={(value) => updateField('genre', value)} />
                <Input label="Description" value={form.description} onChange={(value) => updateField('description', value)} />
              </div>
            </div>

            <div className="bg-[#141414] border border-gray-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Lyrics</h2>
              <LyricsEditor
                value={form.lyrics}
                onChange={updateLyrics}
                audioSrc={audioFileUrl}
              />
            </div>

            <div className="bg-[#141414] border border-gray-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Cover Upload</h2>
              <label className="border-2 border-dashed border-gray-700 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-yeah-accent/50 transition-colors">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(event) => handleCoverFile(event.target.files[0])}
                />
                <Image size={36} className="text-yeah-accent mb-3" />
                <p className="text-white font-semibold">Upload cover art</p>
                <p className="text-xs text-gray-500 mt-2">PNG, JPG, WEBP supported</p>
              </label>
            </div>

            <div className="bg-[#141414] border border-gray-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Audio Upload</h2>
              <label className="border-2 border-dashed border-gray-700 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:border-yeah-accent/50 transition-colors">
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(event) => handleFile(event.target.files[0])}
                />
                <UploadCloud size={40} className="text-yeah-accent mb-4" />
                <p className="text-white font-semibold">Drag & drop or browse audio file</p>
                <p className="text-xs text-gray-500 mt-2">{fileName || 'WAV, FLAC, MP3 supported'}</p>
              </label>

              {state !== 'idle' && (
                <div className="mt-6">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Status: {state}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full mt-2">
                    <div className="h-2 bg-yeah-accent rounded-full" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              {state === 'failed' && (
                <div className="mt-4 text-sm text-red-300 flex items-center gap-2">
                  <AlertTriangle size={16} /> {error || 'Upload failed. Retry.'}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || state === 'uploading' || !form.title}
              className="w-full bg-yeah-accent text-black font-bold py-3 rounded-xl disabled:opacity-60"
            >
              {state === 'processing' ? 'Processing...' : state === 'success' ? 'Published!' : 'Publish Track'}
            </button>
          </form>

          <div className="space-y-6">
            <div className="bg-[#141414] border border-gray-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Release Preview</h2>
              <div className="flex items-center gap-4">
                <img src={coverPreview} alt="Cover" className="w-20 h-20 rounded-lg object-cover" />
                <div>
                  <p className="text-white font-semibold">{form.title || 'New Release'}</p>
                  <p className="text-gray-400 text-sm">{user?.username || 'Artist'}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#141414] border border-gray-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Processing Pipeline</h2>
              <div className="space-y-4 text-sm text-gray-400">
                <PipelineStep icon={FileAudio} label="Upload to ingest-service" active={state === 'uploading'} />
                <PipelineStep icon={Music2} label="Audio normalization" active={state === 'processing'} />
                <PipelineStep icon={Image} label="Artwork validation" active={state === 'processing'} />
                <PipelineStep icon={UploadCloud} label="Publish to streaming edge" active={state === 'success'} />
              </div>
            </div>
          </div>
        </div>
      </div>
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

function PipelineStep({ icon: Icon, label, active }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? 'bg-yeah-accent/20 text-yeah-accent' : 'bg-[#1c1c1c] text-gray-500'}`}>
        <Icon size={16} />
      </div>
      <span className={active ? 'text-white' : ''}>{label}</span>
    </div>
  );
}
