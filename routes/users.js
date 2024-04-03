import express from "express";
import { pool } from "../connection.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { authenticate } from "../middlewares/auth.js";
import { checkAdminRole } from "../middlewares/checkAdminRole.js";

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

router.post("/signup", async (req, res) => {
  try {
    const user = req.body;

    // Check if email already exists
    const emailCheckResult = await pool("users")
      .select("email")
      .where("email", user.email);

    if (emailCheckResult.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // If email does not exist, insert new user
    await pool("users").insert({
      name: user.name,
      phone: user.phone,
      email: user.email,
      password: user.password,
      status: "false",
      role: "user",
    });

    return res.status(200).json({ message: "Successfully registered" });
  } catch (err) {
    console.error("Error during signup:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = req.body;

    const rows = await pool("users")
      .select("email", "password", "role", "status")
      .where({ email: user.email });

    if (rows.length === 0 || rows[0].password !== user.password) {
      return res.status(401).json({ message: "Incorrect username/password" });
    } else if (rows[0].status === "false") {
      return res.status(401).json({ message: "Await admin approval" });
    } else {
      const response = {
        email: rows[0].email,
        role: rows[0].role,
      };

      const accessToken = jwt.sign(response, process.env.SECRET, {
        expiresIn: "8h",
      });

      return res.status(200).json({
        token: accessToken,
        message: "User logged in",
      });
    }
  } catch (err) {
    console.error("Error during login:", err);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again!" });
  }
});

router.post("/forgotPassword", async (req, res) => {
  const user = req.body;

  try {
    // Check if the email exists in the database
    const result = await pool("users")
      .select("email", "password")
      .where("email", user.email);

    if (result.length <= 0) {
      return res.status(200).json({
        message: "Password sent to your email",
      });
    } else {
      const mailOptions = {
        from: process.env.EMAIL,
        to: result[0].email,
        subject: "Password retrieval by Cafe Management system",
        html: `<p>Your login details for the Cafe Management System <br> Email: ${result[0].email} <br> Password: ${result[0].password} <br> <a href='http://localhost:8080'>Click Here to Login</a></p>`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          return res.status(500).json({ error });
        } else {
          console.log(info.response);
          console.log("\n Email sent");
          return res.status(200).json({
            message: "Password sent to your email",
          });
        }
      });
    }
  } catch (err) {
    console.error("Error executing query", err);
    return res.status(500).json({ error: err.message });
  }
});

router.get("/get", authenticate, checkAdminRole, async (req, res) => {
  try {
    const rows = await pool("users")
      .select("id", "name", "email", "phone", "status")
      .where("role", "user");

    return res.status(200).json(rows);
  } catch (err) {
    console.error("Error retrieving user data:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/update", authenticate, checkAdminRole, async (req, res) => {
  try {
    const user = req.body;
    const affectedRows = await pool("users")
      .where("id", user.id)
      .update({ status: user.status });

    if (affectedRows === 0) {
      return res.status(404).json({ message: "User ID does not exist" });
    }

    return res.status(200).json({ message: "User updated successfully" });
  } catch (err) {
    console.error("Error updating user:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/changePassword", authenticate, async (req, res) => {
  const user = req.body;
  const email = res.locals.email;

  try {
    const rows = await pool("users")
      .select()
      .where("email", email)
      .andWhere("password", user.oldPassword);

    if (rows.length <= 0) {
      return res.status(400).json({ message: "Incorrect password" });
    } else if (rows[0].password === user.oldPassword) {
      await pool("users")
        .where("email", email)
        .update({ password: user.newPassword });

      return res.status(200).json({ message: "Password updated successfully" });
    } else {
      return res
        .status(400)
        .json({ message: "Something went wrong!! Please try again" });
    }
  } catch (err) {
    console.error("Error changing password:", err);
    return res.status(500).json({ error: err });
  }
});

export default router;
