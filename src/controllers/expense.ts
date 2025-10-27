import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

import { ValidationError } from "../types/common";
import prisma from "../prisma";
import { json } from "body-parser";

export const createExpense = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: ValidationError = new Error("Validation failed");
            error.statusCode = 422;
            error.data = errors.array();
            throw error;
        }
        const { title, amount, category, date, notes } = req.body;
        const userId = req.userId;
        const expense = await prisma.expense.create({
            data: {
                title,
                amount: parseFloat(amount),
                category,
                date: new Date(date),
                notes,
                userId: Number(userId)!
            }
        });
        res.status(200).json({
            message: "Expense created successfully",
            expense
        });
    } catch (err) {
        next(err);
    }
};

export const updateExpense = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: ValidationError = new Error("Validation failed");
            error.statusCode = 422;
            error.data = errors.array();
            throw error;
        }
        const { id } = req.params;
        const { title, amount, category, date, notes } = req.body;
        const userId = req.userId;
        const existingExpense = await prisma.expense.findUnique({
            where: { id: Number(id) }
        });
        if (!existingExpense) {
            const error: ValidationError = new Error("Expense not found");
            error.statusCode = 404;
            throw error;
        }
        if (existingExpense?.userId !== userId) {
            const error: ValidationError = new Error("You are not authorized to update this expense");
            error.statusCode = 403;
            throw error;
        }
        const updateExpense = await prisma.expense.update({
            where: { id: Number(id) },
            data: {
                title,
                amount: parseFloat(amount),
                category,
                date: new Date(date),
                notes
            }
        });
        res.status(200).json({
            message: "Expense updated successfully",
            expense: updateExpense
        });
    } catch (err) {
        next(err);
    }
};

export const deleteExpense = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const existingExpense = await prisma.expense.findUnique({
            where: { id: Number(id) }
        });
        if (!existingExpense) {
            const error: ValidationError = new Error("Expense not found");
            error.statusCode = 404;
            throw error;
        }
        if (existingExpense?.userId !== userId) {
            const error: ValidationError = new Error("You are not authorized to update this expense");
            error.statusCode = 403;
            throw error;
        }
        await prisma.expense.delete({
            where: { id: Number(id) }
        });
        res.status(200).json({ message: "Expense deleted successfully" });
    } catch (err) {
        next(err);
    }
};

export const fetchExpense = async (req: Request, res: Response, next: NextFunction) => {
    // Filters : category, date, from to to, search, sortBy -> amount or Date, order -> asc or desc
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error: ValidationError = new Error("Validation failed");
            error.statusCode = 422;
            error.data = errors.array();
            throw error;
        }
        const { date, from, to, category, search, sortBy = 'date', order = 'desc', page = 1, limit = 10 } = req.query;
        const userId = req.userId;
        const filters: any = {
            userId,
            // date,
            // from,
            // to,
            // category,
            // OR: [

            // ]
        };
        if (date) {
            filters.date = new Date(date as string);
        } else if (from && to) {
            filters.date = {
                gte: new Date(from as string),
                lte: new Date(to as string)
            }
        }
        if (category) {
            filters.category = category as string;
        }
        if (search) {
            filters.OR = [
                {
                    title: {
                        contains: search as string,
                        mode: "insensitive"
                    }
                },
                {
                    notes: {
                        contains: search as string,
                        mode: "insensitive"
                    }
                }
            ];
        }

        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);
        const sortField = sortBy === "amount" ? "amount" : "date";
        const sortOrder = order === "asc" ? "asc" : "desc";
        console.log(filters, "filters");
        const [expenses, totalCount] = await Promise.all([
            prisma.expense.findMany({
                where: filters,
                orderBy: { [sortField]: sortOrder },
                skip,
                take
            }),
            prisma.expense.count({ where: filters })
        ]);
        res.status(200).json({
            data: expenses,
            total: totalCount
        });
    } catch (err) {
        next(err);
    }
};