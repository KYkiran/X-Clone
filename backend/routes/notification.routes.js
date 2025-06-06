import express from 'express';
import { protectRoute } from '../middlewares/protectRoute.js';
import { getNotifications, deleteNotifications,deleteOneNotification } from '../controllers/notification.controller.js';

const router = express.Router();

router.get('/',protectRoute,getNotifications);
router.delete('/',protectRoute,deleteNotifications);
router.delete('/:id',protectRoute,deleteOneNotification);


export default router;