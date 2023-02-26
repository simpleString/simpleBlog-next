import { useEffect } from "react";
import { useScrollState } from "../../store";
import { trpc } from "../../utils/trpc";
import LoadingSpinner from "../LoadingSpinner";
import { PostComponent } from "./PostComponent";

const PostList = () => {
  const { data: posts, isLoading: postLoading } = trpc.useQuery(["post.posts"]);
  const { scrollPosition, updateScrollPosition } = useScrollState();

  useEffect(() => {
    const onScroll = (e: Event) => {
      const window = e.currentTarget as Window;
      updateScrollPosition(window.scrollY);
    };

    window.scrollTo(0, scrollPosition);
    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, [scrollPosition, updateScrollPosition]);

  return (
    <div className="md:p-4">
      {postLoading ? (
        <LoadingSpinner />
      ) : (
        posts?.map((post) => <PostComponent key={post.id} post={post} />)
      )}
    </div>
  );
};

export default PostList;
