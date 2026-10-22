// Run Askly on your own computer: npm start, then open http://localhost:3000
import "dotenv/config";
import express from "express";
import handler from "./api/chat.js";

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(express.static("public"));
app.all("/api/chat", handler);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Askly running on http://localhost:${port}`));
