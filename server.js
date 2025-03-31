require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const forumRoutes = require("./routes/forumRoutes");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("❌ MONGO_URI is not defined. Check your .env file.");
    process.exit(1);
}

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket Server
const io = socketIo(server, {
    cors: {
    origin: ["https://amanm006.github.io", "http://127.0.0.1:5500"],
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Middleware
app.use(cors({
    origin: "https://amanm006.github.io",
    methods: ["GET", "POST"],
    credentials: true
}));
app.use(express.json());

// Debug Middleware: Log incoming requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.use((req, res, next) => {
    console.log(`📡 [${req.method}] ${req.url}`);
    next();
});

// Add request logging middleware
app.use((req, res, next) => {
    console.log(`🔍 ${req.method} ${req.url}`);
    next();
});

app.use("/api", forumRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Server error:', err);
    res.status(500).json({ message: 'Internal server error' });
});

// WebSocket for real-time chat
io.on("connection", (socket) => {
    console.log(`🔵 User connected: ${socket.id}`);

    socket.on("newMessage", (data) => {
        console.log("📨 Received new message:", data);
        io.emit("messageReceived", data); // Broadcast to all users
    });

    socket.on("disconnect", () => {
        console.log(`🔴 User disconnected: ${socket.id}`);
    });

    // Debugging WebSocket
    socket.onAny((event, ...args) => {
        console.log(`⚡ Event received: ${event}`, args);
    });
});

// MongoDB Connection with Debugging
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => {
        console.error("❌ MongoDB Connection Error:", err);
        process.exit(1);
    });

// Start the server
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// Handle server errors
server.on("error", (err) => {
    console.error("❌ Server error:", err);
});

// Graceful shutdown
process.on("SIGINT", async () => {
    console.log("🔴 Shutting down server...");
    await mongoose.disconnect();
    server.close(() => {
        console.log("🛑 Server closed.");
        process.exit(0);
    });
});
