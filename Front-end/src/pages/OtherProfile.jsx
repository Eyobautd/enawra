import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import ProfileCard from "../components/ProfileCard";
import PostCard from "../components/PostCard";
import { toast } from "sonner";

export default function OtherProfile() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [togglingFollow, setTogglingFollow] = useState(false);

  useEffect(() => {
    // If they click on their own username, redirect to their own profile page
    if (currentUser && currentUser.username === (username.startsWith('@') ? username.slice(1) : username)) {
      navigate('/profile', { replace: true });
    }
  }, [username, currentUser, navigate]);

  const loadProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const cleanUsername = username.startsWith('@') ? username.slice(1) : username;
      const targetUser = await api.users.getUserByUsername(cleanUsername);
      setProfileUser(targetUser);

      // Check if current user is following this person
      if (currentUser && currentUser.following && targetUser) {
        setIsFollowing(currentUser.following.includes(targetUser._id));
      }

      if (targetUser && targetUser._id) {
        const postsData = await api.posts.getUserPosts(targetUser._id);
        setPosts(postsData);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [username]);

  const handleFollowToggle = async () => {
    if (!profileUser) return;
    setTogglingFollow(true);
    try {
      const result = await api.users.toggleFollow(profileUser._id);
      setIsFollowing(result.isFollowing);
      
      // Update local profile user's followers count for immediate UI feedback
      setProfileUser(prev => ({
        ...prev,
        followers: result.isFollowing 
          ? [...(prev.followers || []), currentUser._id]
          : (prev.followers || []).filter(id => id !== currentUser._id)
      }));
      
      toast.success(result.message);
    } catch (err) {
      toast.error(err.message || "Failed to follow user");
    } finally {
      setTogglingFollow(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        <div className="animate-spin h-8 w-8 border-4 border-gray-200 border-t-black rounded-full"></div>
      </div>
    );
  }

  if (!profileUser) {
    return <div className="p-6 text-center text-red-500 font-medium">Profile not found.</div>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <ProfileCard
        name={profileUser.fullName}
        username={profileUser.username}
        email={profileUser.email}
        avatar={profileUser.profilePhoto}
        postsCount={posts.length}
        followersCount={profileUser.followers?.length || 0}
        followingCount={profileUser.following?.length || 0}
      />

      {currentUser && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleFollowToggle}
            disabled={togglingFollow}
            className={`rounded-xl px-6 py-2 text-sm font-semibold transition cursor-pointer shadow-sm disabled:opacity-50 ${
              isFollowing
                ? "border border-gray-300 text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                : "bg-black text-white hover:bg-gray-800"
            }`}
          >
            {togglingFollow ? "Loading..." : isFollowing ? "Unfollow" : "Follow"}
          </button>
        </div>
      )}

      <div className="mt-8 space-y-4">
        <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
          {profileUser.fullName}'s Posts
        </h3>
        
        {posts.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500 font-medium shadow-sm">
            This user hasn't posted anything yet.
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
