import registerWhiteBoardHandlers from "./sockets/whiteboardSocket.js";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import cors from "cors";
import {Server} from "socket.io";
import connectDB from "./config/db.js";
import session from "express-session";
import MongoStore from "connect-mongo";
import  boardRoutes from "./routes/boardRoutes.js";
import loginRoute from "./routes/loginRoute.js";
dotenv.config();
const PORT=process.env.PORT||5000;
const CLIENT_ORIGIN=process.env.CLIENT_ORIGIN ||"http://localhost:5173";
const app=express();
if(process.env.NODE_ENV==="production"){
  app.set("trust proxy",1);
}
const isProduction = process.env.NODE_ENV === "production";
app.use(express.json());
app.use(cors({origin:CLIENT_ORIGIN,credentials:true}));
app.use(session({
name:"whiteboard.sid",
secret:process.env.SESSION_SECRET,
resave:false,
saveUninitialized:false,
store:MongoStore.create({mongoUrl:process.env.MONGO_URL}),
cookie:{
  httpOnly:true,
  secure:process.env.NODE_ENV==="production",
  sameSite:isProduction?"none":"lax",
  maxAge:1000*60*60*24
}
}));
app.use("/api/boards", boardRoutes);
app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/login",loginRoute);
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: CLIENT_ORIGIN, methods: ["GET", "POST"],credentials:true }
});
app.get("/api/auth/me", (req, res) => {
    if (!req.session?.userId) {
        return res.status(401).json({
            message: "Not logged in"
        });
    }

    return res.status(200).json({
        userId: req.session.userId
    });
});
registerWhiteBoardHandlers(io);

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`[Server] Listening on http://localhost:${PORT}`);
  });
});