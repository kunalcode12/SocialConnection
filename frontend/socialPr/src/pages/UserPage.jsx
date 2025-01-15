import { Avatar, AvatarFallback, AvatarImage } from "../components/UI/Avatar";
import { Button } from "../components/UI/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/UI/CardComp";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/UI/Tabs";
import { Award, Calendar, Cake, Gift, UserX } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { fetchUserData } from "../store/authSlice";
import { useEffect } from "react";
import LoadingBar from "../components/UI/LoadingBar";
import UserPost from "../components/UserPost";
import { setPosts } from "../store/postSlice";
import { Outlet } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { setBookMarkedPost } from "../store/postSlice";
import SavedContent from "@/components/SavedContent";
import { useMemo } from "react";

export default function UserProfile() {
  const location = useLocation();
  const { userId } = useParams();
  const dispatch = useDispatch();
  const { user, profileUser, loading, error } = useSelector(
    (state) => state.auth
  );

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserData(userId, token));
    }
    // console.log("dispatching");
  }, [userId, token, dispatch]);

  const isLoggedInUserProfile = user?._id === profileUser?._id;

  let renderData;
  if (isLoggedInUserProfile) {
    renderData = profileUser;
  } else {
    renderData = profileUser;
  }

  // console.log(renderData.bookmarkedCont[0].content);
  // renderData.bookmarkedCont?.map((post) => console.log(post?.content));

  useEffect(() => {
    if (renderData) {
      dispatch(setPosts(renderData.contents));
    }
  }, [renderData, dispatch]);

  const selectPostState = (state) => state.post;
  const { posts, bookMarkedPost } = useSelector(selectPostState);

  useEffect(() => {
    if (profileUser?.bookmarkedCont && profileUser.bookmarkedCont.length > 0) {
      dispatch(setBookMarkedPost(profileUser.bookmarkedCont));
    }
  }, [profileUser?.bookmarkedCont, dispatch]);

  const memoizedSavedContent = useMemo(
    () => (
      <SavedContent
        bookmarkedCont={profileUser?.bookmarkedCont}
        bookMarkedPost={bookMarkedPost}
      />
    ),
    [profileUser?.bookmarkedCont, bookMarkedPost]
  );

  if (loading) {
    return <LoadingBar />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <UserX className="w-16 h-16 text-gray-400 mb-4 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            No User Data Available
          </h2>
          <p className="text-gray-600">
            We couldnt find any data for this user profile.
          </p>
          <Link to="/">
            <Button variant="outline" className="mt-4">
              Go Back
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gray-100 min-h-screen pt-12 pl-52">
        {" "}
        {/* Added pt-4 and pr-4 here */}
        <header className="bg-white border-b">
          <div className="max-w-5xl mx-auto px-4 py-4 flex bottom-28 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
                <AvatarImage
                  src="/placeholder.svg?height=80&width=80"
                  alt="@username"
                />
                <AvatarFallback>UN</AvatarFallback>
              </Avatar>
              <div className="">
                <h1 className="text-2xl font-bold">{`u/${renderData.name}`}</h1>
                <p className="text-gray-500">{`u/${renderData.name}`}</p>
              </div>
            </div>

            {!isLoggedInUserProfile && (
              <div className="flex space-x-2">
                <Button variant="outline">Follow</Button>
                <Button variant="outline">Chat</Button>
              </div>
            )}
            {isLoggedInUserProfile && (
              <Link to={`${location.pathname}/profile`}>
                <Button variant="outline">Edit Profile</Button>
              </Link>
            )}
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-8 flex">
          <div className="w-2/3 pr-8">
            <Tabs defaultValue="overview" className="w-full">
              {isLoggedInUserProfile && (
                <TabsList className="w-full justify-center bg-white h-16 border-b mb-4">
                  <TabsTrigger value="overview">OVERVIEW</TabsTrigger>
                  <TabsTrigger value="posts">POSTS</TabsTrigger>
                  <TabsTrigger value="comments">COMMENTS</TabsTrigger>
                  <TabsTrigger value="upvoted">UPVOTED</TabsTrigger>
                  <TabsTrigger value="downvoted">DOWNVOTED</TabsTrigger>
                  <TabsTrigger value="saved">SAVED</TabsTrigger>
                </TabsList>
              )}
              <TabsContent value="overview">
                {renderData.contents && renderData.contents.length > 0 ? (
                  posts.map((post) => (
                    <UserPost
                      key={post?._id}
                      post={post}
                      id={renderData?._id}
                      name={renderData.name}
                    />
                  ))
                ) : (
                  <div>No content available</div>
                )}
              </TabsContent>
              <TabsContent value="posts">Posts content</TabsContent>
              <TabsContent value="comments">Comments content</TabsContent>
              <TabsContent value="upvoted">Upvoted content</TabsContent>
              <TabsContent value="downvoted">Downvoted content</TabsContent>

              <TabsContent value="saved">
                {/* {renderData.bookmarkedCont &&
                renderData.bookmarkedCont.length > 0 ? (
                  bookMarkedPost?.map((post) => (
                    <UserPost
                      key={post?.content._id}
                      post={post?.content}
                      id={post?.content.user}
                      name={"someUser"}
                      isbookMarkedPost={true}
                    />
                  ))
                ) : (
                  <div>No content available</div>
                )} */}

                {memoizedSavedContent}
              </TabsContent>
            </Tabs>
          </div>
          <div className="w-1/3">
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Karma</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between">
                  <div className="text-center">
                    <p className="font-bold">4,781</p>
                    <p className="text-sm text-gray-500">Post Karma</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold">10,283</p>
                    <p className="text-sm text-gray-500">Comment Karma</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Cake day</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center">
                <Cake className="w-5 h-5 mr-2" />
                <span>May 24, 2018</span>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Trophy Case</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <Award className="w-5 h-5 mr-2 text-yellow-500" />
                    <span>Verified Email</span>
                  </li>
                  <li className="flex items-center">
                    <Gift className="w-5 h-5 mr-2 text-red-500" />
                    <span>Secret Santa</span>
                  </li>
                  <li className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-green-500" />
                    <span>One-Year Club</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      <Outlet />
    </>
  );
}
