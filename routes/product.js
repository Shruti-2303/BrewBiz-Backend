import express from "express";
import { pool } from "../connection.js";
import { authenticate } from "../middlewares/auth.js";
import { checkAdminRole } from "../middlewares/checkAdminRole.js";

const router = express.Router();

router.post("/add", authenticate, checkAdminRole, async (req, res) => {
  try {
    let product = req.body;
    await pool("product").insert({
      name: product.name,
      categoryid: product.categoryid,
      description: product.description,
      price: product.price,
      status: true,
    });
    return res.status(200).json({ message: "Product added successfully" });
  } catch (err) {
    return res.status(500).json({ err });
  }
});

router.get("/get", authenticate, async (req, res, next) => {
  try {
    let results = await pool("product as p")
      .select(
        "p.id",
        "p.name",
        "p.description",
        "p.price",
        "p.status",
        "c.id as categoryid",
        "c.name as categoryName"
      )
      .innerJoin("category as c", "p.categoryid", "c.id");
    return res.status(200).json({ data: results });
  } catch (err) {
    return res.status(500).json({ err });
  }
});

router.get("/getByCategoryID/:id", authenticate, async (req, res, next) => {
  try {
    const id = req.params.id;
    let results = await pool("product")
      .select("id", "name")
      .where("categoryid", id)
      .where("status", true);
    return res.status(200).json({ data: results });
  } catch (err) {
    return res.status(500).json({ err });
  }
});

router.get("/getByID/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    let results = await pool("product")
      .select("id", "name", "description", "price")
      .where("id", id);
    return res.status(200).json({ data: results[0] });
  } catch (err) {
    return res.status(500).json({ err });
  }
});

router.patch(
  "/update",
  authenticate,
  checkAdminRole,
  async (req, res, next) => {
    try {
      let product = req.body;
      let results = await pool("product").where("id", product.id).update({
        name: product.name,
        categoryID: product.categoryID,
        description: product.description,
        price: product.price,
      });
      if (results === 0) {
        return res.status(404).json({ message: "Product ID not found" });
      }
      return res.status(200).json({ message: "Product updated successfully" });
    } catch (err) {
      return res.status(500).json({ err });
    }
  }
);

router.delete(
  "/delete/:id",
  authenticate,
  checkAdminRole,
  async (req, res, next) => {
    try {
      const id = req.params.id;
      let results = await pool("product").where("id", id).del();
      if (results === 0) {
        return res.status(404).json({ message: "Product ID not found" });
      }
      return res.status(200).json({ message: "Product deleted successfully" });
    } catch (err) {
      return res.status(500).json({ err });
    }
  }
);

router.put(
  "/updateStatus",
  authenticate,
  checkAdminRole,
  async (req, res, next) => {
    try {
      const product = req.body;
      let results = await pool("product")
        .where("id", product.id)
        .update({ status: product.status });
      if (results === 0) {
        return res.status(404).json({ message: "Product ID not found" });
      }
      return res
        .status(200)
        .json({ message: "Product status has been updated successfully" });
    } catch (err) {
      return res.status(500).json({ err });
    }
  }
);

export default router;
