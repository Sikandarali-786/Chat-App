import { IUser } from "./user.types";
import { User } from "./user.model";

class UserRepository {
    async create(userData: Partial<IUser>) {
        return await User.create(userData);
    }

    async findById(id: string) {
        return await User.findById(id);
    }

    async findByEmail(email: string) {
        return await User.findOne({ email });
    }

    async findByUsername(username: string) {
        return await User.findOne({ username });
    }

    async updateRefreshToken(
        userId: string,
        refreshToken: string | null
    ) {
        return await User.findByIdAndUpdate(
            userId,
            { refreshToken },
            { new: true }
        );
    }

    async updateStatus(
        userId: string,
        status: "online" | "offline" | "away"
    ) {
        return await User.findByIdAndUpdate(
            userId,
            {
                status,
                lastSeen: new Date(),
            },
            { new: true }
        );
    }

    async updateProfile(
        userId: string,
        data: Partial<IUser>
    ) {
        return await User.findByIdAndUpdate(
            userId,
            data,
            { new: true }
        );
    }
}

export const userRepository = new UserRepository();