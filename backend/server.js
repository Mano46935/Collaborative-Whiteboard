import registerWhiteBoardHandlers from "./sockets/whiteboardSocket.js";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import cors from "cors";
import {Server} from "socket.io";
import connectDB from "./config/db.js";
import  boardRoutes from "./routes/boardRoutes.js";
dotenv.config();
const PORT=process.env.PORT||5000;
const CLIENT_ORIGIN=process.env.CLIENT_ORIGIN ||"http://localhost:5173";
const app=express();
app.use(express.json());
app.use(cors({origin:CLIENT_ORIGIN}));

app.use("/api/boards", boardRoutes);
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: CLIENT_ORIGIN, methods: ["GET", "POST"] },
});

registerWhiteBoardHandlers(io);

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`[Server] Listening on http://localhost:${PORT}`);
  });
});