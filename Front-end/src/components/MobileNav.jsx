import { NavLink } from "react-router-dom";

function MobileNav() {
  const navClass = ({ isActive }) =>
    `flex flex-col items-center justify-center w-12 h-12 rounded-full transition ${
      isActive ? "bg-cyan-50 text-white" : "text-black hover:bg-gray-100"
    }`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center py-2 md:hidden shadow-md">
      <NavLink to="/" className={navClass}>
        <img src="https://cdn-icons-png.flaticon.com/128/1946/1946436.png" alt="Home" className="w-5 h-5" />
      </NavLink>
      <NavLink to="/explore" className={navClass}>
        <img src="https://cdn-icons-png.flaticon.com/128/565/565504.png" alt="Explore" className="w-5 h-5" />
      </NavLink>
      <NavLink to="/create" className={navClass}>
        <img src="https://cdn-icons-png.flaticon.com/128/1665/1665753.png" alt="Create" className="w-5 h-5" />
      </NavLink>
      <NavLink to="/notifications" className={navClass}>
        <img src="https://cdn-icons-png.flaticon.com/128/1946/1946436.png" alt="Notifications" className="w-5 h-5" />
      </NavLink>
      <NavLink to="/profile" className={navClass}>
        <img src="https://cdn-icons-png.flaticon.com/128/565/565504.png" alt="Profile" className="w-5 h-5" />
      </NavLink>
    </nav>
  );
}
export default MobileNav;