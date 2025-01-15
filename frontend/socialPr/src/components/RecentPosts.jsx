import React, { useState, useEffect } from "react";
import { ArrowUpIcon, MessageSquareIcon } from "lucide-react";
import { json } from "react-router-dom";

const RecentPosts = () => {
  const [scrollY, setScrollY] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [recentData, setRecentData] = useState([]);

  useEffect(() => {
    async function fetchdata() {
      try {
        setLoading(true);
        const response = await fetch(
          "http://127.0.0.1:3000/api/v1/content?sort=-createdAt&limit=6"
        );

        if (!response.ok) {
          return json(
            { message: "Could not fetch the posts" },
            { status: 500 }
          );
        }
        const data = await response.json();
        setRecentData(data?.data?.data);
        setLoading(false);
        setError(false);
      } catch (error) {
        setLoading(false);
        setError(true);
        console.log(error);
      }
    }

    fetchdata();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="w-80 bg-[#F6F8F9] mt-8 rounded-2xl shadow-md flex"
      style={{
        position: "fixed",
        top: `${Math.max(60, 60 - scrollY)}px`,
        right: "20px",
        transition: "top 0.3s ease-out",
      }}
    >
      <div className="w-1 bg-gray-200 rounded-l-xl"></div>
      <div className="flex-1 overflow-hidden">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">RECENT POSTS</h2>
            <button className="text-blue-500 text-sm font-medium">Clear</button>
          </div>
        </div>
        <div className="h-96 overflow-y-auto px-4 pb-4">
          <div className="space-y-4">
            {recentData.map((post, index) => (
              <React.Fragment key={index}>
                <div className="flex space-x-3">
                  <div className="flex-grow">
                    <p className="text-xs text-gray-500">{post?.user.name}</p>
                    <h3 className="text-sm font-medium">{post.title}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="flex items-center text-xs text-gray-500">
                        <ArrowUpIcon className="w-3 h-3 mr-1" />
                        {post.upVote} upvotes
                      </span>
                      <span className="flex items-center text-xs text-gray-500">
                        <MessageSquareIcon className="w-3 h-3 mr-1" />
                        {post?.comments} comments
                      </span>
                    </div>
                  </div>
                  {post.url && (
                    <img
                      src={""}
                      alt={post.title}
                      className="w-10 h-10 object-cover rounded"
                    />
                  )}
                </div>
                {index < recentData.length - 1 && (
                  <hr className="border-gray-200" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentPosts;
