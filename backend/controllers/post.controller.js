import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Notification from "../models/notification.model.js";
import { v2 as cloudinary } from 'cloudinary';


export const createPost = async (req, res) => {
    let { text, img } = req.body;
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        if(!text && !img) {
            return res.status(400).json({ msg: 'Post must have either text or an image' });
        }
        if(img){
            const uploadedResponse=cloudinary.uploader.upload(img);
            img = (await uploadedResponse).secure_url; // Assuming img is a URL or base64 string
        }
        const newPost = new Post({
            user: userId,
            text: text || '',
            img: img || ''
        });
        await newPost.save();
        res.status(201).json({
            msg: 'Post created successfully',
            data: newPost
        });
    } catch (error) {
        console.log('Error in createPost controller:', error);
        res.status(500).json({ msg: 'Internal server error', error: error.message });
    }
}

export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        if( post.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ msg: 'You are not authorized to delete this post' });
        }

        if(post.img) {
            // Delete image from cloudinary
            await cloudinary.uploader.destroy(post.img.split('/').pop().split('.')[0]);
        }

        await Post.findByIdAndDelete(req.params.id);
        res.status(200).json({ msg: 'Post deleted successfully' });
    } catch (error) {
        console.log('Error in deletePost controller:', error);
        res.status(500).json({ msg: 'Internal server error', error: error.message });
    }
}

export const likeUnlikePost = async (req, res) => {
	try {
		const userId = req.user._id;
		const { id: postId } = req.params;

		const post = await Post.findById(postId);

		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		const userLikedPost = post.likes.includes(userId);

		if (userLikedPost) {
			// Unlike post
			await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
			await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

			const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString());
			res.status(200).json(updatedLikes);
		} else {
			// Like post
			post.likes.push(userId);
			await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
			await post.save();

			const notification = new Notification({
				from: userId,
				to: post.user,
				type: "like",
			});
			await notification.save();

			const updatedLikes = post.likes;
			res.status(200).json(updatedLikes);
		}
	} catch (error) {
		console.log("Error in likeUnlikePost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const commentPost = async (req, res) => {
    try {
        const {text} = req.body;
        const postId = req.params.id;
        const userId = req.user._id;

        if(!text){
            return res.status(400).json({ msg: 'Comment text is required' });
        }
        const post = await Post.findById(postId);
        if(!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        const comment = {
            text,
            user: userId
        };
        post.comments.push(comment);
        await post.save();

        res.status(201).json({
            msg: 'Comment added successfully',
            data: comment
        });
    } catch (error) {
        console.log('Error in commentPost controller:', error);
        res.status(500).json({ msg: 'Internal server error', error: error.message });
    }
}

export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }).populate({
            path: 'user',
            select:"-password"
        }).populate({
            path: 'comments.user',
            select: "-password"
        });

        if(!posts){
            return res.status(200).json([]);
        }

        res.status(200).json({
            msg: 'Posts fetched successfully',
            data: posts
        });
    } catch (error) {
        console.log('Error in getAllPosts controller:', error);
        res.status(500).json({ msg: 'Internal server error', error: error.message });        
    }
}

export const getLikedPosts = async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({ msg: 'User not found' });
        }

        const likedPosts = await Post.find({ _id: { $in: user.likedPosts } }).populate({
            path: 'user',
            select: "-password"
        }).populate({
            path: 'comments.user',
            select: "-password"
        });

        res.status(200).json({
            msg: 'Liked posts fetched successfully',
            data: likedPosts
        });
    } catch (error) {
        console.log('Error in getLikedPosts controller:', error);
        res.status(500).json({ msg: 'Internal server error', error: error.message });        
    }
}

export const getFollowingPosts = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        const following = user.following;

        const feedPosts = await Post.find({ user: { $in: following } }).sort({ createdAt: -1 }).populate({
            path: 'user',
            select: "-password"
        }).populate({
            path: 'comments.user',
            select: "-password"
        });

        res.status(200).json({
            msg: 'Following posts fetched successfully',
            data: feedPosts
        });

    } catch (error) {
        console.log('Error in getFollowingPosts controller:', error);
        res.status(500).json({ msg: 'Internal server error', error: error.message });        
    }
}

export const getUserPosts = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({username});
        if(!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        const posts = await Post.find({ user: user._id }).sort({ createdAt: -1 }).populate({
            path: 'user',
            select: "-password"
        }).populate({
            path: 'comments.user',
            select: "-password"
        });

        res.status(200).json({
            msg: 'User posts fetched successfully',
            data: posts
        });

    } catch (error) {
        console.log('Error in getUserPosts controller:', error);
        res.status(500).json({ msg: 'Internal server error', error: error.message });        
    }
}