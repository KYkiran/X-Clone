import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const useUpdateUserProfile = () => {
	const queryClient = useQueryClient();

	const { mutate: updateProfile, isPending: isUpdatingProfile } = useMutation({
			mutationFn: async (formData): Promise<any> => {
				try {
					const res = await fetch('/api/users/update', {
						method: "POST",
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify(formData),
					});
					
					const responseData = await res.json();
					
					if (!res.ok) {
						throw new Error(responseData.message || "Failed to update profile");
					}
					
					return responseData;
				} catch (error) {
					throw new Error((error as Error).message || "An error occurred while updating profile");
				}
			},
			onSuccess: () => {
				toast.success("Profile Updated Successfully");
				
				// Close the modal
				const modal = document.getElementById("edit_profile_modal") as HTMLDialogElement;
				modal?.close();
				
				// Invalidate queries to refetch updated data
				Promise.all([
					queryClient.invalidateQueries({ queryKey: ["authUser"] }),
					queryClient.invalidateQueries({ queryKey: ["userProfile"] }),
				]);
			},
			onError: (error: Error) => {
				toast.error(error.message);
			}
		});

	return { updateProfile, isUpdatingProfile };
};

export default useUpdateUserProfile;