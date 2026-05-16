import { useState } from 'react';
import TopNav from '../../components/layout/TopNav';
import { useAuthStore } from '../../store/useAuthStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useDataStore } from '../../store/useDataStore';
import { Upload, Edit2, Save, X } from 'lucide-react';
import { fileToOptimizedAvatarDataUrl } from '../../utils/image';

export default function Profile() {
  const { user, logout, updateProfile, isLoading } = useAuthStore();
  const { followedArtists, artists } = useDataStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: user?.username || '',
    avatar: user?.avatar || '',
  });

  const followed = artists.filter((artist) => followedArtists.includes(artist.id));
  const addToast = useNotificationStore((state) => state.addToast);

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const optimizedAvatar = await fileToOptimizedAvatarDataUrl(file);
      setEditForm((prev) => ({ ...prev, avatar: optimizedAvatar }));
    } catch (uploadError) {
      addToast({
        type: 'error',
        title: 'Avatar upload failed',
        message: uploadError.message,
      });
    }

    event.target.value = '';
  };

  const handleSaveProfile = async () => {
    if (!editForm.username.trim()) {
      addToast({
        type: 'error',
        title: 'Validation error',
        message: 'Username cannot be empty.',
      });
      return;
    }

    try {
      await updateProfile({
        username: editForm.username,
        avatar: editForm.avatar,
      });
      setIsEditing(false);
      addToast({
        type: 'success',
        title: 'Profile updated',
        message: 'Your profile has been successfully updated.',
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Update failed',
        message: err.message || 'Failed to update profile.',
      });
    }
  };

  return (
    <div className="flex-1 bg-yeah-bg overflow-y-auto no-scrollbar pb-48 md:pb-32">
      <TopNav />
      <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-start gap-5 sm:gap-6 mb-8">
          <div className="relative shrink-0">
            <img
              src={isEditing ? editForm.avatar : user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-2 border-gray-700"
            />
            {isEditing && (
              <label className="absolute bottom-0 right-0 bg-yeah-accent text-black p-2 rounded-full cursor-pointer hover:bg-yeah-accent/80 transition">
                <Upload size={16} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Username</label>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, username: e.target.value }))}
                    className="w-full max-w-md bg-[#1f1f1f] text-white rounded-lg py-2 px-3 border border-gray-700 focus:border-yeah-accent outline-none"
                  />
                </div>
              </div>
            ) : (
              <div>
                <p className="text-xs uppercase text-gray-500">Profile</p>
                <h1 className="text-2xl sm:text-3xl font-bold text-white break-words">{user?.username}</h1>
                <p className="text-gray-400">Role: {user?.role}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto sm:ml-auto">
            {isEditing ? (
              <>
                <button
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                  className="bg-yeah-accent text-black px-4 py-2 rounded-lg hover:bg-yeah-accent/90 flex items-center justify-center gap-2 font-medium disabled:opacity-60"
                >
                  <Save size={18} />
                  Save changes
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditForm({
                      username: user?.username || '',
                      avatar: user?.avatar || '',
                    });
                  }}
                  className="bg-[#1a1a1a] text-gray-200 px-4 py-2 rounded-lg border border-gray-700 hover:border-gray-500 flex items-center justify-center gap-2"
                >
                  <X size={18} />
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-[#1a1a1a] text-gray-200 px-4 py-2 rounded-lg border border-gray-700 hover:border-gray-500 flex items-center justify-center gap-2"
                >
                  <Edit2 size={18} />
                  Edit profile
                </button>
                <button
                  onClick={logout}
                  className="bg-[#222] text-white px-4 py-2 rounded-lg border border-gray-700 hover:border-gray-500"
                >
                  Log out
                </button>
              </>
            )}
          </div>
        </div>

        {/* Following Section */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-white mb-4">Following</h2>
          {followed.length === 0 ? (
            <p className="text-gray-500">You are not following any artists yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {followed.map((artist) => (
                <div key={artist.id} className="bg-[#151515] p-4 rounded-xl border border-gray-800">
                  <img src={artist.avatar} alt={artist.name} className="w-14 h-14 rounded-full" />
                  <h3 className="text-white font-semibold mt-3">{artist.name}</h3>
                  <p className="text-xs text-gray-400">{artist.followers.toLocaleString()} followers</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
