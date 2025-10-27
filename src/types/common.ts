import { JwtPayload } from "jsonwebtoken";

export interface ValidationError extends Error {
    statusCode?: number,
    data?: any;
};

export interface TokenPayload extends JwtPayload {
    userId: number
}
