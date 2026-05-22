import { useMemo, useState } from "react";

const people = [
  { name: "Amina Chen", username: "@aminac", bio: "UI designer and sketch artist." },
  { name: "Jalen Brooks", username: "@jbrooks", bio: "Product manager building smart apps." },
  { name: "Priya Patel", username: "@priyap", bio: "Frontend engineer who loves accessibility." },
  { name: "Noah Kim", username: "@noahk", bio: "Growth marketer and community builder." },
  { name: "Mira Alvarez", username: "@mira_dev", bio: "React dev, coffee enthusiast." },
];

export default function Explore() {
  const [query, setQuery] = useState("");

  const filteredPeople = useMemo(() => {
    const lowercaseQuery = query.toLowerCase();
    return people.filter(
      (person) =>
        person.name.toLowerCase().includes(lowercaseQuery) ||
        person.username.toLowerCase().includes(lowercaseQuery) ||
        person.bio.toLowerCase().includes(lowercaseQuery)
    );
  }, [query]);

  return (
    <main className="p-6">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold">Explore people</h1>
          <p className="text-gray-600 mt-2">Search for people to connect with and follow.</p>
        </div>

        <div className="max-w-xl">
          <label className="sr-only" htmlFor="search">
            Search people
          </label>
          <input
            id="search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, handle, or bio"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-black focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {filteredPeople.length > 0 ? (
            filteredPeople.map((person) => (
              <div key={person.handle} className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-black">{person.name}</p>
                    <p className="text-sm text-gray-500">{person.username}</p>
                  </div>
                  <button className="rounded-full border border-black px-4 py-2 text-black transition hover:bg-black hover:text-white">
                    Follow
                  </button>
                </div>
                <p className="mt-3 text-gray-600">{person.bio}</p>
              </div>
            ))
          ) : (
            <div className="rounded-3xl border border-gray-200 bg-white p-6 text-center text-gray-600 shadow-sm">
              No results found. Try another search term.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
