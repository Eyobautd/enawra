import ProfileCard from "../components/ProfileCard";
import PostCard from "../components/PostCard";

export default function Profile({ posts, onDelete }) {
  const userPosts = posts.filter((post) => post.user === "You");

  return (
    <div className="p-6">
      <ProfileCard
        name="You"
        bio="Frontend dev, loves React + Tailwind"
        posts={userPosts.length}
        followers={324}
        following={180}
      />

      <div className="space-y-4">
        {userPosts.length > 0 ? (
          userPosts.map((post) => (
            <PostCard
              key={post.id}
              user={post.user}
              avatar={post.avatar}
              content={post.content}
              postImage={post.postImage}
              time={post.time}
              onDelete={() => onDelete(post.id)}
            />
          ))
        ) : (
          <div className="rounded-3xl border border-gray-200 bg-white p-6 text-center text-gray-600 shadow-sm">
            You don&apos;t have any posts yet.
          </div>
        )}
      </div>
    </div>
  );
}
