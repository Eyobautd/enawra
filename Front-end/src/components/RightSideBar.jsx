import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function RightSidebar() {
  const { user: currentUser } = useAuth();
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCreators = async () => {
    try {
      const data = await api.users.searchUsers("");
      setCreators(data.slice(0, 5));
    } catch (err) {
      console.error("Failed to load suggested creators:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchCreators();
    }
  }, [currentUser]);

  const handleFollowToggle = async (creatorId) => {
    try {
      const data = await api.users.toggleFollow(creatorId);
      
      setCreators((prevCreators) =>
        prevCreators.map((c) => {
          if (c._id === creatorId) {
            const currentUserId = currentUser?._id || currentUser?.id;
            const updatedFollowers = data.isFollowing
              ? [...(c.followers || []), currentUserId]
              : (c.followers || []).filter((id) => id !== currentUserId);
            return { ...c, followers: updatedFollowers };
          }
          return c;
        })
      );
    } catch (err) {
      console.error("Error toggling follow in sidebar:", err);
    }
  };

  const defaultAvatar = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDR8H0rgV-zmSodkT_erGjzA_VhfWE22Pg7Q&s";

  return (
    <aside className="w-64 bg-white border-l border-gray-200 p-5 hidden lg:block sticky top-[72px] h-[calc(100vh-72px)] overflow-y-auto">
      <h2 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Suggested Creators</h2>
      
      {loading ? (
        <div className="text-xs text-gray-400 py-4 animate-pulse">Loading suggestions...</div>
      ) : creators.length === 0 ? (
        <div className="text-xs text-gray-400 py-4">No suggestions available.</div>
      ) : (
        <ul className="space-y-4">
          {creators.map((c) => {
            const currentUserId = currentUser?._id || currentUser?.id;
            const isFollowing = c.followers?.includes(currentUserId);

            return (
              <li key={c._id} className="flex justify-between items-center gap-3">
                <Link to={`/profile/${c.username}`} className="flex items-center gap-2.5 hover:opacity-80 transition group flex-1 min-w-0">
                  <img
                    src={c.profilePhoto || defaultAvatar}
                    alt={c.fullName}
                    className="w-9 h-9 rounded-full object-cover border border-gray-150 group-hover:border-gray-300"
                  />
                  <div className="max-w-[110px]">
                    <p className="font-semibold text-xs text-gray-950 truncate leading-none group-hover:text-blue-600 transition">{c.fullName}</p>
                    <p className="text-[10px] text-gray-400 truncate mt-1">@{c.username}</p>
                  </div>
                </Link>
                
                <button 
                  onClick={() => handleFollowToggle(c._id)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition cursor-pointer ${
                    isFollowing 
                      ? "bg-gray-100 border-gray-200 text-gray-500 hover:bg-gray-200" 
                      : "bg-black border-black text-white hover:bg-gray-800"
                  }`}
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
