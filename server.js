require("dotenv").config({ quiet: true });
const express = require("express");
const path = require("path");
const connectDB = require("./config/db");
const bookingRoutes = require("./routes/bookingRoutes");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

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
