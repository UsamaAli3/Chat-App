//4OQqYyh3QBwWxIHN
import express, { json } from "express";
import connectDB from "./mongoDb.mjs";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import User from "./models/User.mjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import ws, { WebSocketServer } from "ws";

const PORT = process.env.PORT || "3000";
connectDB();
const jwtSecret = process.env.JWT_SECRET;
const bcryptSalt = bcrypt.genSaltSync(10);

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    optionsSuccessStatus: 200,
    credentials: true,
  })
);
app.get("/", (req, res) => {
  return res.send("Hello! this is a test");
});

app.get("/profile", async (req, res) => {
  const token = req.cookies?.token;
  if (token) {
    jwt.verify(token, jwtSecret, {}, (err, userData) => {
      if (err) return err;
      res.json(userData);
    });
  } else {
    res.status(401).send("no token");
  }
});

//Sign in
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
    const createdUser = await User.create({
      username: username,
      password: hashedPassword,
    });
    jwt.sign(
      { userId: createdUser._id, username },
      jwtSecret,
      {},
      (err, token) => {
        if (err) throw err;
        res
          .cookie("token", token, { sameSite: "none", secure: true })
          .status(201)
          .json({
            id: createdUser._id,
          });
      }
    );
  } catch (error) {
    if (error) throw error;
    res.status(500).json(error);
  }
});

//Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const foundUser = await User.findOne({ username });
  if (foundUser) {
    const passOk = bcrypt.compareSync(password, foundUser.password);
    if (passOk) {
      jwt.sign(
        { userId: foundUser._id, username },
        jwtSecret,
        {},
        (err, token) => {
          res.cookie("token", token, { sameSite: "none", secure: true }).json({
            id: foundUser._id,
          });
        }
      );
    }
  }
});

const server = app.listen(PORT);
const wss = new WebSocketServer({ server });
wss.on("connection", (connection, req) => {
  //read username and id from the cookie
  const cookie = req.headers.cookie;
  if (cookie) {
    const tokenCookieString = cookie
      .split(";")
      .find((str) => str.startsWith("token="));
    if (tokenCookieString) {
      const token = tokenCookieString.split("=")[1];
      if (token) {
        jwt.verify(token, jwtSecret, {}, (err, userData) => {
          if (err) throw err;
          const { userId, username } = userData;
          connection.userId = userId;
          connection.username = username;
        });
      }
    }
  }

  connection.on("message", (message) => {
    const messageData = JSON.parse(message.toString());
    const { recipient, text } = messageData;
    if (recipient && text) {
      const hi = [...wss.clients]
        .filter((c) => c.userId === recipient)
        .forEach((c) =>
          c.send(JSON.stringify({ text, sender: connection.userId }))
        );
    }
  });
  //Notify everyOne
  [...wss.clients].forEach((client) => {
    client.send(
      JSON.stringify({
        online: [...wss.clients].map((cl) => ({
          userId: cl.userId,
          username: cl.username,
        })),
      })
    );
  });
});
