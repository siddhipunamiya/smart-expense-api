import fs from "fs";
import path from "path";
import express from "express";
import helmet from "helmet";
import bodyParser from "body-parser";
import morgan from "morgan";

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
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
export default app;