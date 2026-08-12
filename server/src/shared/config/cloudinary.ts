import { v2 as cloudinary } from "cloudinary";
import { env } from "./env";

cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

export const uploadToCloudinary = async (
    filePath: string,
    folder: string,
    resourceType: "image" | "video" | "raw" | "auto" = "auto"
): Promise<{ url: string; publicId: string; duration?: number }> => {
    const result = await cloudinary.uploader.upload(filePath, {
        folder,
        resource_type: resourceType,
    });

    return {
        url: result.secure_url,
        publicId: result.public_id,
        duration: result.duration, // For video/audio
    };
};

export const deleteFromCloudinary = async (
    publicId: string,
    resourceType: "image" | "video" | "raw" = "image"
): Promise<void> => {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};

export const extractPublicId = (url: string): string => {
    // Extract public_id from cloudinary URL
    // e.g. https://res.cloudinary.com/demo/image/upload/v1/folder/filename.jpg → folder/filename
    const parts = url.split("/");
    const uploadIndex = parts.indexOf("upload");
    const pathAfterUpload = parts.slice(uploadIndex + 2).join("/"); // skip version segment
    return pathAfterUpload.replace(/\.[^/.]+$/, ""); // remove extension
};

export const getResourceType = (
    mimeType: string
): "image" | "video" | "raw" => {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    return "raw"; // For audio, documents, etc.
};
