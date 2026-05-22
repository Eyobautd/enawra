import { useState } from "react";

export default function CreatePost({ onPost }) {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [preview, setPreview] = useState([]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = [...attachments, ...files];
    const newPreviews = files.map((file) => {
      return {
        file,
        url: URL.createObjectURL(file),
        type: file.type.split("/")[0], // 'image' or 'video'
      };
    });
    setAttachments(newAttachments);
    setPreview([...preview, ...newPreviews]);
  };

  const removeAttachment = (index) => {
    URL.revokeObjectURL(preview[index].url);
    setAttachments(attachments.filter((_, i) => i !== index));
    setPreview(preview.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (text.trim() || attachments.length > 0) {
      onPost({
        text,
        attachments,
      });
      setText("");
      setAttachments([]);
      setPreview([]);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto">
      <textarea
        className="w-full border border-gray-300 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="What's on your mind?"
        rows="4"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      {/* Preview Attachments */}
      {preview.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {preview.map((item, index) => (
            <div key={index} className="relative group">
              {item.type === "image" ? (
                <img
                  src={item.url}
                  alt="preview"
                  className="w-full h-32 object-cover rounded-lg"
                />
              ) : (
                <video
                  src={item.url}
                  className="w-full h-32 object-cover rounded-lg"
                  controls
                />
              )}
              <button
                onClick={() => removeAttachment(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex gap-2">
          {/* Image Upload */}
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition">
              <img
                src="https://cdn-icons-png.flaticon.com/128/3143/3143615.png"
                alt="image"
                className="w-5 h-5"
              />
              <span className="text-sm font-medium hidden sm:inline">Image</span>
            </div>
          </label>

          {/* Video Upload */}
          <label className="cursor-pointer">
            <input
              type="file"
              accept="video/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition">
              <img
                src="https://cdn-icons-png.flaticon.com/128/3143/3143619.png"
                alt="video"
                className="w-5 h-5"
              />
              <span className="text-sm font-medium hidden sm:inline">Video</span>
            </div>
          </label>
        </div>

        {/* Post Button */}
        <button
          onClick={handleSubmit}
          disabled={!text.trim() && attachments.length === 0}
          className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
        >
          Post
        </button>
      </div>
    </div>
  );
}
