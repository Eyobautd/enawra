import { useState, useEffect } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function PostCard({ post, onDelete }) {
  const { user: currentUser } = useAuth();
  
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [liked, setLiked] = useState(post.liked || false);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const defaultAvatar = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDR8H0rgV-zmSodkT_erGjzA_VhfWE22Pg7Q&s";
  
  const authorName = post.author?.fullName || post.author?.username || "Anonymous";
  const authorHandle = post.author?.username ? `@${post.author.username}` : "";
  const authorAvatar = post.author?.profilePhoto || defaultAvatar;
  const content = post.text;
  const time = post.createdAt 
    ? new Date(post.createdAt).toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      }) 
    : "just now";

  // Check if current user is the author of this post
  const isOwnPost = currentUser && post.author && (post.author._id === currentUser._id || post.author === currentUser._id);

  // Sync state with post prop
  useEffect(() => {
    setLikesCount(post.likesCount || 0);
    setLiked(post.liked || false);
    setCommentsCount(post.commentsCount || 0);
  }, [post]);

  // Fetch comments when dialog is opened
  useEffect(() => {
    const fetchComments = async () => {
      if (!showComments) return;
      setLoadingComments(true);
      try {
        const data = await api.comments.getComments(post._id);
        setComments(data);
        setCommentsCount(data.length);
      } catch (err) {
        console.error("Error fetching comments:", err);
      } finally {
        setLoadingComments(false);
      }
    };
    if (post._id) fetchComments();
  }, [showComments, post._id]);

  const handleLike = async () => {
    try {
      const data = await api.likes.toggleLike(post._id);
      setLiked(data.liked);
      setLikesCount(data.likesCount);
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    try {
      const newComment = await api.comments.addComment(post._id, commentText);
      setComments((prev) => [...prev, newComment]);
      setCommentsCount((prev) => prev + 1);
      setCommentText("");
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    
    setDeleting(true);
    try {
      await api.posts.deletePost(post._id);
      if (onDelete) {
        onDelete(post._id);
      }
    } catch (err) {
      console.error("Error deleting post:", err);
      alert(err.message || "Failed to delete post");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-5 mb-6 border border-gray-100 max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto shadow-sm transition hover:shadow-md duration-200">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img
            src={authorAvatar}
            alt={authorName}
            className="w-11 h-11 rounded-full object-cover border border-gray-100 shadow-sm"
          />
          <div>
            <h2 className="font-semibold text-gray-900 leading-tight">{authorName}</h2>
            <p className="text-xs text-gray-500 font-medium mt-0.5">{authorHandle} • {time}</p>
          </div>
        </div>

        {isOwnPost && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-xs font-semibold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition disabled:opacity-50 cursor-pointer"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        )}
      </div>

      {/* Content */}
      <p className="text-gray-800 mt-4 leading-relaxed whitespace-pre-line text-[15px]">{content}</p>

      {/* Media Image */}
      {post.mediaUrl && post.mediaType === 'image' && (
        <div className="mt-4 overflow-hidden rounded-xl border border-gray-100 max-h-96">
          <img
            src={post.mediaUrl}
            alt="Post media"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-5 mt-5 pt-3 border-t border-gray-50 text-gray-600 items-center">
        <button 
          onClick={handleLike} 
          className={`flex items-center gap-1.5 hover:text-blue-600 transition cursor-pointer font-medium text-sm ${liked ? "text-blue-600 font-semibold" : ""}`}
        >
          <img 
            src={liked ? "https://cdn-icons-png.flaticon.com/128/1077/1077035.png" : "https://cdn-icons-png.flaticon.com/128/1077/1077086.png"} 
            alt="Like" 
            className="w-[18px] h-[18px]" 
          />
          <span>{likesCount}</span>
        </button>
        
        <button
          onClick={() => setShowComments(true)}
          className="flex items-center gap-1.5 hover:text-blue-600 transition cursor-pointer font-medium text-sm"
        >
          <img src="https://cdn-icons-png.flaticon.com/128/134/134718.png" alt="Comment" className="w-[18px] h-[18px]" />
          <span>{commentsCount}</span>
        </button>
      </div>

      {/* Detailed Comments Overlay modal */}
      {showComments && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl h-[80vh] flex flex-col md:flex-row overflow-hidden relative">
            
            {/* Left side: Post details */}
            <div className="w-full md:w-1/2 border-r border-gray-100 p-5 flex flex-col justify-between bg-gray-50/50">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={authorAvatar}
                    alt={authorName}
                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{authorName}</h4>
                    <p className="text-xs text-gray-500">{authorHandle}</p>
                  </div>
                </div>
                <p className="text-gray-800 text-[15px] leading-relaxed whitespace-pre-line overflow-y-auto max-h-[40vh]">{content}</p>
                {post.mediaUrl && post.mediaType === 'image' && (
                  <div className="mt-3 overflow-hidden rounded-xl border border-gray-200 max-h-[30vh]">
                    <img
                      src={post.mediaUrl}
                      alt="Post media"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-400 font-medium pt-4">
                Posted on {time}
              </div>
            </div>

            {/* Right side: Comments list and entry */}
            <div className="w-full md:w-1/2 flex flex-col h-full bg-white">
              <h3 className="text-base font-bold p-4 border-b border-gray-100 text-gray-800">
                Comments ({comments.length})
              </h3>
              
              {/* Scrollable comments list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
                {loadingComments ? (
                  <div className="text-center py-8 text-sm text-gray-400 font-medium animate-pulse">
                    Loading comments...
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-8 text-sm text-gray-400 font-medium">
                    No comments yet. Start the conversation!
                  </div>
                ) : (
                  comments.map((c) => (
                    <div key={c._id} className="flex gap-2.5 items-start">
                      <img
                        src={c.user?.profilePhoto || defaultAvatar}
                        alt={c.user?.fullName}
                        className="w-7 h-7 rounded-full border border-gray-100 object-cover"
                      />
                      <div className="bg-gray-50 rounded-2xl px-3 py-2 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-gray-800">
                            {c.user?.fullName || c.user?.username || "Anonymous"}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ""}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm mt-0.5 whitespace-pre-line leading-relaxed">{c.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment section */}
              <div className="border-t border-gray-100 p-4 bg-gray-50/30 flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleComment()}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black bg-white text-black"
                />
                <button
                  onClick={handleComment}
                  disabled={!commentText.trim()}
                  className="bg-black text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 cursor-pointer shadow-sm transition"
                >
                  Send
                </button>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={() => setShowComments(false)}
              className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white hover:bg-gray-100 shadow border border-gray-100 text-gray-500 hover:text-black flex items-center justify-center font-bold text-sm cursor-pointer transition z-10"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
