import nodemailer from "nodemailer";
import { env } from "../config/env";

const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
    },
});

interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
}

export const sendEmail = async (options: SendEmailOptions): Promise<void> => {
    await transporter.sendMail({
        from: `"Chat App" <${env.EMAIL_FROM}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
    });
};

export const sendVerificationEmail = async (
    to: string,
    token: string
): Promise<void> => {
    const verifyUrl = `${env.CLIENT_URL}/verify-email?token=${token}`;

    await sendEmail({
        to,
        subject: "Verify Your Email Address",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Verify Your Email</h2>
                <p>Click the button below to verify your email address. This link expires in 24 hours.</p>
                <a href="${verifyUrl}"
                   style="display: inline-block; padding: 12px 24px; background-color: #4F46E5;
                          color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
                    Verify Email
                </a>
                <p>Or copy this link: <a href="${verifyUrl}">${verifyUrl}</a></p>
                <p>If you did not create an account, ignore this email.</p>
            </div>
        `,
    });
};

export const sendPasswordResetEmail = async (
    to: string,
    token: string
): Promise<void> => {
    const resetUrl = `${env.CLIENT_URL}/reset-password?token=${token}`;

    await sendEmail({
        to,
        subject: "Reset Your Password",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Reset Your Password</h2>
                <p>Click the button below to reset your password. This link expires in 1 hour.</p>
                <a href="${resetUrl}"
                   style="display: inline-block; padding: 12px 24px; background-color: #4F46E5;
                          color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
                    Reset Password
                </a>
                <p>Or copy this link: <a href="${resetUrl}">${resetUrl}</a></p>
                <p>If you did not request a password reset, ignore this email.</p>
            </div>
        `,
    });
};
