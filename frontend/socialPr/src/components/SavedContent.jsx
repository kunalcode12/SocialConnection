import { memo } from "react";
import UserPost from "../components/UserPost";

const SavedContent = memo(({ bookmarkedCont, bookMarkedPost }) => {
  return (
    <>
      {bookmarkedCont && bookmarkedCont.length > 0 ? (
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
      )}
    </>
  );
});

SavedContent.displayName = "SavedContent";

export default SavedContent;
