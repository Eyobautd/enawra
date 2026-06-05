import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Explore() {
  const { user: currentUser, updateUser } = useAuth();
  const [query, setQuery] = useState("");
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const search = async () => {
    setLoading(true);
    try {
      const results = await api.users.searchUsers(query);
      setPeople(results);
    } catch (err) {
      console.error(err);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      search();
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleFollowToggle = async (personId) => {
    try {
      const data = await api.users.toggleFollow(personId);
      
      if (data.following) {
        updateUser({ following: data.following });
      }
      
      setPeople((prevPeople) =>
        prevPeople.map((person) => {
          if (person._id === personId) {
            const currentUserId = currentUser?._id || currentUser?.id;
            const updatedFollowers = data.isFollowing
              ? [...(person.followers || []), currentUserId]
              : (person.followers || []).filter((id) => id !== currentUserId);
            return { ...person, followers: updatedFollowers };
          }
          return person;
        })
      );
    } catch (err) {
      console.error("Error toggling follow:", err);
      alert(err.message || "Failed to update follow status");
    }
  };

  const defaultAvatar = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDR8H0rgV-zmSodkT_erGjzA_VhfWE22Pg7Q&s";

  return (
    <main className="p-6">
      <div className="flex flex-col gap-5 max-w-2xl mx-auto">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Explore People</h1>
          <p className="text-gray-500 mt-2 text-sm">Find and connect with fellow creators on Enawra.</p>
        </div>

        <div>
          <label className="sr-only" htmlFor="search">
            Search people
          </label>
          <input
            id="search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or username..."
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-black placeholder-gray-400 bg-white focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10 text-sm"
          />
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400 font-medium">Searching creators...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500 font-medium">{error}</div>
        ) : people.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500 font-medium shadow-sm">
            No creators found matching your search.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {people.map((person) => {
              const currentUserId = currentUser?._id || currentUser?.id;
              const isFollowing = person.followers?.includes(currentUserId);

              return (
                <div key={person._id} className="rounded-2xl border border-gray-150 bg-white p-5 shadow-sm transition hover:shadow-md duration-200 flex flex-col justify-between">
                  <div className="flex items-center justify-between gap-4">
                    <Link to={`/profile/${person.username}`} className="flex items-center gap-3 hover:opacity-80 transition group flex-1 min-w-0">
                      <img
                        src={person.profilePhoto || defaultAvatar}
                        alt={person.fullName}
                        className="w-12 h-12 rounded-full object-cover border border-gray-200 group-hover:border-gray-300"
                      />
                      <div className="max-w-full overflow-hidden">
                        <p className="text-base font-semibold text-gray-950 leading-snug group-hover:text-blue-600 transition truncate">{person.fullName}</p>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">@{person.username}</p>
                      </div>
                    </Link>
                    <button 
                      onClick={() => handleFollowToggle(person._id)}
                      className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                        isFollowing 
                          ? "bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200" 
                          : "bg-black border-black text-white hover:bg-gray-800"
                      }`}
                    >
                      {isFollowing ? "Unfollow" : "Follow"}
                    </button>
                  </div>
                  <div className="mt-4 text-[10px] text-gray-400 font-semibold uppercase tracking-wider bg-gray-50 p-2.5 rounded-lg border border-gray-50 text-center">
                    Joined Enawra on {new Date(person.joinedAt).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
