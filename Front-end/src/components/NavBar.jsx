import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  
  const defaultAvatar = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDR8H0rgV-zmSodkT_erGjzA_VhfWE22Pg7Q&s";

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center shadow-sm sticky top-0 z-50">
      {/* Logo */}
      <Link to="/" className="text-xl font-bold text-black no-underline">
        ENAWERA.
      </Link>

      <div className="flex items-center gap-4">
        {user && (
          <span className="text-sm font-medium text-gray-700 hidden sm:inline">
            Hi, {user.fullName}
          </span>
        )}
        
        <Link to="/profile">
          <img
            src={user?.profilePhoto || defaultAvatar}
            alt="Profile"
            className="w-9 h-9 rounded-full border border-gray-300 hover:ring-2 hover:ring-black/10 transition object-cover"
          />
        </Link>

        <button
          onClick={logout}
          className="text-xs font-semibold text-gray-600 hover:text-black border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition cursor-pointer"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
