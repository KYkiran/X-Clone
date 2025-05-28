import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { POSTS } from "../../utils/db/dummy";

const Posts = () => {
    const isLoading = false;

    if (isLoading) {
        return (
            <div className="flex flex-col justify-center">
                <PostSkeleton />
                <PostSkeleton />
                <PostSkeleton />
            </div>
        );
    }

    if (!POSTS || POSTS.length === 0) {
        return <p className="text-center my-4">No posts in this tab. Switch 👻</p>;
    }

    return (
        <div>
            {POSTS.map((post) => (
                <Post key={post._id} post={post} />
            ))}
        </div>
    );
};

export default Posts;