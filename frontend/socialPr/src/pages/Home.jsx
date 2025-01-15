import RecentPosts from "../components/RecentPosts";
import Posts from "../components/Posts";
import { useLoaderData, json, useLocation } from "react-router-dom";
import { useMemo } from "react";

export default function HomePage({ popularData }) {
  const location = useLocation();
  const loaderData = useLoaderData();

  const { posts, isPopular } = useMemo(() => {
    const isPopular = location.pathname === "/popular";
    const rawData = isPopular ? popularData : loaderData;

    const filteredPosts = {
      ...rawData,
      data: rawData.data?.filter((post) => post?.user?.active) || [],
    };

    return { posts: filteredPosts, isPopular };
  }, [location.pathname, popularData, loaderData]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="pt-14 flex flex-col">
        <main className="flex-1 ml-56">
          <div className="container mx-auto px-4 py-8 flex relative">
            <Posts posts={posts} />
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
