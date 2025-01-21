import RecentPosts from "../components/RecentPosts";
import Posts from "../components/Posts";
import { json, useLocation } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllContentApi,
  getUpvotedContentApi,
  setPosts,
} from "../store/postSlice";

export default function HomePage({ popularData }) {
  const location = useLocation();
  const dispatch = useDispatch();
  const isPopular = location.pathname === "/popular";

  const {
    posts: reduxPosts,
    loading,
    error,
    upvotedContent,
  } = useSelector((state) => state.post);
  const user = useSelector((state) => state.auth.user);

  // Effect to handle data fetching and population
  useEffect(() => {
    if (isPopular && popularData) {
      console.log(popularData);
      dispatch(setPosts(popularData.data.data));
    } else {
      dispatch(getAllContentApi());
    }

    if (user?._id) {
      dispatch(getUpvotedContentApi(user._id));
    }

    return () => {
      if (isPopular) {
        dispatch(setPosts([]));
      }
    };
  }, [dispatch, isPopular, popularData, user?._id]);

  const filteredPosts = useMemo(() => {
    return reduxPosts?.filter((post) => post?.user?.active) || [];
  }, [reduxPosts]);

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
              posts={filteredPosts}
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

export async function loader() {
  const response = await fetch("http://127.0.0.1:3000/api/v1/content");
  const data = await response.json();

  if (!response.ok) {
    return json({ message: "Could not fetch the posts" }, { status: 500 });
  }

  return data.data;
}
