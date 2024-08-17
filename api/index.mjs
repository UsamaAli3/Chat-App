//4OQqYyh3QBwWxIHN
import express, { json } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.mjs";
import jwt from "jsonwebtoken";
import cors from "cors";

dotenv.config();
const PORT = process.env.PORT || "3000";
mongoose.connect(process.env.MONGO_URL);
const jwtSecret = process.env.JWT_SECRET;

const app = express();
app.use(json());
app.use(
  cors({
    credentials: true,
    origin: process.env.ORIGIN,
  })
);

app.get("/", (req, res) => {
  return res.send("Hello! this is a test");
});

//Sign in
app.post("/register", async (req, res) => {
  const {
    body: { username, password },
  } = req;
  try {
    const userId = await User.create({ username, password });
    jwt.sign({ userId, _id }, jwtSecret, {}, (err, token) => {
      if (err) throw err;
      res.cookie("token", token).status(201).send("ok");
    });
  } catch (error) {
    throw error;
  }
});

app.listen(PORT, () => {
  return console.log(`Running on Port: ${PORT}`);
});
