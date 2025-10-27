import express from "express";
import { body, query } from "express-validator"

import { createExpense, updateExpense, deleteExpense, fetchExpense } from "../controllers/expense";

const router = express.Router();

router.post("/create", [
    body("title").trim().notEmpty().withMessage("Title is required").isLength({ min: 2 }).withMessage("Title must be atleast 2 characters"),
    body("amount").notEmpty().withMessage("Amount is required").isFloat().withMessage("Invalid amount"),
    body("category").notEmpty().withMessage("Category is required"),
    body("date").notEmpty().withMessage("Date is required").isDate().withMessage("Invalid date")], createExpense);


router.put("/update/:id", [
    body("title").trim().notEmpty().withMessage("Title is required").isLength({ min: 2 }).withMessage("Title must be atleast 2 characters"),
    body("amount").notEmpty().withMessage("Amount is required").isFloat().withMessage("Invalid amount"),
    body("category").notEmpty().withMessage("Category is required"),
    body("date").notEmpty().withMessage("Date is required").isDate().withMessage("Invalid date")], updateExpense);

router.delete("/delete/:id", deleteExpense);

router.get("/list", [
    query("date").optional().isDate().withMessage("Invalid date"),
    query("from").optional().isDate().withMessage("Invalid from"),
    query("to").optional().isDate().withMessage("Invalid to"),
    query("category").optional().trim().isString().withMessage("Category must be a string"),
    query("search").optional().trim().isString().withMessage("Invalid search"),
    query("sortBy").optional().isIn(["date", "amount"]).withMessage("Invalid sortBy value"),
    query("order").optional().isIn(["asc", "desc"]).withMessage("Invalid order value"),
    query("page").optional().toInt().isInt({ min: 1 }).withMessage("Page must be >= 1"),
    query("limit").optional().toInt().isInt({ min: 1, max: 100 }).withMessage("Limit must be 1-100"),
    query("to").custom((value, { req }) => {
        const from = req.query?.from || null;
        if (from && !value) {
            throw new Error("'to' date is required when 'from' is provided");
        }
        if (from && value && new Date(value) < new Date(from)) {
            throw new Error("`to` date must be greater than or equal to `from` date");
        }
        return true;
    })
], fetchExpense);

export default router;