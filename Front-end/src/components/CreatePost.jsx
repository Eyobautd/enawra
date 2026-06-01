import { useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function CreatePost({ onPost, onPostCreated }) {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  const defaultAvatar = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDR8H0rgV-zmSodkT_erGjzA_VhfWE22Pg7Q&s";

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImage(null);
  };

  const handleSubmit = async () => {
    if (!text.trim() && !image) return;

    setLoading(true);
    try {
      const newPost = await api.posts.createPost(
        text,
        image,
        image ? 'image' : null
      );
      
      if (onPostCreated) {
        onPostCreated(newPost);
      }
      if (onPost) {
        onPost(newPost);
      }
      
      setText("");
      setImage(null);
    } catch (err) {
      console.error("Failed to create post:", err);
      alert(err.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto shadow-sm">
      <div className="flex gap-3 items-start">
        <img
          src={user?.profilePhoto || defaultAvatar}
          alt="Profile"
          className="w-10 h-10 rounded-full border border-gray-300 object-cover"
        />
        <div className="flex-1">
          <textarea
            className="w-full border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black text-gray-800 placeholder-gray-400 bg-white"
            placeholder="What's on your mind?"
            rows="3"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      {/* Selected Image Preview */}
      {image && (
        <div className="mt-3 relative rounded-xl border border-gray-100 overflow-hidden max-h-60 group">
          <img
            src={image}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <button
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center font-bold text-xs cursor-pointer transition shadow"
            title="Remove Image"
          >
            ✕
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
        <div className="flex gap-2">
          {/* Photo Uploader Icon */}
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              disabled={loading}
            />
            <div className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-150 rounded-xl transition shadow-sm">
              <img
                src="https://cdn-icons-png.flaticon.com/128/3143/3143615.png"
                alt="Upload Photo"
                className="w-[18px] h-[18px]"
              />
              <span className="text-xs font-bold text-gray-700 hidden sm:inline">Add Photo</span>
            </div>
          </label>
        </div>

        {/* Post Button */}
        <button
          onClick={handleSubmit}
          disabled={(!text.trim() && !image) || loading}
          className="bg-black text-white px-5 py-2 rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold text-sm cursor-pointer shadow-sm"
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </div>
    </div>
  );
}
