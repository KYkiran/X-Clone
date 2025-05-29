import { FaRegComment, FaRegHeart, FaRegBookmark } from "react-icons/fa"; // Grouped imports
import { BiRepost } from "react-icons/bi";
import { FaTrash } from "react-icons/fa"; // Still needed separately for FaTrash
import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import LoadingSpinner from "./LoadingSpinner";
import { formatPostDate } from "../../utils/date";

// --- Type Definitions ---

// Define the type for a user within a post or comment
type UserType = {
  _id: string;
  username: string;
  fullName: string;
  profileImg?: string; // profileImg might be optional
};

// Define the type for a comment
type CommentType = {
  _id: string;
  text: string;
  user: UserType;
  createdAt: string; // Assuming comments also have a createdAt
};

// Define the type for the Post object itself
type PostType = {
  _id: string;
  text: string;
  img?: string; // image might be optional
  user: UserType;
  likes: string[]; // Array of user IDs (strings)
  comments: CommentType[];
  createdAt: string;
  // Add other properties if your post object has them (e.g., reposts, etc.)
};

// Define the props for the Post component
type PostProps = {
  post: PostType;
};

// Define the type for the authenticated user (from authUser query)
type AuthUserType = UserType & {
  // Add any other properties specific to the authenticated user if they exist
  // e.g., email: string;
};

