import RecentPosts from "../components/RecentPosts";
import Posts from "../components/Posts";
import { json, useLocation } from "react-router-dom";
import { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllContentApi,
  getUpvotedContentApi,
  upvoteContentApi,
} from "../store/postSlice"; // Adjust the import path as needed

export default function HomePage({ popularData }) {
  const location = useLocation();
  const dispatch = useDispatch();

  const reduxPosts = useSelector((state) => state.post.posts);
  const loading = useSelector((state) => state.post.loading);
  const error = useSelector((state) => state.post.error);
  const user = useSelector((state) => state.auth.user);
  const upvotedContent = useSelector((state) => state.post.upvotedContent);

  useEffect(() => {
    const fetchInitialData = () => {
      dispatch(getAllContentApi());
      if (user?._id) {
        dispatch(getUpvotedContentApi(user._id));
      }
    };
    fetchInitialData();
  }, [dispatch, user?._id]);

  const { posts, isPopular } = useMemo(() => {
    const isPopular = location.pathname === "/popular";
    const rawData = isPopular ? popularData : { data: reduxPosts };

    const filteredPosts = {
      ...rawData,
      data: rawData.data?.filter((post) => post?.user?.active) || [],
    };

    return { posts: filteredPosts, isPopular };
  }, [location.pathname, popularData, reduxPosts]);

  if (loading && !isPopular) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (error && !isPopular) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="pt-14 flex flex-col">
        <main className="flex-1 ml-56">
          <div className="container mx-auto px-4 py-8 flex relative">
            <Posts
              posts={posts}
              // onUpvote={handleUpvote}
              upvotedContent={upvotedContent}
              currentUser={user}
            />
            <div className="absolute top-8 right-4">
              <RecentPosts />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// The loader function can still be used for the popular route or as a fallback
export async function loader() {
  const response = await fetch("http://127.0.0.1:3000/api/v1/content");
  const data = await response.json();

  if (!response.ok) {
    return json({ message: "Could not fetch the posts" }, { status: 500 });
  }

  return data.data;
}
