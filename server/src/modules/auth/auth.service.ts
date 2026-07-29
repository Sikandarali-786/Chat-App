import bcrypt from "bcrypt";

import { AppError } from "../../shared/errors/AppError";
import { generateUsername } from "../../shared/utils/generateUsername";
import { MESSAGES } from "../../shared/constants";

import { userRepository } from "../users";
import { RegisterUserDTO } from "./auth.types";
import { hashPassword } from "../../shared/utils/password";

class AuthService {
  async register(data: RegisterUserDTO) {
    // 1. Check email already exists
    const existingUser = await userRepository.findByEmail(data.email);

    if (existingUser) {
      throw new AppError(
        MESSAGES.EMAIL_ALREADY_EXISTS,
        409
      );
    }

    // 2. Generate username
    const username = generateUsername(data.fullName);

    // 3. Check username already exists
    const existingUsername =
      await userRepository.findByUsername(username);

    if (existingUsername) {
      throw new AppError(
        MESSAGES.USERNAME_ALREADY_EXISTS,
        409
      );
    }

    // 4. Hash password
    const hashedPassword = await hashPassword(data.password)

    // 5. Save user in database
    const user = await userRepository.create({
      fullName: data.fullName,
      email: data.email,
      username,
      password: hashedPassword,
    });

    // 6. Remove sensitive fields
    const {
      password,
      refreshToken,
      ...safeUser
    } = user.toObject();

    // 7. Return user
    return safeUser;
  }
}

export const authService = new AuthService();