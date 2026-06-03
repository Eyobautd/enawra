import { NavLink } from "react-router-dom";

export default function Sidebar({ onCreatePostClick }) {
  const links = [
    { name: "Home", path: "/" },
    { name: "Explore", path: "/explore" },
    { name: "Create", path: "/create" },
    { name: "Notifications", path: "/notifications" },
    { name: "Profile", path: "/profile" },
  ];

  const getLinkClass = ({ isActive }) =>
    `block px-3 py-2 rounded-lg transition ${
      isActive ? "bg-black text-white" : "text-black hover:bg-gray-100"
    }`;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4 hidden md:block sticky top-[64px] h-[calc(100vh-64px)] overflow-y-auto">
      <ul className="space-y-3">
        {links.map((link, i) => (
          <li key={i}>
            <NavLink to={link.path} className={getLinkClass}>
              {link.name}
            </NavLink>
          </li>
        ))}

        {onCreatePostClick && (
          <li>
            <button
              onClick={onCreatePostClick}
              className="w-full text-left px-3 py-2 rounded-lg cursor-pointer text-black hover:bg-gray-100"
            >
              Create Post
            </button>
          </li>
        )}
      </ul>
    </aside>
  );
}
