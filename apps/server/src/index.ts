import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";
import { registerSocket } from "./socket.js";

dotenv.config();
const prisma = new PrismaClient();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_, res) => res.json({ ok: true }));

app.get("/players", async (_, res) => {
  const players = await prisma.player.findMany();
  res.json(players);
});

app.get("/rooms/public", async (_, res) => {
  const rooms = await prisma.room.findMany({ where: { isPublic: true }, orderBy: { createdAt: "desc" } });
  res.json(rooms);
});

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });
registerSocket(io);

const port = Number(process.env.SERVER_PORT || 4000);
httpServer.listen(port, () => console.log(`Server running on :${port}`));