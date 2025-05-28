import Notification from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;

        const notifications = await Notification.find({ to: userId })
            .populate({
                path: "from",
                select: "username profileImg",
            })
            .sort({ createdAt: -1 });

        await Notification.updateMany({ to: userId }, { read: true });

        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Internal server error' });        
    }
}

export const deleteNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        await Notification.deleteMany({ to: userId });

        res.status(200).json({ message: 'Notifications deleted successfully' });
    } catch (error) {
        console.error('Error deleting notifications:', error);
        res.status(500).json({ message: 'Internal server error' });        
    }
}

export const deleteOneNotification = async (req, res) => {
    try {
        const userId = req.user._id;
        const notificationId = req.params.id;

        if(notification.to.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'You do not have permission to delete this notification' });
        }
        const notification = await Notification.findOneAndDelete({ _id: notificationId, to: userId });

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.status(200).json({ message: 'Notification deleted successfully' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ message: 'Internal server error' });        
    }
}