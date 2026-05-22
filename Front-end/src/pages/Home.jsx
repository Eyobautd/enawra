import CreatePost from "../components/CreatePost";
import PostCard from "../components/PostCard";
import RightSidebar from "../components/RightSideBar";

export default function Home({ posts, onPost }) {
  return (
    <div className="flex">
      <main className="flex-1 p-6">
        <CreatePost onPost={onPost} />
        {posts.map((p) => (
          <PostCard key={p.id} user={p.user} avatar={p.avatar} content={p.content} postImage={p.postImage} time={p.time} />
        ))}
      </main>
      <RightSidebar />
    </div>
  );
}

