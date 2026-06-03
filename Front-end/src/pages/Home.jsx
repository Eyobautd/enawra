import { useEffect, useState } from "react";
import { api } from "../services/api";
import CreatePost from "../components/CreatePost";
import PostCard from "../components/PostCard";
import RightSidebar from "../components/RightSideBar";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("explore");

  const fetchFeed = async (tab) => {
    setLoading(true);
    setError("");
    try {
      let data;
      if (tab === "explore") {
        data = await api.posts.getFeed();
      } else {
        data = await api.posts.getFollowingFeed();
      }
      setPosts(data);
    } catch (err) {
      setError("Failed to fetch feed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed(activeTab);
  }, [activeTab]);

  const handlePostCreated = (newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  const handlePostDeleted = (postId) => {
    setPosts((prevPosts) => prevPosts.filter((p) => p._id !== postId));
  };

  return (
    <div className="flex">
      <main className="flex-1 p-6">
        <CreatePost onPostCreated={handlePostCreated} />

        {/* Feed Segmentation Tabs */}
        <div className="flex mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("explore")}
            className={`flex-1 py-3 text-sm font-semibold text-center transition ${
              activeTab === "explore"
                ? "text-black border-b-2 border-black"
                : "text-gray-400 hover:text-gray-700"
            }`}
          >
            Explore
          </button>
          <button
            onClick={() => setActiveTab("following")}
            className={`flex-1 py-3 text-sm font-semibold text-center transition ${
              activeTab === "following"
                ? "text-black border-b-2 border-black"
                : "text-gray-400 hover:text-gray-700"
            }`}
          >
            Following
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500 font-medium">
            <div className="animate-pulse flex flex-col items-center gap-3">
              <div className="h-8 w-8 rounded-full border-2 border-gray-300 border-t-black animate-spin"></div>
              <span>Loading your feed...</span>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500 font-medium">{error}</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-gray-500 font-medium">
            No posts yet. Be the first to share your thoughts!
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((p) => (
              <PostCard
                key={p._id}
                post={p}
                onDelete={handlePostDeleted}
              />
            ))}
          </div>
        )}
      </main>
      <RightSidebar />
    </div>
  );
}
