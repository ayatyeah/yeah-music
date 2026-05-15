import { useState } from 'react';
import { Eye, EyeOff, Upload, User, Mail, Lock, Music, Disc, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import {
  avatarUploadLimits,
  fileToOptimizedAvatarDataUrl,
} from '../../utils/image';

const roles = ['listener', 'artist'];
const defaultAvatars = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
];

export default function Register() {
  const navigate = useNavigate();
  const { register, isLoading, error } = useAuthStore();
  const addToast = useNotificationStore((state) => state.addToast);

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'listener',
    avatar: defaultAvatars[0],
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showAvatarGrid, setShowAvatarGrid] = useState(false);

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const optimizedAvatar = await fileToOptimizedAvatarDataUrl(file);
      updateField('avatar', optimizedAvatar);
    } catch (uploadError) {
      addToast({
        type: 'error',
        title: 'Avatar upload failed',
        message: uploadError.message,
      });
    }

    event.target.value = '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (form.password !== form.confirmPassword) return;

    const result = await register({
      username: form.username,
      email: form.email,
      password: form.password,
      role: form.role,
      avatar: form.avatar,
    });

    navigate(result.user.role === 'artist' ? '/artist/dashboard' : '/');
  };

  const validationError =
    form.password && form.confirmPassword && form.password !== form.confirmPassword
      ? 'Passwords do not match.'
      : '';

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl bg-[#141414] border border-white/10 rounded-3xl p-10 shadow-2xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-yeah-accent/20 flex items-center justify-center text-yeah-accent">
            <Music size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Create your YeahMusic account</h1>
            <p className="text-gray-400">Join the platform powering modern streaming.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-1">
            <label className="text-sm text-gray-400">Username</label>
            <div className="relative mt-2">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                value={form.username}
                onChange={(event) => updateField('username', event.target.value)}
                className="w-full bg-[#1f1f1f] text-white rounded-lg py-3 pl-10 pr-4 border border-gray-800 focus:border-yeah-accent outline-none"
                placeholder="YeahAyat"
                required
              />
            </div>
          </div>

          <div className="col-span-1">
            <label className="text-sm text-gray-400">Email</label>
            <div className="relative mt-2">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
                className="w-full bg-[#1f1f1f] text-white rounded-lg py-3 pl-10 pr-4 border border-gray-800 focus:border-yeah-accent outline-none"
                placeholder="you@yeahmusic.dev"
                required
              />
            </div>
          </div>

          <div className="col-span-1">
            <label className="text-sm text-gray-400">Password</label>
            <div className="relative mt-2">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(event) => updateField('password', event.target.value)}
                className="w-full bg-[#1f1f1f] text-white rounded-lg py-3 pl-10 pr-12 border border-gray-800 focus:border-yeah-accent outline-none"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((state) => !state)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="col-span-1">
            <label className="text-sm text-gray-400">Confirm Password</label>
            <div className="relative mt-2">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type={showConfirm ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={(event) => updateField('confirmPassword', event.target.value)}
                className="w-full bg-[#1f1f1f] text-white rounded-lg py-3 pl-10 pr-12 border border-gray-800 focus:border-yeah-accent outline-none"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm((state) => !state)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="col-span-1">
            <label className="text-sm text-gray-400">Role</label>
            <div className="flex bg-[#1a1a1a] rounded-lg p-1 mt-2">
              {roles.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => updateField('role', role)}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                    form.role === role ? 'bg-[#282828] text-white shadow' : 'text-gray-500'
                  }`}
                >
                  {role === 'listener' ? (
                    <span className="inline-flex items-center gap-2">
                      <Music size={14} /> Listener
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <Disc size={14} /> Artist
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="col-span-1">
            <label className="text-sm text-gray-400">Avatar</label>
            <div className="flex gap-2 mt-2">
              <label className="flex-1 relative">
                <div className="w-full bg-[#1f1f1f] text-white rounded-lg py-3 px-4 border border-gray-800 focus:border-yeah-accent outline-none cursor-pointer hover:bg-[#242424] flex items-center gap-2">
                  <Upload size={18} />
                  <span className="text-sm">Upload photo</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <button
                type="button"
                onClick={() => setShowAvatarGrid(!showAvatarGrid)}
                className="px-4 py-3 bg-[#1f1f1f] text-white rounded-lg border border-gray-800 hover:bg-[#242424] text-sm"
              >
                Choose preset
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Max file size: {Math.floor(avatarUploadLimits.maxUploadSizeBytes / (1024 * 1024))} MB.
            </p>
          </div>

          {showAvatarGrid && (
            <div className="col-span-2 bg-[#1a1a1a] rounded-xl p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-400">Select a preset avatar</p>
                <button
                  type="button"
                  onClick={() => setShowAvatarGrid(false)}
                  className="text-gray-500 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="grid grid-cols-6 gap-3">
                {defaultAvatars.map((avatar, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      updateField('avatar', avatar);
                      setShowAvatarGrid(false);
                    }}
                    className={`w-full aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      form.avatar === avatar
                        ? 'border-yeah-accent ring-2 ring-yeah-accent/50'
                        : 'border-gray-700 hover:border-gray-500'
                    }`}
                  >
                    <img src={avatar} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="col-span-2 flex items-center gap-4 bg-[#1a1a1a] rounded-xl p-4">
            <img src={form.avatar} alt="Avatar preview" className="w-16 h-16 rounded-full object-cover" />
            <div className="text-sm text-gray-400">
              <p className="text-white font-semibold">Profile preview</p>
              <p>Your avatar will be displayed on your profile and throughout the app.</p>
            </div>
          </div>

          {(validationError || error) && (
            <div className="col-span-2 bg-red-500/10 text-red-300 text-sm rounded-lg px-4 py-3">
              {validationError || error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || Boolean(validationError)}
            className="col-span-2 bg-yeah-accent text-black font-bold py-3 rounded-lg transition-all hover:scale-[1.01] disabled:opacity-60"
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}
