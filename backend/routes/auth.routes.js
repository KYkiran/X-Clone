import express from "express";
import { login, logout, signup } from "../controllers/auth.controller.js";
import { protectRoute } from "../middlewares/protectRoute.js";
import { getMe } from "../controllers/auth.controller.js";

const router=express.Router();

router.get('/me',protectRoute,getMe);
router.post('/signup',signup);
router.post('/login',login);
router.post('/logout',logout);

export default router;