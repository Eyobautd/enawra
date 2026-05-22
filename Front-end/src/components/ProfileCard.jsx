export default function ProfileCard({ name, bio, posts = 0, followers = 0, following = 0 }) {
  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-3xl font-bold">{name}</h1>
          <p className="mt-2 text-gray-600">{bio}</p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
          <span>{posts} posts</span>
          <span>{followers} followers</span>
          <span>{following} following</span>
        </div>
      </div>
    </div>
  );
}
