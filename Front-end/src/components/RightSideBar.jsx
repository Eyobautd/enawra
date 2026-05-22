export default function RightSidebar() {
  const creators = [
    { name: "Faizan", handle: "@faizan" },
    { name: "JavaScript Mastery", handle: "@JSMastery" },
    { name: "Ana Pablova", handle: "@anapablova" },
    { name: "David", handle: "@Lee" },
    { name: "Hobbit", handle: "@isomething" },
  ];

  return (
    <aside className="w-64 bg-white border-l border-gray-200 p-4 hidden lg:block">
      <h2 className="font-bold text-gray-900 mb-4">Top Creators</h2>
      <ul className="space-y-3">
        {creators.map((c, i) => (
          <li key={i} className="flex justify-between items-center">
            <div>
              <p className="font-medium text-gray-800">{c.name}</p>
              <img
                src={`https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDR8H0rgV-zmSodkT_erGjzA_VhfWE22Pg7Q&s`}
                alt={c.name}
                className="w-10 h-10 rounded-full border border-gray-300 hover:ring-2 hover:ring-blue-500 transition"
              />
              <p className="text-sm text-gray-500">{c.handle}</p>
            </div>
            <button className="bg-black text-white px-3 py-1 rounded-lg hover:bg-white hover:text-black border border-black transition">
              Follow
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
