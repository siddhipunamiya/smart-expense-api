import multer from "multer";
import path from "path";
import { ValidationError } from "../types/common";

const profilePhotoStorage = multer.diskStorage({
    destination: "uploads/profilePhotos",
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "-" + file.originalname;
        cb(null, uniqueName);
    }
});

const profilePhotoFileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowed = /jpeg|jpg|png/;
    const extname = allowed.test(path.extname(file.originalname).toLocaleLowerCase());
    if (extname && (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg'))
        cb(null, true);
    else {
        const error: ValidationError = new Error("Only image files are allowed!");
        error.statusCode = 415;
        cb(error);
    }
}

export const profilePhotoUpload = multer({ storage: profilePhotoStorage, fileFilter: profilePhotoFileFilter });