import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center shadow-sm sticky top-0 z-50">
      {/* Logo */}
      <h1 className="text-xl font-bold text-black">ENAWERA.</h1>

      <Link to="/profile">
        
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDR8H0rgV-zmSodkT_erGjzA_VhfWE22Pg7Q&s"
          alt="Profile"
          className="w-10 h-10 rounded-full border border-gray-300 hover:ring-2 hover:ring-blue-500 transition"
        />
      </Link>
    </nav>
  );
}
