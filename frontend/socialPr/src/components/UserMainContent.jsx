import { Cake, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./UI/CardComp";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./UI/Tabs";
import UserPost from "./UserPost";
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useMemo } from "react";
import {
  setBookMarkedPost,
  setPosts,
  upvoteContentApi,
} from "@/store/postSlice";
import SavedContent from "./SavedContent";

import { useParams } from "react-router-dom";

export default function UserMainContent() {
  const { userId } = useParams();
  const dispatch = useDispatch();

  // const [currentPage, setCurrentPage] = useState(1);
  const { user, profileUser, loading, error } = useSelector(
    (state) => state.auth
  );

  const isLoggedInUserProfile = user?._id === profileUser?.userData.Id;
  const renderData = profileUser;

  // useEffect(() => {
  //   dispatch(fetchUserData(userId, currentPage));
  // }, [userId, currentPage, dispatch]);

  const handleUpvote = useCallback(
    (postId) => {
      try {
        dispatch(upvoteContentApi(postId));
      } catch (error) {
        console.error("Upvote failed:", error);
      }
    },
    [dispatch]
  );

  useEffect(() => {
    if (renderData) {
      dispatch(setPosts(renderData.contents));
    }
  }, [renderData, dispatch]);

  const selectPostState = (state) => state.post;
  const { posts, bookMarkedPost } = useSelector(selectPostState);

  // const handlePageChange = (newPage) => {
  //   // dispatch(fetchUserData(userId, newPage));
  //   setCurrentPage(newPage);
  // };

  useEffect(() => {
    if (
      profileUser?.bookmarkedContents &&
      profileUser.bookmarkedContents.length > 0
    ) {
      dispatch(setBookMarkedPost(profileUser.bookmarkedContents));
    }
  }, [profileUser?.bookmarkedContents, dispatch]);

  const memoizedSavedContent = useMemo(
    () => (
      <SavedContent
        bookmarkedCont={profileUser?.bookmarkedContents}
        bookMarkedPost={bookMarkedPost}
      />
    ),
    [profileUser?.bookmarkedContents, bookMarkedPost]
  );

  return (
    <main className="max-w-5xl mx-auto px-6 py-8 flex flex-col md:flex-row gap-8">
      <div className="md:w-2/3">
        <Tabs defaultValue="overview" className="w-full">
          {isLoggedInUserProfile && (
            <TabsList className="w-full justify-start bg-white rounded-lg h-12 mb-6">
              <TabsTrigger value="overview" className="px-8">
                OVERVIEW
              </TabsTrigger>
              <TabsTrigger value="saved" className="px-8">
                SAVED
              </TabsTrigger>
            </TabsList>
          )}

          <TabsContent value="overview" className="space-y-4">
            {renderData?.contents && renderData.contents.length > 0 ? (
              posts.map((post) => (
                <UserPost
                  key={post?._id}
                  post={post}
                  id={renderData?.userData.Id}
                  name={renderData.userData.name}
                  onUpvote={handleUpvote}
                  currentUser={user}
                />
              ))
            ) : (
              <Card className="p-8 text-center">
                <p className="text-gray-500">No posts yet</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="saved">{memoizedSavedContent}</TabsContent>
        </Tabs>
        {/* {pagination && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        )} */}
      </div>

      <div className="md:w-1/3 space-y-6">
        <Card>
          <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardTitle className="flex items-center">
              <Cake className="w-5 h-5 mr-2" />
              Cake day
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center text-gray-700">
              <Calendar className="w-5 h-5 mr-3 text-purple-500" />
              <span>May 24, 2018</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
