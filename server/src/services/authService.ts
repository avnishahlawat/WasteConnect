import { User, type IUser } from '../models/User';
import { CitizenProfile } from '../models/CitizenProfile';
import { CollectorProfile } from '../models/CollectorProfile';
import { AuthorityProfile } from '../models/AuthorityProfile';
import { AuditLog } from '../models/AuditLog';
import { signToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';
import { UserRole } from '../types/enums';
import mongoose from 'mongoose';

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

const createRoleProfile = async (
  userId: mongoose.Types.ObjectId,
  role: UserRole
): Promise<void> => {
  switch (role) {
    case UserRole.CITIZEN:
      await CitizenProfile.create({ user: userId });
      break;
    case UserRole.COLLECTOR:
      await CollectorProfile.create({ user: userId });
      break;
    case UserRole.AUTHORITY:
      await AuthorityProfile.create({
        user: userId,
        designation: 'Municipal Officer',
        department: 'Sanitation Department',
      });
      break;
    case UserRole.ADMIN:
      // Admins have no separate profile
      break;
  }
};

export const authService = {
  async register(input: RegisterInput, ipAddress?: string): Promise<{ user: IUser; token: string }> {
    const existingUser = await User.findOne({ email: input.email.toLowerCase() });
    if (existingUser) {
      throw new AppError('An account with this email already exists', 409, 'EMAIL_IN_USE');
    }

    // Only CITIZEN and COLLECTOR can self-register
    if (!([UserRole.CITIZEN, UserRole.COLLECTOR] as UserRole[]).includes(input.role)) {
      throw new AppError('Invalid role for registration', 400, 'INVALID_ROLE');
    }

    const session = await mongoose.startSession();
    let user: IUser;

    try {
      session.startTransaction();
      user = await User.create([{ ...input, email: input.email.toLowerCase() }], { session }).then(
        (res) => res[0]
      );
      await createRoleProfile(user._id, input.role);

      await AuditLog.create({
        actor: user._id,
        actorRole: user.role,
        actorEmail: user.email,
        action: 'USER_REGISTERED',
        entityType: 'User',
        entityId: user._id,
        description: `New ${user.role} account registered`,
        ipAddress,
      });

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }

    const token = signToken({ userId: user._id.toString(), role: user.role, email: user.email });
    return { user, token };
  },

  async login(input: LoginInput, ipAddress?: string): Promise<{ user: IUser; token: string }> {
    const user = await User.findOne({ email: input.email.toLowerCase() }).select('+password');
    if (!user) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated. Please contact support.', 403, 'ACCOUNT_DEACTIVATED');
    }

    const isPasswordValid = await user.comparePassword(input.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    await AuditLog.create({
      actor: user._id,
      actorRole: user.role,
      actorEmail: user.email,
      action: 'USER_LOGIN',
      entityType: 'User',
      entityId: user._id,
      description: `User logged in`,
      ipAddress,
    });

    const token = signToken({ userId: user._id.toString(), role: user.role, email: user.email });
    return { user, token };
  },

  async getProfile(userId: string) {
    const user = await User.findById(userId).populate('serviceArea');
    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');

    let profile = null;
    switch (user.role) {
      case UserRole.CITIZEN:
        profile = await CitizenProfile.findOne({ user: userId }).populate('preferredServiceArea');
        break;
      case UserRole.COLLECTOR:
        profile = await CollectorProfile.findOne({ user: userId }).populate('serviceAreas specializations');
        break;
      case UserRole.AUTHORITY:
        profile = await AuthorityProfile.findOne({ user: userId }).populate('serviceAreas');
        break;
    }

    return { user, profile };
  },

  async updateProfile(userId: string, updates: Partial<{ firstName: string; lastName: string; phone: string }>) {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    return user;
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await User.findById(userId).select('+password');
    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');

    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) throw new AppError('Current password is incorrect', 400, 'INVALID_PASSWORD');

    user.password = newPassword;
    await user.save();
  },
};
