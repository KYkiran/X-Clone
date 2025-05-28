import { Link } from "react-router-dom";
import { type MouseEvent } from "react";
import RightPanelSkeleton from "../skeletons/RightPanelSkeleton.tsx";
import { USERS_FOR_RIGHT_PANEL } from "../../utils/db/dummy";

interface User {
	_id: string;
	username: string;
	fullName: string;
	profileImg?: string;
}

const RightPanel: React.FC = () => {
	const isLoading: boolean = false;

	const handleFollowClick = (e: MouseEvent<HTMLButtonElement>): void => {
		e.preventDefault();
		// Add follow logic here
	};

	return (
		<div className='hidden lg:block my-4 mx-2'>
			<div className='bg-[#16181C] p-4 rounded-md sticky top-2'>
				<p className='font-bold'>Who to follow</p>
				<div className='flex flex-col gap-4'>
					{/* item */}
					{isLoading && (
						<>
							<RightPanelSkeleton />
							<RightPanelSkeleton />
							<RightPanelSkeleton />
							<RightPanelSkeleton />
						</>
					)}
					{!isLoading &&
						USERS_FOR_RIGHT_PANEL?.map((user: User) => (
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
										onClick={handleFollowClick}
									>
										Follow
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