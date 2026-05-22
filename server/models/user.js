import mongoose from 'mongoose'


const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        required: true,
    },
    hobbies: {
        type: [String],
        default: [],
    },
    city: {
        type: String,
        enum: ["Mumbai", "Delhi", "Pune", "Bangalore", "Chennai", "Kolkata", "Ahmedabad", "Surat", "Jaipur"],
        required: true,
    },
    userProfileImage: {
        url: {
            type: String,
        },
        public_id: {
            type: String,
        }
    }
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);