import express from 'express';
import { addUser, getAllUsers, getUserById, updateUser, deleteUser } from '../controllers/userController.js';
import { upload } from '../middlewares/multer.js';

const router = express.Router();

router.post("/users", upload.single('userProfileImage'), addUser);
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id", upload.single('userProfileImage'), updateUser);
router.delete("/users/:id", deleteUser);

export default router;
