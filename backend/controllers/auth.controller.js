import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { generateTokenAndGetCookie } from '../lib/utils/generateToken.js';

export const signup=async (req,res)=>{
    try {
        const {username,fullName,email,password}=req.body;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            return res.status(400).json({msg:'Invalid email address'});
        }
        if(password.length < 6){
            return res.status(400).json({msg:'Password must be at least 6 characters long'});
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ msg: 'Username already exists' });
        }
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ msg: 'Email already taken' });
        }

        const salt= await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            username,
            email,
            password: hashedPassword
        });

        if(newUser){
            generateTokenAndGetCookie(newUser._id,res);
            await newUser.save();

            res.status(201).json({
                data: {
                    _id: newUser._id,
                    fullName: newUser.fullName,
                    username: newUser.username,
                    email: newUser.email,
                    profileImg: newUser.profileImg,
                    coverImg: newUser.coverImg,
                    bio: newUser.bio,
                    link: newUser.link
                },
                msg: 'Signup successful'
            });
        }else{
            res.status(400).json({msg:'Something went wrong'});
        }
    } catch (error) {
        res.status(500).json({msg:'Internal server error', error: error.message});
    }
}

export const login=async (req,res)=>{
   try {
    const {username, password} = req.body;
    const user = await User.findOne({ username });
    const isPasswordValid = user && await bcrypt.compare(password, user?.password || '');
    if (!user || !isPasswordValid) {
        return res.status(400).json({ msg: 'Invalid credentials' });
    }
    generateTokenAndGetCookie(user._id, res);

    res.status(200).json({
        data: {
            _id: user._id,
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            profileImg: user.profileImg,
            coverImg: user.coverImg,
            bio: user.bio,
            link: user.link
        },
        msg: 'Login successful'
    });
   } catch (error) {
       res.status(500).json({msg:'Internal server error', error: error.message});
   }
}

export const logout=async (req,res)=>{
    try {
        res.cookie("jwt","",{maxAge: 0});
        res.status(200).json({msg:'Logged out successfully'});
    } catch (error) {
        console.log("Error in logout:", error);
        res.status(500).json({msg:'Internal server error', error: error.message});
    }
}

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.status(200).json(user);
    } catch (error) {
        console.log('Error in getMe:', error);
        res.status(500).json({ msg: 'Internal server error', error: error.message });
    }
}