// --- Post Component ---
const Post = ({ post }: PostProps) => {
  const [comment, setComment] = useState<string>(""); // State for comment input
  // Use useQuery with AuthUserType generic to type authUser
  const { data: authUser } = useQuery<AuthUserType>({ queryKey: ["authUser"] });
  const queryClient = useQueryClient();

  // Ensure postOwner is typed as UserType
  const postOwner: UserType = post.user;

  // Check if authUser exists before accessing _id
  const isLiked = authUser ? post.likes.includes(authUser._id) : false;

  // Check if authUser exists before comparing _id
  const isMyPost = authUser ? authUser._id === post.user._id : false;

  const formattedDate = formatPostDate(post.createdAt);

  // --- Delete Post Mutation ---
  const { mutate: deletePost, isPending: isDeleting } = useMutation<
    void, // Return type of mutate function (void because we don't care about the returned data)
    Error, // Type of the error object
    string // Type of the variable passed to mutateFn (not used here, but good practice)
  >({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/posts/${post._id}`, {
          method: "DELETE",
        });
        const data: { message?: string; error?: string } = await res.json(); // Explicitly type data

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        // No explicit return needed for 'void' type, but 'data' could be returned if needed
      } catch (error) {
        // Ensure error is treated as an Error object
        throw new Error((error as Error).message || "Failed to delete post");
      }
    },
    onSuccess: () => {
      toast.success("Post deleted successfully");
      // Invalidate 'posts' query to refetch the list
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // --- Like Post Mutation ---
  const { mutate: likePost, isPending: isLiking } = useMutation<
    string[], // Expected return type from the API (an array of user IDs for likes)
    Error // Type of the error object
  >({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/posts/like/${post._id}`, {
          method: "POST",
        });
        const data: string[] | { error?: string } = await res.json(); // data can be string[] or an object with error

        if (!res.ok) {
          // If data is an object with an error, throw it
          throw new Error((data as { error: string }).error || "Something went wrong");
        }
        return data as string[]; // Cast to string[] as it's ok
      } catch (error) {
        throw new Error((error as Error).message || "Failed to like post");
      }
    },
    onSuccess: (updatedLikes) => {
      // Update the cache directly for better UX
      queryClient.setQueryData(["posts"], (oldData: PostType[] | undefined) => {
        if (!oldData) return []; // Return empty array if oldData is undefined
        return oldData.map((p) => {
          if (p._id === post._id) {
            return { ...p, likes: updatedLikes }; // Update likes array
          }
          return p;
        });
      });
      // Optionally show a toast here if liked/unliked (if you want to give immediate feedback)
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // --- Comment Post Mutation ---
  const { mutate: commentPost, isPending: isCommenting } = useMutation<
    void, // Return type (we don't need data back for comment)
    Error, // Error type
    string // The 'text' of the comment, passed to mutateFn
  >({
    mutationFn: async (commentText: string) => { // Accept commentText as an argument
      try {
        const res = await fetch(`/api/posts/comment/${post._id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: commentText }), // Use the passed commentText
        });
        const data: { message?: string; error?: string } = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        // No explicit return needed for 'void' type
      } catch (error) {
        throw new Error((error as Error).message || "Failed to post comment");
      }
    },
    onSuccess: () => {
      toast.success("Comment posted successfully");
      setComment(""); // Clear the comment input
      queryClient.invalidateQueries({ queryKey: ["posts"] }); // Refetch all posts to show new comment
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // --- Event Handlers ---
  const handleDeletePost = () => {
    deletePost(); // Trigger the delete mutation
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCommenting || !comment.trim()) return; // Prevent multiple submissions or empty comments
    commentPost(comment); // Pass the comment state to the mutation
  };

  const handleLikePost = () => {
    if (isLiking) return; // Prevent multiple likes while one is pending
    likePost(); // Trigger the like mutation
  };

  return (
    <>
      <div className='flex gap-2 items-start p-4 border-b border-gray-700'>
        <div className='avatar'>
          <Link to={`/profile/${postOwner.username}`} className='w-8 rounded-full overflow-hidden'>
            <img src={postOwner.profileImg || "/avatar-placeholder.png"} alt={`${postOwner.username}'s profile`} />
          </Link>
        </div>
        <div className='flex flex-col flex-1'>
          <div className='flex gap-2 items-center'>
            <Link to={`/profile/${postOwner.username}`} className='font-bold'>
              {postOwner.fullName}
            </Link>
            <span className='text-gray-700 flex gap-1 text-sm'>
              <Link to={`/profile/${postOwner.username}`}>@{postOwner.username}</Link>
              <span>·</span>
              <span>{formattedDate}</span>
            </span>
            {isMyPost && (
              <span className='flex justify-end flex-1'>
                {!isDeleting && (
                  <FaTrash className='cursor-pointer hover:text-red-500' onClick={handleDeletePost} />
                )}
                {isDeleting && <LoadingSpinner size='sm' />}
              </span>
            )}
          </div>
          <div className='flex flex-col gap-3 overflow-hidden'>
            <span>{post.text}</span>
            {post.img && (
              <img
                src={post.img}
                className='h-80 object-contain rounded-lg border border-gray-700'
                alt='Post media'
              />
            )}
          </div>
          <div className='flex justify-between mt-3'>
            <div className='flex gap-4 items-center w-2/3 justify-between'>
              <div
                className='flex gap-1 items-center cursor-pointer group'
                onClick={() => (document.getElementById(`comments_modal${post._id}`) as HTMLDialogElement)?.showModal()}
              >
                <FaRegComment className='w-4 h-4 text-slate-500 group-hover:text-sky-400' />
                <span className='text-sm text-slate-500 group-hover:text-sky-400'>
                  {post.comments.length}
                </span>
              </div>
              {/* DaisyUI Modal Component */}
              <dialog id={`comments_modal${post._id}`} className='modal border-none outline-none'>
                <div className='modal-box rounded border border-gray-600'>
                  <h3 className='font-bold text-lg mb-4'>COMMENTS</h3>
                  <div className='flex flex-col gap-3 max-h-60 overflow-auto'>
                    {post.comments.length === 0 && (
                      <p className='text-sm text-slate-500'>
                        No comments yet 🤔 Be the first one 😉
                      </p>
                    )}
                    {post.comments.map((commentItem) => ( // Renamed 'comment' to 'commentItem' to avoid clash
                      <div key={commentItem._id} className='flex gap-2 items-start'>
                        <div className='avatar'>
                          <div className='w-8 rounded-full'>
                            <img
                              src={commentItem.user.profileImg || "/avatar-placeholder.png"}
                              alt={`${commentItem.user.username}'s profile`}
                            />
                          </div>
                        </div>
                        <div className='flex flex-col'>
                          <div className='flex items-center gap-1'>
                            <span className='font-bold'>{commentItem.user.fullName}</span>
                            <span className='text-gray-700 text-sm'>
                              @{commentItem.user.username}
                            </span>
                          </div>
                          <div className='text-sm'>{commentItem.text}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <form
                    className='flex gap-2 items-center mt-4 border-t border-gray-600 pt-2'
                    onSubmit={handlePostComment}
                  >
                    <textarea
                      className='textarea w-full p-1 rounded text-md resize-none border focus:outline-none border-gray-800'
                      placeholder='Add a comment...'
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <button type="submit" className='btn btn-primary rounded-full btn-sm text-white px-4'>
                      {isCommenting ? <LoadingSpinner size='md' /> : "Post"}
                    </button>
                  </form>
                </div>
                <form method='dialog' className='modal-backdrop'>
                  <button type="submit" className='outline-none'>close</button>
                </form>
              </dialog>

              {/* Repost functionality (currently static) */}
              <div className='flex gap-1 items-center group cursor-pointer'>
                <BiRepost className='w-6 h-6 text-slate-500 group-hover:text-green-500' />
                <span className='text-sm text-slate-500 group-hover:text-green-500'>0</span>
              </div>

              {/* Like Post functionality */}
              <div className='flex gap-1 items-center group cursor-pointer' onClick={handleLikePost}>
                {isLiking && <LoadingSpinner size='sm' />}
                {!isLiked && !isLiking && (
                  <FaRegHeart className='w-4 h-4 cursor-pointer text-slate-500 group-hover:text-pink-500' />
                )}
                {isLiked && !isLiking && (
                  <FaRegHeart className='w-4 h-4 cursor-pointer text-pink-500 ' />
                )}
                <span
                  className={`text-sm group-hover:text-pink-500 ${
                    isLiked ? "text-pink-500" : "text-slate-500"
                  }`}
                >
                  {post.likes.length}
                </span>
              </div>
            </div>
            <div className='flex w-1/3 justify-end gap-2 items-center'>
              <FaRegBookmark className='w-4 h-4 text-slate-500 cursor-pointer' />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Post;