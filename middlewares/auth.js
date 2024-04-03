import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const authenticate = (req, res, next) => {
    try {
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];
  
      if (!token) {
        return res.status(401).json({ message: "Unauthorized User" });
      }
  
      jwt.verify(token, process.env.SECRET, (err, response) => {
        if (err) {
          return res.status(403).json({ message: "Forbidden" });
        }
        res.locals = response;
        next();
      });
    } catch (error) {
      console.error("Error during authentication:", error);
      return res.status(500).json({ error: "Internal server error", message: "Internal server error" });
    }
  };