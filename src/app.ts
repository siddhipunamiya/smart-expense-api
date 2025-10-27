import fs from "fs";
import path from "path";
import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import bodyParser from "body-parser";
import morgan from "morgan";
import multer from "multer";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth";
import expenseRoutes from "./routes/expense";
import isAuthenticate from "./middlewares/is-authenticate";
import { ValidationError } from "./types/common";

const app = express();

app.use(helmet());

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Method", "GET POST PUT PATCH DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});

const accessLogStream = fs.createWriteStream(path.join(__dirname, '..', 'logs', 'access.log'), { flags: 'a' });
app.use(morgan("combined", { stream: accessLogStream }));

// old way of parsing, now newwer express version can parse the same
// app.use(bodyParser.urlencoded({ extended: false }));

// app.use(bodyParser.json());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use("/auth", authRoutes);

app.use("/expense", isAuthenticate, expenseRoutes);

app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
    if (error instanceof Error) {
        const customError = error as ValidationError;
        const statusCode = customError.statusCode || 500;
        const data = customError.data || null;
        res.status(statusCode).json({
            message: customError.message,
            data
        });
    } else {
        res.status(500).json({ message: "Something went wrong" })
    }
});

export default app;