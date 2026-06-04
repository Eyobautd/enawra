import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function UserListModal({ title, userId, type, onClose }) {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const defaultAvatar = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDR8H0rgV-zmSodkT_erGjzA_VhfWE22Pg7Q&s";

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        let data;
        if (type === "followers") {
          data = await api.users.getFollowers(userId);
        } else if (type === "following") {
          data = await api.users.getFollowing(userId);
        }
        
        // Add isFollowing state for current user
        const currentUserId = currentUser?._id || currentUser?.id;
        const usersWithFollowState = (data || []).map(u => ({
          ...u,
          isFollowing: currentUser?.following?.includes(u._id) || currentUser?.following?.some(id => id.toString() === u._id.toString())
        }));
        
        setUsers(usersWithFollowState);
      } catch (err) {
        setError("Failed to load users");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchUsers();
  }, [userId, type, currentUser]);

  const handleFollowToggle = async (e, targetUserId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const data = await api.users.toggleFollow(targetUserId);
      setUsers((prevUsers) =>
        prevUsers.map((u) => {
          if (u._id === targetUserId) {
            return { ...u, isFollowing: data.isFollowing };
          }
          return u;
        })
      );
    } catch (err) {
      console.error("Error toggling follow:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl border border-gray-100 relative h-[60vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 font-bold transition"
        >
          ✕
        </button>
        <h3 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">{title}</h3>
        
        <div className="flex-1 overflow-y-auto pr-2">
          {loading ? (
            <div className="text-center py-8 text-sm text-gray-400">Loading...</div>
          ) : error ? (
            <div className="text-center py-8 text-sm text-red-500">{error}</div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-400">No users found.</div>
          ) : (
            <ul className="space-y-4">
              {users.map((u) => (
                <li key={u._id} className="flex justify-between items-center gap-3">
                  <Link 
                    to={`/profile/${u.username}`} 
                    onClick={onClose}
                    className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-xl transition flex-1 min-w-0"
                  >
                    <img
                      src={u.profilePhoto || defaultAvatar}
                      alt={u.fullName}
                      className="w-10 h-10 rounded-full object-cover border border-gray-200"
                    />
                    <div className="max-w-[150px]">
                      <p className="font-semibold text-sm text-gray-900 leading-tight truncate">{u.fullName}</p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">@{u.username}</p>
                    </div>
                  </Link>
                  
                  {currentUser && (currentUser._id || currentUser.id) !== u._id && (
                    <button 
                      onClick={(e) => handleFollowToggle(e, u._id)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition cursor-pointer mr-2 ${
                        u.isFollowing 
                          ? "bg-gray-100 border-gray-200 text-gray-500 hover:bg-gray-200" 
                          : "bg-black border-black text-white hover:bg-gray-800"
                      }`}
                    >
                      {u.isFollowing ? "Unfollow" : "Follow"}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
