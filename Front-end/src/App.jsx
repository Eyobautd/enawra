import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import Explore from "./pages/Explore";
import Create from "./pages/Create";
import MobileNav from "./components/MobileNav";
import SideBar from "./components/SideBar";

function App() {
  const [posts, setPosts] = useState([
    { 
      id: 1,
      user: "Eyob", 
      content: "Hello world! My first post 🎉", 
      postImage: "https://www.aljazeera.com/wp-content/uploads/2026/04/2026-04-21T200931Z_952468790_UP1EM4L1JZU1T_RTRMADP_3_SOCCER-SPAIN-RMA-ALA-1776950821.jpg?resize=770%2C513&quality=80",
      time: "now",
      avatar: "https://via.placeholder.com/50"
    }
  ]);

  const addPost = (newPost) => {
    // Convert attachments to blob URLs and separate images from videos
    const postImages = [];
    const postVideos = [];
    
    if (newPost.attachments && newPost.attachments.length > 0) {
      newPost.attachments.forEach((file) => {
        const blobUrl = URL.createObjectURL(file);
        if (file.type.startsWith("image/")) {
          postImages.push(blobUrl);
        } else if (file.type.startsWith("video/")) {
          postVideos.push(blobUrl);
        }
      });
    }

    const post = {
      id: posts.length + 1,
      user: "You",
      content: newPost.text || "",
      postImage: postImages.length > 0 ? postImages[0] : null,
      postImages: postImages,
      postVideos: postVideos,
      time: "now",
      avatar: "https://via.placeholder.com/50"
    };
    setPosts([post, ...posts]);
  };

  const deletePost = (id) => {
    setPosts(posts.filter((post) => post.id !== id));
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <div className="flex-1 flex">
          <SideBar />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Home posts={posts} onPost={addPost} />} />
              <Route path="/profile" element={<Profile posts={posts} onDelete={deletePost} />} />
              <Route path="/create" element={<Create onPost={addPost} />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/explore" element={<Explore />} />
            </Routes>
          </div>
        </div>
        <MobileNav/>
      </div>
    </Router>
  );
}

export default App;