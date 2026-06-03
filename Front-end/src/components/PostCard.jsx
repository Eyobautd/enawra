import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

export default function PostCard({ post, onDelete, showDeleteButton = false }) {
  const { user: currentUser } = useAuth();
  
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [liked, setLiked] = useState(post.liked || false);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);

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

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setShowDeleteConfirm(false);
    setDeleting(true);
    try {
      await api.posts.deletePost(post._id);
      toast.success("Post deleted successfully");
      if (onDelete) {
        onDelete(post._id);
      }
    } catch (err) {
      console.error("Error deleting post:", err);
      toast.error(err.message || "Failed to delete post");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-5 mb-6 border border-gray-100 max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto shadow-sm transition hover:shadow-md duration-200">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <Link to={`/profile/${post.author?.username || ''}`} className="flex items-center gap-3 hover:opacity-80 transition group">
          <img
            src={authorAvatar}
            alt={authorName}
            className="w-11 h-11 rounded-full object-cover border border-gray-100 shadow-sm group-hover:border-gray-300"
          />
          <div>
            <h2 className="font-semibold text-gray-900 leading-tight group-hover:text-blue-600 transition">{authorName}</h2>
            <p className="text-xs text-gray-500 font-medium mt-0.5">{authorHandle} • {time}</p>
          </div>
        </Link>

        {isOwnPost && showDeleteButton && (
          <button
            onClick={handleDeleteClick}
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
        <div 
          className="mt-4 overflow-hidden rounded-xl border border-gray-100 max-h-96 cursor-pointer bg-gray-50 flex items-center justify-center"
          onClick={() => setShowLightbox(true)}
        >
          <img
            src={post.mediaUrl}
            alt="Post media"
            className="w-full h-full object-contain max-h-96 hover:opacity-95 transition"
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
                <Link to={`/profile/${post.author?.username || ''}`} className="flex items-center gap-3 mb-4 hover:opacity-80 transition group">
                  <img
                    src={authorAvatar}
                    alt={authorName}
                    className="w-10 h-10 rounded-full object-cover border border-gray-200 group-hover:border-gray-300"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition">{authorName}</h4>
                    <p className="text-xs text-gray-500">{authorHandle}</p>
                  </div>
                </Link>
                <p className="text-gray-800 text-[15px] leading-relaxed whitespace-pre-line overflow-y-auto max-h-[40vh]">{content}</p>
                {post.mediaUrl && post.mediaType === 'image' && (
                  <div 
                    className="mt-3 overflow-hidden rounded-xl border border-gray-200 max-h-[30vh] cursor-pointer bg-gray-100 flex items-center justify-center"
                    onClick={() => setShowLightbox(true)}
                  >
                    <img
                      src={post.mediaUrl}
                      alt="Post media"
                      className="w-full h-full object-contain hover:opacity-95 transition"
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
                      <Link to={`/profile/${c.user?.username || ''}`}>
                        <img
                          src={c.user?.profilePhoto || defaultAvatar}
                          alt={c.user?.fullName}
                          className="w-7 h-7 rounded-full border border-gray-100 object-cover hover:opacity-80 transition"
                        />
                      </Link>
                      <div className="bg-gray-50 rounded-2xl px-3 py-2 flex-1">
                        <div className="flex items-center justify-between">
                          <Link to={`/profile/${c.user?.username || ''}`} className="font-semibold text-xs text-gray-800 hover:text-blue-600 transition">
                            {c.user?.fullName || c.user?.username || "Anonymous"}
                          </Link>
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

      {/* Lightbox Overlay */}
      {showLightbox && post.mediaUrl && (
        <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-[60] p-4 backdrop-blur-sm" onClick={() => setShowLightbox(false)}>
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-lg cursor-pointer transition z-[70]"
          >
            ✕
          </button>
          <img
            src={post.mediaUrl}
            alt="Full size media"
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[60] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Post?</h3>
            <p className="text-gray-600 text-sm mb-6">Are you sure you want to delete this post? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-600 text-white shadow-sm transition cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
