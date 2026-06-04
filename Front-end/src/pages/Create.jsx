import { useNavigate } from "react-router-dom";
import CreatePost from "../components/CreatePost";

export default function Create({ onPost }) {
  const navigate = useNavigate();

  const handleNewPost = (post) => {
    if (onPost) {
      onPost(post);
    }
    // Redirect to home after posting
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Create a New Post</h1>
        <CreatePost onPost={handleNewPost} />
      </div>
    </div>
  );
}
