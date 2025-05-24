import jwt from 'jsonwebtoken';

export const generateTokenAndGetCookie = (userId, res) => {
    const token=jwt.sign({userId}, process.env.JWT_SECRET, {
        expiresIn: '30d' // Token will expire in 30 days
    });

    res.cookie("jwt", token, {
        maxAge: 30 * 24 * 60 * 60 * 1000, // Cookie will expire in 30 days
        httpOnly: true, // Cookie is not accessible via JavaScript
        sameSite: 'strict', // Cookie is sent only for same-site requests
        secure: process.env.NODE_ENV === 'production' // Cookie is sent only over HTTPS in production
    });
}