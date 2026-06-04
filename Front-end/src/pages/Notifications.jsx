import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const defaultAvatar = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDR8H0rgV-zmSodkT_erGjzA_VhfWE22Pg7Q&s";

  const fetchNotifications = async () => {
    try {
      const data = await api.notifications.getNotifications();
      setNotifications(data);
      
      // Auto-mark notifications as read on load
      if (data.some(n => !n.read)) {
        await api.notifications.markAsRead();
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setError("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Notifications</h2>
      <p className="text-sm text-gray-500 mb-6">Stay up to date with interactions on your posts.</p>

      {loading ? (
        <div className="text-center py-12 text-gray-500 font-medium">
          <div className="h-6 w-6 border-2 border-gray-300 border-t-black animate-spin rounded-full mx-auto"></div>
          <span className="mt-2 block text-sm">Loading notifications...</span>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500 font-medium">{error}</div>
      ) : notifications.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500 font-medium shadow-sm">
          You're all caught up! No notifications yet.
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((n) => {
            const senderName = n.sender?.fullName || n.sender?.username || "Someone";
            const senderAvatar = n.sender?.profilePhoto || defaultAvatar;
            const postText = n.post?.text ? `"${n.post.text.substring(0, 30)}${n.post.text.length > 30 ? "..." : ""}"` : "your post";
            const time = n.createdAt 
              ? new Date(n.createdAt).toLocaleDateString(undefined, { 
                  month: 'short', 
                  day: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                }) 
              : "";

            return (
              <div 
                key={n._id} 
                className={`flex gap-4 items-center p-4 rounded-2xl border transition hover:shadow-sm duration-200 bg-white ${
                  n.read ? "border-gray-150" : "border-black/10 ring-1 ring-black/5 bg-gray-50/20"
                }`}
              >
                {/* Action Icon Indicator */}
                <div className="flex-shrink-0">
                  {n.type === "like" ? (
                    <div className="h-9 w-9 rounded-full bg-white border border-gray-300  flex items-center justify-center text-sm shadow-sm font-bold">
                      <img src="https://cdn-icons-png.flaticon.com/128/3916/3916769.png" alt="Like" className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-white border border-gray-300  flex items-center justify-center text-sm shadow-sm font-bold">
                      <img src="https://cdn-icons-png.flaticon.com/128/9291/9291723.png" alt="Comment" className="w-5 h-5" />
                    </div>
                  )}
                </div>

                {/* User Avatar */}
                <img
                  src={senderAvatar}
                  alt={senderName}
                  className="w-10 h-10 rounded-full border border-gray-150 object-cover"
                />

                {/* Notification Text */}
                <div className="flex-1">
                  <p className="text-sm text-gray-800 leading-normal">
                    <span className="font-bold text-gray-950">{senderName}</span>{" "}
                    {n.type === "like" ? "liked" : "commented on"} your post{" "}
                    <span className="font-semibold text-gray-600 break-words italic">{postText}</span>
                  </p>
                  <span className="text-[10px] text-gray-400 font-semibold uppercase mt-1 block">
                    {time}
                  </span>
                </div>

                {/* Unread dot */}
                {!n.read && (
                  <div className="h-2.5 w-2.5 rounded-full bg-blue-600 shadow-sm flex-shrink-0 animate-pulse"></div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
