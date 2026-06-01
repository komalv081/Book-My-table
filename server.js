require("dotenv").config({ quiet: true });
const express = require("express");
const path = require("path");
const session = require("express-session");
const connectDB = require("./config/db");
const bookingRoutes = require("./routes/bookingRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-only-change-SESSION_SECRET",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);

app.use(express.static(path.join(__dirname, "public")));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

(async () => {
  await connectDB();
  app.listen(port, () => {
    console.log(`BookMyTable running at http://localhost:${port}`);
  });
})();
