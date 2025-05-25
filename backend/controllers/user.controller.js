import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';
import bcrypt from 'bcryptjs';
import { v2 as cloudinary } from 'cloudinary';

export const getUserProfile = async (req, res) => {
    const { username } = req.params;
    try {
        const user = await User.findOne({ username }).select('-password');
        if(!user){
            return res.status(404).json({ msg: 'User not found' });
        }else{
            res.status(200).json({
                data: user,
                msg: 'User profile fetched successfully'
            });
        }
    } catch (error) {
        console.log('Error in getUserProfile controller:', error);        
        res.status(500).json({ msg: 'Internal server error', error: error.message });        
    }
}

export const followUnFollowUser = async (req, res) => {
    try {
        const { id } = req.params; // User ID to follow/unfollow
        const userToModify = await User.findById(id);
        const currentUser = await User.findById(req.user._id);
        if(id === req.user._id.toString()) {
            return res.status(400).json({ msg: 'You cannot follow/unfollow yourself' });
        }
        if(!userToModify || !currentUser){
            return res.status(404).json({ msg: 'User not found' });
        }

        const isFollowing = currentUser.following.includes(id);
        if(isFollowing) {
            // Unfollow user
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
            res.status(200).json({ msg: 'User unfollowed successfully' });
        }
        else{
            await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });

            const newNotification = new Notification({
                type: 'follow',
                from: req.user._id,
                to: userToModify._id,
            });

            await newNotification.save();

            // TODO: return the id of the user as a response
            res.status(200).json({ msg: 'User followed successfully' });
        }
    } catch (error) {
        console.log('Error in followUnFollowUser controller:', error);        
        res.status(500).json({ msg: 'Internal server error', error: error.message });
    }
}

export const getSuggestedUsers = async (req, res) => {
    try {
        const userId = req.user._id;
        const usersFollowedByMe = await User.findById(userId).select('following');
        const users = await User.aggregate([
            {
                $match: {
                    _id: { $ne: userId }, // Exclude current user
                }
            },
            {$sample: { size: 10 }}, // Randomly sample 10 users
        ]);
        const filteredUsers = users.filter(user => !usersFollowedByMe.following.includes(user._id.toString()));
        const suggestedUsers = filteredUsers.slice(0, 5);

        suggestedUsers.forEach(user => user.password = null);  // Remove password from response

        res.status(200).json({
            data: suggestedUsers,
            msg: 'Suggested users fetched successfully'
        });
    } catch (error) {
        console.log('Error in getSuggestedUsers controller:', error);        
        res.status(500).json({ msg: 'Internal server error', error: error.message });
        
    }
}

export const updateUser = async (req, res) => {
    let { fullName, email, username, currentPassword, newPassword,bio,link } = req.body;
    let { profileImg, coverImg } = req.body;

    const userId = req.user._id;
    try {
        let user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        if((currentPassword && !newPassword) || (!currentPassword && newPassword)) {
            return res.status(400).json({ msg: 'Both current and new passwords are required' });
        }
        if(currentPassword && newPassword){
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ msg: 'Current password is incorrect' });
            }
            if( newPassword.length < 6) {
                return res.status(400).json({ msg: 'New password must be at least 6 characters long' });
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }
        if (profileImg){
            if(user.profileImg){
                await cloudinary.uploader.destroy(user.profileImg.split('/').pop().split('.')[0]);
            }

            const uploadedResponse = await cloudinary.uploader.upload(profileImg);
            profileImg = uploadedResponse.secure_url;
        }
        if(coverImg){
            if(user.coverImg){
                await cloudinary.uploader.destroy(user.coverImg.split('/').pop().split('.')[0]);
            }
            const uploadedResponse = await cloudinary.uploader.upload(coverImg);
            coverImg = uploadedResponse.secure_url;
        }

        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        user.username = username || user.username;
        user.profileImg = profileImg || user.profileImg;
        user.coverImg = coverImg || user.coverImg;
        user.bio = bio || user.bio;
        user.link = link || user.link;

        user = await user.save();

        user.password = null; // Remove password from response

        return res.status(200).json({
            data: user,
            msg: 'User updated successfully'
        });

    } catch (error) {
        console.log('Error in updateUser controller:', error);        
        res.status(500).json({ msg: 'Internal server error', error: error.message });
    }
}