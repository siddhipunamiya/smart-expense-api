import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import fs from "fs";
import jsonwebtoken, { JwtPayload } from "jsonwebtoken";

import prisma from "../prisma";
import { ValidationError, TokenPayload } from "../types/common";
import { deleteFile } from "../utils/deleteFile";

export const signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            if (req.file) {
                await deleteFile(req.file.path);
            }
            const error: ValidationError = new Error("Validation failed");
            error.statusCode = 422;
            error.data = errors.array();
            throw error;
        }
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;
        const hashedPassword = await bcrypt.hash(password, 12);
        const profilePhoto = req.file ? req.file.path : null;
        const userResult = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                profilePhoto
            }
        });
        res.status(200).json({
            message: "User created!",
            userId: userResult.id
        });
    } catch (error) {
        try {
            if (req.file) {
                await deleteFile(req.file.path);
            }
        } catch (deleteFileError) {
            return next(deleteFileError);
        }
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: ValidationError = new Error("Validation failed");
            error.statusCode = 422;
            error.data = errors.array();
            throw error;
        }
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            const error: ValidationError = new Error("User with this email does not exist");
            error.statusCode = 401;
            throw error;
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            const error: ValidationError = new Error("Password invalid");
            error.statusCode = 401;
            throw error;
        }
        const accessToken = jsonwebtoken.sign({ userId: user.id }, process.env.JWT_ACCESS_SECRET!, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY as any });
        const refreshToken = jsonwebtoken.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET!, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY as any });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.status(200).json({
            accessToken,
            refreshToken
        });
    } catch (error) {
        next(error);
    }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.refreshToken || req.body.refreshToken;
        if (!token) {
            const error: ValidationError = new Error("No refresh token provided");
            error.statusCode = 401;
            throw error;
        }
        let decoded: TokenPayload;
        try {
            decoded = jsonwebtoken.verify(token, process.env.JWT_REFRESH_SECRET!) as TokenPayload;
        } catch {
            const error: ValidationError = new Error("Invalid or expired refresh token");
            error.statusCode = 401;
            throw error;
        }

        const accessToken = jsonwebtoken.sign({ userId: decoded.userId }, process.env.JWT_ACCESS_SECRET!, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY as any });
        res.status(200).json({ accessToken: accessToken });
    } catch (error) {
        next(error);
    }
};

