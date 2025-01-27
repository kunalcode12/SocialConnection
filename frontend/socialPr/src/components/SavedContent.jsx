import { memo } from "react";
import UserPost from "../components/UserPost";

const SavedContent = memo(({ bookmarkedCont, bookMarkedPost }) => {
  console.log(bookmarkedCont);
  return (
    <>
      {bookmarkedCont && bookmarkedCont.length > 0 ? (
        bookMarkedPost?.map((post) => (
          <UserPost
            key={post?._id}
            post={post}
            id={post?.user._id}
            name={post?.user.name}
            isbookMarkedPost={true}
          />
        ))
      ) : (
        <div>No content available</div>
      )}
    </>
  );
});

SavedContent.displayName = "SavedContent";

export default SavedContent;
