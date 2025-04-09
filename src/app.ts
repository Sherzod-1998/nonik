import express from "express";
import path from "path";

//1-ENTRANCE
const app = express();
app.use(express.static(path.join(__dirname,"public")));

//2-SESSION




//3-VIEWS




//4-ROUTERS

export default app;