import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

type PostType = {
  _id: string;

};


type PostsProps = {
  feedType: "forYou" | "following"; // Enforces these specific string values
};


const Posts = ({ feedType }: PostsProps) => {
  
  const getPostEndpoint = (type: PostsProps["feedType"]): string => {
    switch (type) {
      case "forYou":
        return "/api/posts/all";
      case "following":
        return "/api/posts/following";
      default:

        return "/api/posts/all";
    }
  };

  const POST_ENDPOINT = getPostEndpoint(feedType);

  

  const {
    data, 
    isLoading, 
    isError,   
    error,
    refetch,
    isRefetching    
  } = useQuery<PostType[]>({
    queryKey: ["posts", feedType], 
    queryFn: async (): Promise<PostType[]> => {
      try {
        const res = await fetch(POST_ENDPOINT);
        const result = await res.json(); 

        if (!res.ok) {
   
          throw new Error(result.error || `HTTP error! Status: ${res.status}`);
        }
        console.log(result.data);
        
        if (Array.isArray(result.data)) {
          return result.data;
        } else if (Array.isArray(result)) {
          return result;
        } else {
          console.error("API response is not an array or does not contain a 'posts' array:", result);
          throw new Error("Unexpected API response format from server.");
        }
      } catch (err) {
        console.error("Error fetching posts:", err);
        throw err; 
      }
    },
  });

  useEffect(()=>{
    refetch();
  },[feedType, refetch])

  if (isLoading || isRefetching) {
    return (
      <div className="flex flex-col justify-center">
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-center my-4 text-red-500">
        Error loading posts: {error?.message || "Something went wrong."}
      </p>
    );
  }

  
  if (!isLoading && !isRefetching && (!data || data.length === 0)) {
    return <p className="text-center my-4">No posts in this tab. Switch 👻</p>;
  }

  return (
    <div>
      
      {data.map((post) => (
        <Post key={post._id} post={post} />
      ))}
    </div>
  );
};

export default Posts;