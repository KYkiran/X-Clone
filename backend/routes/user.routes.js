import express from 'express';
import { protectRoute } from '../middlewares/protectRoute.js';
import { getUserProfile,followUnFollowUser,getSuggestedUsers,updateUser } from '../controllers/user.controller.js';

const router = express.Router();

router.get("/profile/:username",protectRoute,getUserProfile);
router.get("/suggested",protectRoute,getSuggestedUsers);
router.post("/follow/:id",protectRoute,followUnFollowUser);
router.post("/update",protectRoute,updateUser);


export default router;
