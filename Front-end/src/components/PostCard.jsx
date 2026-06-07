import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

export default function PostCard({ post, onDelete, onUpdate, onRepost, showDeleteButton = false }) {
  const { user: currentUser } = useAuth();

  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [liked, setLiked] = useState(post.liked || false);
  const [postData, setPostData] = useState(post);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingRepost, setLoadingRepost] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editPostText, setEditPostText] = useState(post.text || "");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [updatingCommentId, setUpdatingCommentId] = useState(null);
  const [deletingCommentId, setDeletingCommentId] = useState(null);

  const defaultAvatar = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDR8H0rgV-zmSodkT_erGjzA_VhfWE22Pg7Q&s";

  const authorName = post.author?.fullName || post.author?.username || "Anonymous";
  const authorHandle = post.author?.username ? `@${post.author.username}` : "";
  const authorAvatar = post.author?.profilePhoto || defaultAvatar;
  const content = postData?.text;
  const time = postData?.createdAt
    ? new Date(postData.createdAt).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    : "just now";

  // Check if current user is the author of this post
  const isOwnPost = currentUser && post.author && (post.author._id === currentUser._id || post.author === currentUser._id);
  const canEditPost = isOwnPost && !postData?.originalPost;

  // Sync state with post prop
  useEffect(() => {
    setPostData(post);
    setLikesCount(post.likesCount || 0);
    setLiked(post.liked || false);
    setCommentsCount(post.commentsCount || 0);
    setEditPostText(post.text || "");
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

  const handlePostEditStart = () => {
    if (!canEditPost) return;
    setIsEditingPost(true);
  };

  const handlePostCancelEdit = () => {
    setEditPostText(postData?.text || "");
    setIsEditingPost(false);
  };

  const handlePostSave = async () => {
    if (!editPostText.trim()) {
      toast.error("Post cannot be empty");
      return;
    }

    try {
      const updatedPost = await api.posts.updatePost(
        postData._id,
        editPostText,
        postData.mediaUrl,
        postData.mediaType
      );
      setPostData(updatedPost);
      setIsEditingPost(false);
      toast.success("Post updated successfully");
      if (onUpdate) {
        onUpdate(updatedPost);
      }
    } catch (err) {
      console.error("Error updating post:", err);
      toast.error(err.message || "Failed to update post");
    }
  };

  const handleRepost = async () => {
    if (!postData?._id) return;
    setLoadingRepost(true);

    try {
      const repostedPost = await api.posts.repostPost(postData._id);
      toast.success("Post reposted successfully");
      if (onRepost) {
        onRepost(repostedPost);
      }
    } catch (err) {
      console.error("Error reposting post:", err);
      toast.error(err.message || "Failed to repost");
    } finally {
      setLoadingRepost(false);
    }
  };

  const handleCommentEditStart = (comment) => {
    setEditingCommentId(comment._id);
    setEditingCommentText(comment.text || "");
  };

  const handleCommentEditCancel = () => {
    setEditingCommentId(null);
    setEditingCommentText("");
  };

  const handleCommentUpdate = async (commentId) => {
    if (!editingCommentText.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    setUpdatingCommentId(commentId);
    try {
      const updatedComment = await api.comments.updateComment(commentId, editingCommentText);
      setComments((prev) => prev.map((comment) => (comment._id === commentId ? updatedComment : comment)));
      setEditingCommentId(null);
      setEditingCommentText("");
      toast.success("Comment updated successfully");
    } catch (err) {
      console.error("Error updating comment:", err);
      toast.error(err.message || "Failed to update comment");
    } finally {
      setUpdatingCommentId(null);
    }
  };

  const handleCommentDelete = async (commentId) => {
    setDeletingCommentId(commentId);
    try {
      await api.comments.deleteComment(commentId);
      setComments((prev) => prev.filter((comment) => comment._id !== commentId));
      setCommentsCount((prev) => Math.max(prev - 1, 0));
      if (editingCommentId === commentId) {
        setEditingCommentId(null);
        setEditingCommentText("");
      }
      toast.success("Comment deleted successfully");
    } catch (err) {
      console.error("Error deleting comment:", err);
      toast.error(err.message || "Failed to delete comment");
    } finally {
      setDeletingCommentId(null);
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

        {isOwnPost && (
          <div className="flex items-center gap-2">
            {canEditPost && (
              <button
                onClick={handlePostEditStart}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition"
              >
                Edit
              </button>
            )}
            {showDeleteButton && (
              <button
                onClick={handleDeleteClick}
                disabled={deleting}
                className="text-xs font-semibold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition disabled:opacity-50 cursor-pointer"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            )}
          </div>
        )}
      </div>

      {postData.originalPost && (
        <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <div className="text-xs uppercase tracking-[0.18em] text-gray-500 font-semibold mb-3">Reposted</div>
          <Link to={`/profile/${postData.originalPost.author?.username || ''}`} className="flex items-center gap-3 hover:opacity-80 transition group mb-3">
            <img
              src={postData.originalPost.author?.profilePhoto || defaultAvatar}
              alt={postData.originalPost.author?.fullName || postData.originalPost.author?.username}
              className="w-9 h-9 rounded-full object-cover border border-gray-200 shadow-sm"
            />
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition text-sm">
                {postData.originalPost.author?.fullName || postData.originalPost.author?.username || 'Anonymous'}
              </h3>
              <p className="text-xs text-gray-500">
                @{postData.originalPost.author?.username || ''} • {postData.originalPost.createdAt ? new Date(postData.originalPost.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'just now'}
              </p>
            </div>
          </Link>
          {postData.originalPost.text && (
            <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-line mb-3">
              {postData.originalPost.text}
            </p>
          )}
          {postData.originalPost.mediaUrl && (
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
              {postData.originalPost.mediaType === 'video' ? (
                <video
                  controls
                  src={postData.originalPost.mediaUrl}
                  className="w-full h-full object-contain max-h-80"
                />
              ) : (
                <img
                  src={postData.originalPost.mediaUrl}
                  alt="Original post media"
                  className="w-full h-full object-contain max-h-80"
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      {isEditingPost ? (
        <div className="mt-4">
          <textarea
            value={editPostText}
            onChange={(e) => setEditPostText(e.target.value)}
            rows={4}
            className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black bg-white"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={handlePostSave}
              className="bg-black text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-800 transition"
            >
              Save
            </button>
            <button
              onClick={handlePostCancelEdit}
              className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <p className="text-gray-800 leading-relaxed whitespace-pre-line text-[15px]">{content}</p>
          {postData.isEdited && (
            <p className="text-xs text-gray-400 mt-2">Edited</p>
          )}
        </div>
      )}

      {/* Media Preview */}
      {postData.mediaUrl && (
        <div
          className="mt-4 overflow-hidden rounded-xl border border-gray-100 max-h-96 cursor-pointer bg-gray-50 flex items-center justify-center"
          onClick={() => setShowLightbox(true)}
        >
          {postData.mediaType === 'video' ? (
            <video
              controls
              src={postData.mediaUrl}
              className="w-full h-full object-contain max-h-96"
            />
          ) : (
            <img
              src={postData.mediaUrl}
              alt="Post media"
              className="w-full h-full object-contain max-h-96 hover:opacity-95 transition"
            />
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-5 mt-5 pt-3 border-t border-gray-50 text-gray-600 items-center">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 hover:text-blue-600 transition cursor-pointer font-medium text-sm ${liked ? "text-blue-600 font-semibold" : ""}`}
        >
          <img
            src={liked ? "https://cdn-icons-png.flaticon.com/128/1077/1077086.png" : "https://cdn-icons-png.flaticon.com/128/1077/1077035.png"}
            alt="Like"
            className="w-4.5 h-4.5"
          />
          <span>{likesCount}</span>
        </button>

        <button
          onClick={() => setShowComments(true)}
          className="flex items-center gap-1.5 hover:text-blue-600 transition cursor-pointer font-medium text-sm"
        >
          <img src="https://cdn-icons-png.flaticon.com/128/134/134718.png" alt="Comment" className="w-4.5 h-4.5" />
          <span>{commentsCount}</span>
        </button>

        {!isOwnPost && (
          <button
            onClick={handleRepost}
            disabled={loadingRepost}
            className="flex items-center gap-1.5 hover:text-green-600 transition cursor-pointer font-medium text-sm disabled:opacity-50"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/128/545/545682.png"
              alt="Repost"
              className="w-4.5 h-4.5"
            />
            <span>{loadingRepost ? 'Reposting…' : 'Repost'}</span>
          </button>
        )}
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
                {postData.mediaUrl && (
                  <div
                    className="mt-3 overflow-hidden rounded-xl border border-gray-200 max-h-[30vh] cursor-pointer bg-gray-100 flex items-center justify-center"
                    onClick={() => setShowLightbox(true)}
                  >
                    {postData.mediaType === 'video' ? (
                      <video
                        controls
                        src={postData.mediaUrl}
                        className="w-full h-full object-contain hover:opacity-95 transition"
                      />
                    ) : (
                      <img
                        src={postData.mediaUrl}
                        alt="Post media"
                        className="w-full h-full object-contain hover:opacity-95 transition"
                      />
                    )}
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
                  comments.map((c) => {
                    const isOwnComment = currentUser && c.user && (c.user._id === currentUser._id || c.user === currentUser._id);
                    return (
                      <div key={c._id} className="flex gap-2.5 items-start">
                        <Link to={`/profile/${c.user?.username || ''}`}>
                          <img
                            src={c.user?.profilePhoto || defaultAvatar}
                            alt={c.user?.fullName}
                            className="w-7 h-7 rounded-full border border-gray-100 object-cover hover:opacity-80 transition"
                          />
                        </Link>
                        <div className="bg-gray-50 rounded-2xl px-3 py-2 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <Link to={`/profile/${c.user?.username || ''}`} className="font-semibold text-xs text-gray-800 hover:text-blue-600 transition">
                                {c.user?.fullName || c.user?.username || "Anonymous"}
                              </Link>
                              <span className="block text-[10px] text-gray-400 mt-1">
                                {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ""}
                                {c.isEdited ? " • edited" : ""}
                              </span>
                            </div>
                            {isOwnComment && (
                              <div className="flex gap-2 items-center">
                                <button
                                  onClick={() => handleCommentEditStart(c)}
                                  className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 transition"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleCommentDelete(c._id)}
                                  disabled={deletingCommentId === c._id}
                                  className="text-[10px] font-semibold text-red-500 hover:text-red-700 transition disabled:opacity-50"
                                >
                                  {deletingCommentId === c._id ? "Deleting..." : "Delete"}
                                </button>
                              </div>
                            )}
                          </div>
                          {editingCommentId === c._id ? (
                            <div className="mt-2">
                              <textarea
                                value={editingCommentText}
                                onChange={(e) => setEditingCommentText(e.target.value)}
                                rows={3}
                                className="w-full border border-gray-200 rounded-2xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black bg-white"
                              />
                              <div className="mt-2 flex gap-2 justify-end">
                                <button
                                  onClick={handleCommentEditCancel}
                                  className="text-xs font-semibold text-gray-600 hover:text-black px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleCommentUpdate(c._id)}
                                  disabled={updatingCommentId === c._id}
                                  className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-xl transition disabled:opacity-50"
                                >
                                  {updatingCommentId === c._id ? "Saving..." : "Save"}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-700 text-sm mt-0.5 whitespace-pre-line leading-relaxed">{c.text}</p>
                          )}
                        </div>
                      </div>
                    );
                  })
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
      {showLightbox && postData.mediaUrl && (
        <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-60 p-4 backdrop-blur-sm" onClick={() => setShowLightbox(false)}>
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-lg cursor-pointer transition z-70"
          >
            ✕
          </button>
          {postData.mediaType === 'video' ? (
            <video
              controls
              src={postData.mediaUrl}
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <img
              src={postData.mediaUrl}
              alt="Full size media"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-60 p-4 backdrop-blur-sm">
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
