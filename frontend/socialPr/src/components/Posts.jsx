import Post from "./Post";
import { useLoaderData } from "react-router-dom";

function Posts({ posts }) {
  const postmain = posts.data;
  const postdata = useLoaderData();

  return (
    <div className="w-2/3 pr-4">
      {postmain.map((post) => (
        <Post
          key={post.id}
          post={post}
          id={post.user._id}
          name={post.user.name}
        />
      ))}
    </div>
  );
}

export default Posts;
