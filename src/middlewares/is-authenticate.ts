import { Request, Response, NextFunction } from "express";
import jsonwebtoken from "jsonwebtoken";

import { ValidationError, TokenPayload } from "../types/common";

const isAuthenticate = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token: string | undefined = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : undefined;
    if (!token) {
        const error: ValidationError = new Error("No access token provided");
    }
    let decoded: TokenPayload;
    try {
        decoded = jsonwebtoken.verify(token!, process.env.JWT_ACCESS_SECRET!) as TokenPayload;
    } catch {
        const error: ValidationError = new Error("Invalid or expired access token");
        error.statusCode = 401;
        throw error;
    }
    req.userId = Number(decoded.userId);
    next();
};

export default isAuthenticate;