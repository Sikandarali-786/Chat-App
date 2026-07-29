export const generateUsername = (fullName: string) => {
    return fullName
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_");
};