import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import ProfileCard from "../components/ProfileCard";
import PostCard from "../components/PostCard";
import { toast } from "sonner";
import imageCompression from "browser-image-compression";

export default function Profile() {
  const { user, updateUser } = useAuth();
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit Profile States
  const [showEditModal, setShowEditModal] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto || "");
  const [saving, setSaving] = useState(false);

  // Sync edit states when user loads
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setProfilePhoto(user.profilePhoto || "");
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const userId = user._id || user.id;
      const postsData = await api.posts.getUserPosts(userId);
      setPosts(postsData);
    } catch (err) {
      console.error(err);
      setError("Failed to load your posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [user]);

  const handlePostDeleted = (postId) => {
    setPosts((prevPosts) => prevPosts.filter((p) => p._id !== postId));
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    try {
      const options = {
        maxSizeMB: 1, // Max 1MB
        maxWidthOrHeight: 1024,
        useWebWorker: true
      };
      
      const compressedFile = await imageCompression(file, options);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result);
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error("Error compressing image:", error);
      toast.error("Failed to process image");
    }
  };

  const handleSaveProfile = async () => {
    if (!fullName.trim()) return toast.error("Full Name cannot be empty");
    
    setSaving(true);
    try {
      const updatedData = await api.users.updateProfile({
        fullName,
        profilePhoto
      });
      
      // Update global context state
      updateUser(updatedData);
      setShowEditModal(false);
      toast.success("Profile updated successfully");
    } catch (err) {
      console.error("Failed to update profile:", err);
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <ProfileCard
        name={user.fullName}
        username={user.username}
        email={user.email}
        avatar={user.profilePhoto}
        postsCount={posts.length}
        followersCount={user.followers?.length || 0}
        followingCount={user.following?.length || 0}
      />

      <div className="mt-4 flex justify-end">
        <button
          onClick={() => setShowEditModal(true)}
          className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:text-black hover:bg-gray-50 transition cursor-pointer shadow-sm"
        >
          Edit Profile
        </button>
      </div>

      <div className="mt-8 space-y-4">
        <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
          Your Posts
        </h3>
        {loading ? (
          <div className="text-center py-12 text-gray-500 font-medium">
            <div className="h-6 w-6 border-2 border-gray-300 border-t-black animate-spin rounded-full mx-auto"></div>
            <span className="mt-2 block text-sm">Loading your posts...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500 font-medium">{error}</div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500 font-medium shadow-sm">
            You haven't posted anything yet. Go to Home to write your first post!
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onDelete={handlePostDeleted}
                showDeleteButton={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-gray-105 relative">
            <h3 className="text-lg font-bold text-gray-950 mb-5">Edit Profile</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black bg-white text-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Profile Photo
                </label>
                <div className="flex items-center gap-4">
                  {profilePhoto && (
                    <img 
                      src={profilePhoto} 
                      alt="Preview" 
                      className="w-12 h-12 rounded-full object-cover border border-gray-200"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 transition"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-6 pt-4 border-t border-gray-50">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-100 cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={saving || !fullName.trim()}
                className="bg-black text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-gray-800 disabled:opacity-50 cursor-pointer shadow-sm transition"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
