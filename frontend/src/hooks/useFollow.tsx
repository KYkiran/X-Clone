import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const useFollow = () => {
	const queryClient = useQueryClient();

	const { mutate: follow, isPending } = useMutation<void, Error, string>({
		mutationFn: async (userId: string) => {
			const res = await fetch(`/api/users/follow/${userId}`, {
				method: "POST",
			});

			const data = await res.json();
			if (!res.ok) {
				throw new Error(data.error || "Something went wrong!");
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
