import express, { urlencoded } from "express";
import dotenv from "dotenv";
import cors from "cors";
import userRoute from "./routes/users.js";
import categoryRoute from "./routes/category.js";
import productRoute from "./routes/product.js";
import billRoute from "./routes/bill.js";
import dashboardRoute from "./routes/dashboard.js";

const app = express();
dotenv.config();

app.use(cors());
app.use(urlencoded({ extended: true }));
app.use(express.json());

app.use("/users", userRoute);
app.use("/category", categoryRoute);
app.use("/product", productRoute);
app.use("/bill", billRoute);
app.use("/dashboard", dashboardRoute);

app.listen(process.env.PORT, () => {
  console.log("Listening on port: ", process.env.PORT);
});
