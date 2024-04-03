import express from "express";
import { pool } from "../connection.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

router.get("/details", authenticate, async (req, res, next) => {
    try {
        const queryCategory = "select count(id) as category_count from category";
        const queryProduct = "select count(id) as product_count from product";
        const queryBill = "select count(id) as bill_count from bill";

        const [categoryResult, productResult, billResult] = await Promise.all([
            pool.raw(queryCategory),
            pool.raw(queryProduct),
            pool.raw(queryBill)
        ]);


        const categoryCount = categoryResult.rows[0].category_count;
        const productCount = productResult.rows[0].product_count;
        const billCount = billResult.rows[0].bill_count;


        const data = {
            category: categoryCount,
            product: productCount,
            bill: billCount
        };

        return res.status(200).json({ data });
    } catch (err) {
        console.log('err', err)
        return res.status(500).json({ err });
    }
});

export default router;