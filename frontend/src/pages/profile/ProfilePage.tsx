import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Link, useParams } from "react-router-dom";

import Posts from "../../components/common/Posts";
import ProfileHeaderSkeleton from "../../components/skeletons/ProfileHeaderSkeleton.tsx";
import EditProfileModal from "./EditProfileModal.tsx";

import { POSTS } from "../../utils/db/dummy";

import { FaArrowLeft } from "react-icons/fa6";
import { IoCalendarOutline } from "react-icons/io5";
import { FaLink } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatMemberSinceDate } from "../../utils/date/index.ts";
import useFollow from "../../hooks/useFollow.tsx";
import toast from "react-hot-toast";

interface User {
	_id: string;
	fullName: string;
	username: string;
	profileImg: string;
	coverImg: string;
	bio: string;
	link: string;
	following: string[];
	followers: string[];
	createdAt: string;
  	updatedAt: string;
}

interface UpdateProfileData {
	coverImg?: string | null;
	profileImg?: string | null;
}

const ProfilePage = () => {
	const [coverImg, setCoverImg] = useState<string | null>(null);
	const [profileImg, setProfileImg] = useState<string | null>(null);
	const [feedType, setFeedType] = useState<"posts" | "likes">("posts");

	const coverImgRef = useRef<HTMLInputElement | null>(null);
	const profileImgRef = useRef<HTMLInputElement | null>(null);

	const {username} = useParams<{username:string}>();

	const queryClient = useQueryClient();

	const {follow, isPending} = useFollow();

	const {data: authUser} = useQuery({
		queryKey: ["authUser"],
	});

	const {data: user, isLoading, refetch, isRefetching } = useQuery<User>({
		queryKey: ["userProfile", username],
		queryFn: async () => {
			if (!username) {
				throw new Error("Username is required");
			}
			
			try {
				const res = await fetch(`/api/users/profile/${username}`);
				const data = await res.json();
				
				console.log(data);
				
				if (!res.ok) {
					throw new Error(data.message || "Failed to fetch user profile");
				}
				return data.data;
			} catch (error) {
				throw new Error((error as Error).message || "An error occurred while fetching user profile");
			}
		},
		enabled: !!username // Only run query if username exists
	});

	const {mutate: updateProfile, isPending: isUpdatingProfile} = useMutation({
		mutationFn: async (): Promise<any> => {
			try {
				const res = await fetch('/api/users/update', {
					method: "POST",
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						coverImg,
						profileImg
					}),
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
			// Clear the local state after successful update
			setCoverImg(null);
			setProfileImg(null);
			// Invalidate queries to refetch updated data
			Promise.all([
				queryClient.invalidateQueries({queryKey: ["authUser"]}),
				queryClient.invalidateQueries({queryKey: ["userProfile", username]}),
			]);
		},
		onError: (error: Error) => {
			toast.error(error.message);
		}
	});

	const isMyProfile = authUser?._id === user?._id;
	const memberSinceDate = user ? formatMemberSinceDate(user.createdAt) : "";
	const amIFollowing = authUser?.following?.includes(user?._id);

	const handleImgChange = (e: ChangeEvent<HTMLInputElement>, state: "coverImg" | "profileImg") => {
		const file = e.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = () => {
				if (typeof reader.result === "string") {
					state === "coverImg" && setCoverImg(reader.result);
					state === "profileImg" && setProfileImg(reader.result);
				}
			};
			reader.readAsDataURL(file);
		}
	};

	const handleFollow = () => {
		if (user?._id) {
			follow(user._id);
		}
	};

	const handleUpdateProfile = () => {
		if (coverImg || profileImg) {
			updateProfile();
		}
	};

	useEffect(() => {
		refetch();
	}, [username, refetch]);

	return (
		<>
			<div className='flex-[4_4_0] border-r border-gray-700 min-h-screen'>
				{(isLoading || isRefetching) && <ProfileHeaderSkeleton />}
				{!isLoading && !isRefetching && !user && <p className='text-center text-lg mt-4'>User not found</p>}
				<div className='flex flex-col'>
					{!isLoading && !isRefetching && user && (
						<>
							<div className='flex gap-10 px-4 py-2 items-center'>
								<Link to='/'>
									<FaArrowLeft className='w-4 h-4' />
								</Link>
								<div className='flex flex-col'>
									<p className='font-bold text-lg'>{user.fullName}</p>
									<span className='text-sm text-slate-500'>{POSTS?.length || 0} posts</span>
								</div>
							</div>

							{/* COVER IMAGE */}
							<div className='relative group/cover'>
								<img
									src={coverImg || user.coverImg || "/cover.png"}
									className='h-52 w-full object-cover'
									alt='cover image'
								/>
								{isMyProfile && (
									<div
										className='absolute top-2 right-2 rounded-full p-2 bg-gray-800 bg-opacity-75 cursor-pointer opacity-0 group-hover/cover:opacity-100 transition duration-200'
										onClick={() => coverImgRef.current?.click()}
									>
										<MdEdit className='w-5 h-5 text-white' />
									</div>
								)}

								<input
									type='file'
									hidden
                                    accept="image/*"
									ref={coverImgRef}
									onChange={(e) => handleImgChange(e, "coverImg")}
								/>
								<input
									type='file'
									hidden
                                    accept="image/*"
									ref={profileImgRef}
									onChange={(e) => handleImgChange(e, "profileImg")}
								/>

								{/* USER AVATAR */}
								<div className='avatar absolute -bottom-16 left-4'>
									<div className='w-32 rounded-full relative group/avatar'>
										<img src={profileImg || user.profileImg || "/avatar-placeholder.png"} alt="Profile" />
										<div className='absolute top-5 right-3 p-1 bg-primary rounded-full group-hover/avatar:opacity-100 opacity-0 cursor-pointer'>
											{isMyProfile && (
												<MdEdit
													className='w-4 h-4 text-white'
													onClick={() => profileImgRef.current?.click()}
												/>
											)}
										</div>
									</div>
								</div>
							</div>

							<div className='flex justify-end px-4 mt-5'>
								{isMyProfile && <EditProfileModal authUser={authUser}/>}
								{!isMyProfile && (
									<button
										className='btn btn-outline rounded-full btn-sm'
										onClick={handleFollow}
										disabled={isPending || !user?._id}
									>
										{isPending && "Loading..."}
										{!isPending && amIFollowing && "Unfollow"}
										{!isPending && !amIFollowing && "Follow"}
									</button>
								)}
								{(coverImg || profileImg) && (
									<button
										className='btn btn-primary rounded-full btn-sm text-white px-4 ml-2'
										onClick={handleUpdateProfile}
										disabled={isUpdatingProfile}
									>
										{isUpdatingProfile ? "Updating..." : "Update"}
									</button>
								)}
							</div>

							<div className='flex flex-col gap-4 mt-14 px-4'>
								<div className='flex flex-col'>
									<span className='font-bold text-lg'>{user.fullName}</span>
									<span className='text-sm text-slate-500'>@{user.username}</span>
									<span className='text-sm my-1'>{user.bio}</span>
								</div>

								<div className='flex gap-2 flex-wrap'>
									{user.link && (
										<div className='flex gap-1 items-center'>
											<FaLink className='w-3 h-3 text-slate-500' />
											<a
												href={user.link}
												target='_blank'
												rel='noreferrer'
												className='text-sm text-blue-500 hover:underline'
											>
												{user.link.replace("https://", "")}
											</a>
										</div>
									)}
									<div className='flex gap-2 items-center'>
										<IoCalendarOutline className='w-4 h-4 text-slate-500' />
										<span className='text-sm text-slate-500'>{memberSinceDate}</span>
									</div>
								</div>

								<div className='flex gap-2'>
									<div className='flex gap-1 items-center'>
										<span className='font-bold text-xs'>{user.following?.length ?? 0}</span>
										<span className='text-slate-500 text-xs'>Following</span>
									</div>
									<div className='flex gap-1 items-center'>
										<span className='font-bold text-xs'>{user.followers?.length ?? 0}</span>
										<span className='text-slate-500 text-xs'>Followers</span>
									</div>
								</div>
							</div>

							<div className='flex w-full border-b border-gray-700 mt-4'>
								<div
									className='flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 relative cursor-pointer'
									onClick={() => setFeedType("posts")}
								>
									Posts
									{feedType === "posts" && (
										<div className='absolute bottom-0 w-10 h-1 rounded-full bg-primary' />
									)}
								</div>
								<div
									className='flex justify-center flex-1 p-3 text-slate-500 hover:bg-secondary transition duration-300 relative cursor-pointer'
									onClick={() => setFeedType("likes")}
								>
									Likes
									{feedType === "likes" && (
										<div className='absolute bottom-0 w-10  h-1 rounded-full bg-primary' />
									)}
								</div>
							</div>
						</>
					)}

					<Posts username={username} userId={user?._id} feedType={feedType} />
				</div>
			</div>
		</>
	);
};

export default ProfilePage;