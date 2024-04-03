import express from "express";
import { pool } from "../connection.js";
import { authenticate } from "../middlewares/auth.js";
import { checkAdminRole } from "../middlewares/checkAdminRole.js";

const router = express.Router();

router.post("/add", authenticate, checkAdminRole, async (req, res, next) => {
  try {
    let category = req.body;
    await pool("category").insert({ name: category.name });
    return res.status(200).json({ message: "Category added successfully" });
  } catch (err) {
    return res.status(500).json({ err });
  }
});

router.get("/get", async (req, res, next) => {
  try {
    let results = await pool("category").select("*");
    return res.status(200).json({ data: results });
  } catch (err) {
    return res.status(500).json({ err });
  }
});

router.put("/update", authenticate, checkAdminRole, async (req, res, next) => {
  try {
    let product = req.body;
    let results = await pool("category")
      .where("id", product.id)
      .update({ name: product.name });
    if (results === 0) {
      return res.status(404).json({ message: "Category ID not found" });
    }
    return res.status(200).json({ message: "Category updated successfully" });
  } catch (err) {
    return res.status(500).json({ err });
  }
});

export default router;
