import express from "express";
import { pool } from "../connection.js";
import { authenticate } from "../middlewares/auth.js";
import { checkAdminRole } from "../middlewares/checkAdminRole.js";
import ejs from 'ejs';
import path from "path";
import fs from 'fs';
import pdf from 'html-pdf'
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

// Construct __dirname for use with ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();


router.post("/generateReport", authenticate, async (req, res) => {
    try {
        const orderDetails = req.body;
        const generatedUUID = uuidv4();
        let productdetailsReport = JSON.parse(orderDetails.product_details);

        await pool('bill').insert({
            name: orderDetails.name,
            uuid: generatedUUID,
            email: orderDetails.email,
            phone_number: orderDetails.phone_number,
            payment_method: orderDetails.payment_method,
            total_amount: orderDetails.total_amount,
            product_details: orderDetails.product_details,
            created_by: res.locals.email
        });

        ejs.renderFile(path.join(__dirname, "", "report.ejs"), {
            productDetails: productdetailsReport,
            name: orderDetails.name,
            email: orderDetails.email,
            phoneNumber: orderDetails.phone_number,
            paymentMethod: orderDetails.payment_method,
            totalAmount: orderDetails.total_amount
        }, async (err, results) => {
            if (err) {
                return res.status(500).json({ err });
            } else {
                const pdfPath = path.resolve(__dirname, "../generated_PDF", `${generatedUUID}.pdf`);
                pdf.create(results).toFile(pdfPath, (err, data) => {
                    if (err) {
                        console.error("PDF generation error:", err);
                        return res.status(500).json({ error: "Failed to generate PDF", details: err.toString() });
                    } else {
                        console.log("PDF generated successfully:", data);
                        return res.status(200).json({ uuid: generatedUUID });
                    }
                });
            }
        });
    } catch (err) {
        console.log("Error generating bill:", err);
        return res.status(500).json({ err });
    }
});

router.post("/getPDF", authenticate, async (req, res) => {
    try {
        const orderDetails = req.body;
        const pdfPath = path.join(__dirname, "../generated_PDF/", orderDetails.uuid + ".pdf");
        if (fs.existsSync(pdfPath)) {
            res.contentType("application/pdf");
            fs.createReadStream(pdfPath).pipe(res);
        } else {
            let productDetailsReport = JSON.parse(orderDetails.productDetails);
            ejs.renderFile(path.join(__dirname, "", "report.ejs"), {
                productDetails: productDetailsReport,
                name: orderDetails.name,
                email: orderDetails.email,
                contactNumber: orderDetails.contactNumber,
                paymentMethod: orderDetails.paymentMethod,
                totalAmount: orderDetails.totalAmount
            }, async (err, results) => {
                if (err) {
                    return res.status(200).json({ err });
                } else {
                    pdf.create(results).toFile(path.join(__dirname, "../generated_PDF/", orderDetails.uuid + ".pdf"), (err, data) => {
                        if (err) {
                            console.log(err);
                            return res.status(500).json({ err });
                        } else {
                            res.contentType("application/pdf");
                            fs.createReadStream(pdfPath).pipe(res);
                        }
                    });
                }
            });
        }
    } catch (err) {
        return res.status(500).json({ err });
    }
});

router.get("/getBills", authenticate, async (req, res, next) => {
    try {
      const results = await pool('bill').select('*').orderBy('id', 'desc');
      return res.status(200).json({ data: results });
    } catch (err) {
      return res.status(500).json({ err });
    }
});

router.delete("/delete/:id", authenticate, async (req, res, next) => {
    try {
      const id = req.params.id;
      const results = await pool('bill').where('id', id).del();
      if (results === 0) {
        return res.status(404).json({ message: "Bill ID not found" });
      }
      return res.status(200).json({ message: "Bill deleted successfully" });
    } catch (err) {
      return res.status(500).json({ err });
    }
  });

export default router;