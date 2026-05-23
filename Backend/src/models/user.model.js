import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long'],
        maxlength: [30, 'Username cannot exceed 30 characters']
    },
    email: {
        type: String,
        required: [true, 'User email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'Invalid email address entered!'],
        minlength: [5, 'Email must be at least 5 characters long'],
        maxlength: [255, 'Email cannot exceed 255 characters']
    },
    password: {
        type: String,
        required: [true, 'User password is required'],
        select: false,
        minlength: [8, 'Password must be at least 8 characters long']
    }
}, {
    timestamps: true
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(this.password, salt);
        this.password = hashedPassword;
        next();
    }
    catch (error) {
        next(error);
    }
});

userSchema.methods.comparePassword = async function(password) {
    const passwordMatch = await bcrypt.compare(password, this.password);
    return passwordMatch;
}

const userModel = mongoose.model('User', userSchema);

export default userModel;