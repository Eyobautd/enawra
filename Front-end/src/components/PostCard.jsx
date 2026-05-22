import { useState } from "react";

export default function PostCard({ user, avatar, content, postImage, postImages, postVideos, time, location, onDelete }) {
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState([
    { user: "Ana", text: "Looks awesome!" },
    { user: "David", text: "Excited for this course 🔥" },
  ]);
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);

  const handleLike = () => setLikes(likes + 1);

  const handleComment = () => {
    if (commentText.trim()) {
      setComments([...comments, { user: "You", text: commentText }]);
      setCommentText("");
    }
  };

  return (
    <div className="bg-white  
                rounded-xl p-5 mb-6 
                max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl 
                mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <img
          src={avatar || "https://via.placeholder.com/50"}
          alt={user}
          className="w-12 h-12 rounded-full object-cover border border-gray-300"
        />
        <div>
          <h2 className="font-semibold text-gray-900">{user}</h2>
          <p className="text-sm text-gray-500">{time} • {location}</p>
        </div>
      </div>

      {/* Content */}
      <p className="text-gray-800 mt-4">{content}</p>

      {/* Images Gallery */}
      {(postImages || postImage) && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {postImages && postImages.length > 0 ? (
            postImages.map((img, i) => (
              <img
                key={i}
                src={img}
                alt="Post"
                className="rounded-lg w-full object-cover border border-gray-200"
              />
            ))
          ) : postImage ? (
            <img
              src={postImage}
              alt="Post"
              className="rounded-lg w-full object-cover border border-gray-200"
            />
          ) : null}
        </div>
      )}

      {/* Videos Gallery */}
      {postVideos && postVideos.length > 0 && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {postVideos.map((video, i) => (
            <video
              key={i}
              src={video}
              controls
              className="rounded-lg w-full object-cover border border-gray-200"
            />
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-4 mt-4 text-gray-600 items-center">
        <button onClick={handleLike} className="flex items-center gap-1 hover:text-blue-600">
          <img src="https://cdn-icons-png.flaticon.com/128/1077/1077086.png" alt="Like" className="w-5 h-5" />
          <span>{likes}</span>
        </button>
        <button
          onClick={() => setShowComments(true)}
          className="flex items-center gap-1 hover:text-blue-600"
        >
          <img src="https://cdn-icons-png.flaticon.com/128/134/134718.png" alt="Comment" className="w-5 h-5" />
          <span>{comments.length}</span>
        </button>
        {onDelete && (
          <button
            onClick={onDelete}
            className="ml-auto rounded-full border border-gray-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        )}
      </div>

      {showComments && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
    <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-4xl h-[80vh] flex overflow-hidden">
      
      {/* Left side: Post preview */}
      <div className="w-1/2 border-r border-gray-200 p-4 flex flex-col items-left justify-center gap-3 bg-gray-50">
          <p className="text-gray-700 align-left font-semibold">{user}</p>
          
          {/* Display images */}
          {postImages && postImages.length > 0 && (
            <div className="grid grid-cols-1 gap-2">
              {postImages.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt="Post"
                  className="rounded-lg max-h-[40vh] object-cover"
                />
              ))}
            </div>
          )}
          
          {/* Display videos */}
          {postVideos && postVideos.length > 0 && (
            <div className="grid grid-cols-1 gap-2">
              {postVideos.map((video, i) => (
                <video
                  key={i}
                  src={video}
                  controls
                  className="rounded-lg max-h-[40vh] object-cover"
                />
              ))}
            </div>
          )}
          
          {/* Fallback for old postImage format */}
          {!postImages && !postVideos && postImage && (
            <img
              src={postImage}
              alt="Post"
              className="rounded-lg max-h-[60vh] object-cover"
            />
          )}
    
          <p className="text-gray-700 align-left">{content}</p>
        
      </div>

      {/* Right side: Comments */}
      <div className="w-1/2 flex flex-col">
        <h3 className="text-lg font-bold p-4 border-b border-gray-200">Comments</h3>
        
        {/* Scrollable comments list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {comments.map((c, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="font-semibold text-gray-800">{c.user}:</span>
              <span className="text-gray-700">{c.text}</span>
            </div>
          ))}
        </div>

        {/* Add Comment */}
        <div className="border-t border-gray-200 p-4">
          <input
            type="text"
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleComment}
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Comment
          </button>
        </div>
      </div>
    </div>

    {/* Close button */}
    <button
      onClick={() => setShowComments(false)}
      className="absolute top-4 right-4 font-bold text-white hover:text-red-600"
    >
      ✕
    </button>
  </div>
)}
    </div>
  );
}
