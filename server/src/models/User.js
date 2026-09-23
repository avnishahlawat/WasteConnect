import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole } from '../types/enums.js';
const userSchema = new Schema({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false, minlength: 8 },
    role: { type: String, enum: Object.values(UserRole), required: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    avatar: { type: String },
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    serviceArea: { type: Schema.Types.ObjectId, ref: 'ServiceArea' },
    lastLogin: { type: Date },
}, { timestamps: true });
userSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});
userSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    if (this.password && (this.password.startsWith('$2a$') || this.password.startsWith('$2b$'))) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 12);
    next();
});
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};
userSchema.index({ role: 1 });
userSchema.index({ serviceArea: 1 });
export const User = mongoose.model('User', userSchema);
