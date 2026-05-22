import { User } from '../models/user.js';
import { uploadOnCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';
import fs from 'fs';

export const addUser = async (req, res) => {
    let cloudinaryResponse = null;
    try {
        const { firstName, lastName, age, hobbies, city } = req.body;
        
        // Handle hobbies if it comes as a string (e.g. from form-data)
        let hobbiesArray = hobbies;
        if (typeof hobbies === 'string') {
            try {
                hobbiesArray = JSON.parse(hobbies);
            } catch (e) {
                hobbiesArray = hobbies.split(',').map(h => h.trim());
            }
        }

        // Upload image if provided
        if (req.file) {
            cloudinaryResponse = await uploadOnCloudinary(req.file.path);
        }

        const newUser = await User.create({
            firstName,
            lastName,
            age,
            hobbies: hobbiesArray,
            city,
            userProfileImage: cloudinaryResponse ? {
                url: cloudinaryResponse.secure_url,
                public_id: cloudinaryResponse.public_id
            } : {}
        });

        return res.status(201).json({
            success: true,
            data: newUser,
            message: "User created successfully"
        });

    } catch (error) {
        // If DB operation fails and image was uploaded, delete it from cloudinary
        if (cloudinaryResponse && cloudinaryResponse.public_id) {
            await deleteFromCloudinary(cloudinaryResponse.public_id);
        }
        return res.status(500).json({
            success: false,
            data: null,
            message: error.message || "Failed to create user"
        });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        return res.status(200).json({
            success: true,
            data: users,
            message: "Users fetched successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            data: null,
            message: error.message || "Failed to fetch users"
        });
    }
};

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                data: null,
                message: "User not found"
            });
        }
        
        return res.status(200).json({
            success: true,
            data: user,
            message: "User fetched successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            data: null,
            message: error.message || "Failed to fetch user"
        });
    }
};

export const updateUser = async (req, res) => {
    let cloudinaryResponse = null;
    try {
        const { id } = req.params;
        const updateData = { ...req.body };
        
        if (updateData.hobbies && typeof updateData.hobbies === 'string') {
            try {
                updateData.hobbies = JSON.parse(updateData.hobbies);
            } catch (e) {
                updateData.hobbies = updateData.hobbies.split(',').map(h => h.trim());
            }
        }

        const user = await User.findById(id);
        if (!user) {
            // If user not found but uploaded a new file, we shouldn't save the new image
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(404).json({
                success: false,
                data: null,
                message: "User not found"
            });
        }

        if (req.file) {
            // Upload new image
            cloudinaryResponse = await uploadOnCloudinary(req.file.path);
            if (cloudinaryResponse) {
                updateData.userProfileImage = {
                    url: cloudinaryResponse.secure_url,
                    public_id: cloudinaryResponse.public_id
                };
                
                // Delete old image from cloudinary
                if (user.userProfileImage && user.userProfileImage.public_id) {
                    await deleteFromCloudinary(user.userProfileImage.public_id);
                }
            }
        }

        const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

        return res.status(200).json({
            success: true,
            data: updatedUser,
            message: "User updated successfully"
        });

    } catch (error) {
        // Revert new image upload if update fails
        if (cloudinaryResponse && cloudinaryResponse.public_id) {
            await deleteFromCloudinary(cloudinaryResponse.public_id);
        }
        return res.status(500).json({
            success: false,
            data: null,
            message: error.message || "Failed to update user"
        });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                data: null,
                message: "User not found"
            });
        }

        // Delete image from cloudinary
        if (user.userProfileImage && user.userProfileImage.public_id) {
            await deleteFromCloudinary(user.userProfileImage.public_id);
        }

        await User.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            data: null,
            message: "User deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            data: null,
            message: error.message || "Failed to delete user"
        });
    }
};