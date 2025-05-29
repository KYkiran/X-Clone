import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const useFollow = () => {
	const queryClient = useQueryClient();

	const { mutate: follow, isPending } = useMutation<void, Error, string>({
		mutationFn: async (userId: string) => {
			try {
                const res = await fetch(`/api/users/follow/${userId}`, {
                				method: "POST",
                			});
                
                			const data = await res.json();
                			if (!res.ok) {
                				throw new Error(data.msg || "Something went wrong!");
                			}
            } catch (error) {
                throw new Error((error as Error).message || "Failed to follow user");
            }
		},
		onSuccess: () => {
			Promise.all([
				queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] }),
				queryClient.invalidateQueries({ queryKey: ["authUser"] }),
			]);
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});

	return { follow, isPending };
};

export default useFollow;
