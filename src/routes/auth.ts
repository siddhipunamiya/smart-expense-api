import express from "express";
import { body } from "express-validator";

import { signup, login, refreshToken } from "../controllers/auth";
import { profilePhotoUpload } from "../middlewares/upload";

const router = express.Router();

router.post("/signup", profilePhotoUpload.single("profilePhoto"), [
    body("name").trim().notEmpty().withMessage("Name is required").isLength({ min: 2 }).withMessage("Name must be atleast 2 characters"),
    body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email address"),
    body("password").notEmpty().withMessage("Password is required").isLength({ min: 6 }).withMessage("Password must be at least 6 characters")], signup);

router.post("/login", [
    body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email address"),
    body("password").notEmpty().withMessage("Password is required").isLength({ min: 6 }).withMessage("Password must be at least 6 characters")], login);

router.post("/refresh-token", refreshToken);

export default router;