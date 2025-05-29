import { Link } from "react-router-dom";
import RightPanelSkeleton from "../skeletons/RightPanelSkeleton.tsx";
import { useQuery } from "@tanstack/react-query";
import useFollow from "../../hooks/useFollow.tsx";
import LoadingSpinner from "./LoadingSpinner.tsx";

// --- Type Definitions ---
interface User {
  _id: string;
  username: string;
  fullName: string;
  profileImg?: string; // profileImg is optional
}

// --- RightPanel Component ---
const RightPanel: React.FC = () => {
  const {
    data: suggestedUsers,
    isLoading,
    isError, // Add isError and error for better error handling in the UI
    error,
  } = useQuery<User[]>({
    queryKey: ["suggestedUsers"], // Changed 'isSuggestedUsers' to 'suggestedUsers' for clarity
    queryFn: async (): Promise<User[]> => {
      try {
        const res = await fetch("/api/users/suggested");
        const data = await res.json(); // Explicitly type the raw data

		console.log(data.data);

        if (!res.ok) {
       
          throw new Error((data as { error: string }).error || `HTTP error! Status: ${res.status}`);
        }

      
        
        if (!Array.isArray(data.data)) {
            console.error("API response for suggested users is not an array:", data);
            throw new Error("Unexpected API response format for suggested users.");
        }
		
        return data.data; // Cast to User[] as we've confirmed it's an array
      } catch (err) {
        // Ensure error is treated as an Error object for consistent message access
        throw new Error((err as Error).message || "Failed to fetch suggested users");
      }
    },
  });

  const {follow,isPending}=useFollow();

  if(suggestedUsers?.length === 0) return <div className="md:w-64 w-0"></div>

  return (
    <div className='hidden lg:block my-4 mx-2'>
      <div className='bg-[#16181C] p-4 rounded-md sticky top-2'>
        <p className='font-bold'>Who to follow</p>
        <div className='flex flex-col gap-4'>
          {/* Loading State */}
          {isLoading && (
            <>
              <RightPanelSkeleton />
              <RightPanelSkeleton />
              <RightPanelSkeleton />
              <RightPanelSkeleton />
            </>
          )}

          {/* Error State */}
          {isError && (
            <p className="text-center my-4 text-red-500">
              Error: {error?.message || "Could not load suggestions."}
            </p>
          )}

          {/* No Suggestions / Loaded State */}
          {!isLoading && !isError && (!suggestedUsers || suggestedUsers.length === 0) && (
            <p className="text-center text-sm text-gray-500">No suggestions at the moment.</p>
          )}

          {/* Display Suggested Users */}
          {!isLoading && !isError && suggestedUsers && suggestedUsers.length > 0 &&
            suggestedUsers.map((user: User) => (
              <Link
                to={`/profile/${user.username}`}
                className='flex items-center justify-between gap-4'
                key={user._id}
              >
                <div className='flex gap-2 items-center'>
                  <div className='avatar'>
                    <div className='w-8 rounded-full'>
                      <img
                        src={user.profileImg || "/avatar-placeholder.png"}
                        alt={`${user.fullName} avatar`}
                      />
                    </div>
                  </div>
                  <div className='flex flex-col'>
                    <span className='font-semibold tracking-tight truncate w-28'>
                      {user.fullName}
                    </span>
                    <span className='text-sm text-slate-500'>@{user.username}</span>
                  </div>
                </div>
                <div>
                  <button
                    className='btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm'
                    onClick={(e)=>
                      {
                        e.preventDefault(); 
                        follow(user._id); 
                      
                    }}
                  >
                    {isPending ? <LoadingSpinner size="sm"/> : "Follow"}
                  </button>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
};

export default RightPanel;