import { useEffect, useState, type ChangeEvent } from "react";
import useUpdateUserProfile from "../../hooks/useUpdateUserProfile";

interface FormData {
	fullName: string;
	username: string;
	email: string;
	bio: string;
	link: string;
	newPassword: string;
	currentPassword: string;
}

interface AuthUser {
	_id: string;
	fullName: string;
	username: string;
	email: string;
	bio: string;
	link: string;
	// Add other properties as needed
}

interface EditProfileModalProps {
	authUser?: AuthUser;
}

const EditProfileModal = ({ authUser }: EditProfileModalProps) => {
	const [formData, setFormData] = useState<FormData>({
		fullName: "",
		username: "",
		email: "",
		bio: "",
		link: "",
		newPassword: "",
		currentPassword: "",
	});


	const {updateProfile,isUpdatingProfile} = useUpdateUserProfile();

	const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};


	useEffect(() => {
		if (authUser) {
			setFormData({
				fullName: authUser.fullName || "",
				email: authUser.email || "",
				username: authUser.username || "",
				bio: authUser.bio || "",
				link: authUser.link || "",
				newPassword: "",
				currentPassword: ""
			});
		}
	}, [authUser]);

	return (
		<>
			<button
				className='btn btn-outline rounded-full btn-sm'
				onClick={() => {
					const modal = document.getElementById("edit_profile_modal") as HTMLDialogElement;
					modal?.showModal();
				}}
			>
				Edit profile
			</button>
			<dialog id='edit_profile_modal' className='modal'>
				<div className='modal-box border rounded-md border-gray-700 shadow-md'>
					<h3 className='font-bold text-lg my-3'>Update Profile</h3>
					<form className='flex flex-col gap-4' onSubmit={(e)=>{
						e.preventDefault();
						updateProfile(formData);
					}}>
						<div className='flex flex-wrap gap-2'>
							<input
								type='text'
								placeholder='Full Name'
								className='flex-1 input border border-gray-700 rounded p-2 input-md'
								value={formData.fullName}
								name='fullName'
								onChange={handleInputChange}
								required
							/>
							<input
								type='text'
								placeholder='Username'
								className='flex-1 input border border-gray-700 rounded p-2 input-md'
								value={formData.username}
								name='username'
								onChange={handleInputChange}
								required
							/>
						</div>
						<div className='flex flex-wrap gap-2'>
							<input
								type='email'
								placeholder='Email'
								className='flex-1 input border border-gray-700 rounded p-2 input-md'
								value={formData.email}
								name='email'
								onChange={handleInputChange}
								required
							/>
							<textarea
								placeholder='Bio'
								className='flex-1 input border border-gray-700 rounded p-2 input-md resize'
								value={formData.bio}
								name='bio'
								onChange={handleInputChange}
								rows={3}
							/>
						</div>
						<div className='flex flex-wrap gap-2'>
							<input
								type='password'
								placeholder='Current Password'
								className='flex-1 input border border-gray-700 rounded p-2 input-md'
								value={formData.currentPassword}
								name='currentPassword'
								onChange={handleInputChange}
							/>
							<input
								type='password'
								placeholder='New Password'
								className='flex-1 input border border-gray-700 rounded p-2 input-md'
								value={formData.newPassword}
								name='newPassword'
								onChange={handleInputChange}
							/>
						</div>
						<input
							type='url'
							placeholder='Link (https://example.com)'
							className='flex-1 input border border-gray-700 rounded p-2 input-md'
							value={formData.link}
							name='link'
							onChange={handleInputChange}
						/>
						<div className='flex gap-2 justify-end'>
							<button 
								type='button'
								className='btn btn-ghost rounded-full btn-sm'
								onClick={() => {
									const modal = document.getElementById("edit_profile_modal") as HTMLDialogElement;
									modal?.close();
								}}
							>
								Cancel
							</button>
							<button 
								type='submit'
								className='btn btn-primary rounded-full btn-sm text-white'
								disabled={isUpdatingProfile}
							>
								{isUpdatingProfile ? "Updating..." : "Update"}
							</button>
						</div>
					</form>
				</div>
				<form method='dialog' className='modal-backdrop'>
					<button className='outline-none'>close</button>
				</form>
			</dialog>
		</>
	);
};

export default EditProfileModal;