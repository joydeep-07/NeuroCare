const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const connectDB = require("./db/connectDB");
const seedInitialData = require("./utils/seedDoctors");

dotenv.config();

connectDB().then(() => {
  seedInitialData();
});

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || true,
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Core API Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/members", require("./routes/member.routes"));
app.use("/api/profile", require("./routes/profile.routes"));
app.use("/api/doctors", require("./routes/doctor.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/appointments", require("./routes/appointment.routes"));
app.use("/api/documents", require("./routes/document.routes"));
app.use("/api/ai", require("./routes/ai.routes"));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "NeuroCare Production Backend Running 🚀",
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[NeuroCare Server] Listening on port ${PORT}`);
});
