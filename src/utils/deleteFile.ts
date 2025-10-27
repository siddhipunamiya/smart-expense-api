import fs from "fs/promises";
import path from "path";

export const deleteFile = async (filePath: string) => {
    if (!filePath) return;
    try {
        await fs.unlink(filePath + 'some');
    } catch (error) {
        throw new Error("Error deleting file");
    }
};