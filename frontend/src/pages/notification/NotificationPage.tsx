import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { IoSettingsOutline } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";

// Type definitions
interface NotificationFrom {
	_id: string;
	username: string;
	profileImg?: string;
}

interface Notification {
	_id: string;
	type: "follow" | "like";
	from: NotificationFrom;
	createdAt?: string;
}

interface ApiError {
	error?: string;
	message?: string;
}

const NotificationPage: React.FC = () => {
	const queryClient = useQueryClient();
	
	const { data: notifications, isLoading } = useQuery<Notification[]>({
		queryKey: ["notifications"],
		queryFn: async (): Promise<Notification[]> => {
			try {
				const res = await fetch("/api/notifications");
				const data = await res.json();
				if (!res.ok) {
					const errorData = data as ApiError;
					throw new Error(errorData.error || "Something went wrong");
				}
				return data;
			} catch (error) {
				throw new Error(error instanceof Error ? error.message : String(error));
			}
		},
	});

	const { mutate: deleteNotifications } = useMutation<void, Error, void>({
		mutationFn: async (): Promise<void> => {
			try {
				const res = await fetch("/api/notifications", {
					method: "DELETE",
				});
				const data = await res.json();
				if (!res.ok) {
					const errorData = data as ApiError;
					throw new Error(errorData.error || "Something went wrong");
				}
				return data;
			} catch (error) {
				throw new Error(error instanceof Error ? error.message : String(error));
			}
		},
		onSuccess: () => {
			toast.success("Notifications deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});

	const handleDeleteNotifications = (): void => {
		deleteNotifications();
	};

	const getNotificationIcon = (type: Notification["type"]): JSX.Element => {
		switch (type) {
			case "follow":
				return <FaUser className='w-7 h-7 text-primary' />;
			case "like":
				return <FaHeart className='w-7 h-7 text-red-500' />;
			default:
				return <FaUser className='w-7 h-7 text-primary' />;
		}
	};

	const getNotificationText = (type: Notification["type"]): string => {
		switch (type) {
			case "follow":
				return "followed you";
			case "like":
				return "liked your post";
			default:
				return "interacted with you";
		}
	};

	return (
		<>
			<div className='flex-[4_4_0] border-l border-r border-gray-700 min-h-screen'>
				<div className='flex justify-between items-center p-4 border-b border-gray-700'>
					<p className='font-bold'>Notifications</p>
					<div className='dropdown '>
						<div tabIndex={0} role='button' className='m-1'>
							<IoSettingsOutline className='w-4' />
						</div>
						<ul
							tabIndex={0}
							className='dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52'
						>
							<li>
								<a onClick={handleDeleteNotifications}>Delete all notifications</a>
							</li>
						</ul>
					</div>
				</div>
				{isLoading && (
					<div className='flex justify-center h-full items-center'>
						<LoadingSpinner size='lg' />
					</div>
				)}
				{notifications?.length === 0 && (
					<div className='text-center p-4 font-bold'>No notifications 🤔</div>
				)}
				{notifications?.map((notification: Notification) => (
					<div className='border-b border-gray-700' key={notification._id}>
						<div className='flex gap-2 p-4'>
							{getNotificationIcon(notification.type)}
							<Link to={`/profile/${notification.from.username}`}>
								<div className='avatar'>
									<div className='w-8 rounded-full'>
										<img 
											src={notification.from.profileImg || "/avatar-placeholder.png"} 
											alt={`${notification.from.username} profile`}
										/>
									</div>
								</div>
								<div className='flex gap-1'>
									<span className='font-bold'>@{notification.from.username}</span>{" "}
									{getNotificationText(notification.type)}
								</div>
							</Link>
						</div>
					</div>
				))}
			</div>
		</>
	);
};

export default NotificationPage;