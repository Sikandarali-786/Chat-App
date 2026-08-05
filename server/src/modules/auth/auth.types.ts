// DTOs (Data Transfer Objects)

export interface RegisterUserDTO {
    fullName: string;
    email: string;
    password: string;
}

export interface LoginUserDTO {
    email: string;
    password: string;
}

export interface ForgotPasswordDTO {
    email: string;
}

export interface ResetPasswordDTO {
    token: string;
    password: string;
}

export interface UpdateProfileDTO {
    fullName?: string;
    bio?: string;
}
