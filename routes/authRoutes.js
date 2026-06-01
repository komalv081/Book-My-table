const express = require("express");
const { OAuth2Client } = require("google-auth-library");

const router = express.Router();

router.get("/config", (req, res) => {
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || "",
    allowDevLogin: process.env.ALLOW_DEV_LOGIN === "true",
  });
});

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Local-only: sign in with email when ALLOW_DEV_LOGIN=true (never enable on public production). */
router.post("/dev-login", (req, res) => {
  if (process.env.ALLOW_DEV_LOGIN !== "true") {
    return res.status(403).json({
      success: false,
      message: "Dev login is disabled",
    });
  }

  const rawEmail = String(req.body?.email || "").trim().toLowerCase();
  const nameIn = String(req.body?.name || "").trim();

  if (!rawEmail || !emailRe.test(rawEmail)) {
    return res.status(400).json({
      success: false,
      message: "Enter a valid email address",
    });
  }

  req.session.user = {
    sub: `dev:${rawEmail}`,
    email: rawEmail,
    name: nameIn || rawEmail.split("@")[0],
    picture: "",
    dev: true,
  };

  res.json({ success: true, user: req.session.user });
});

router.get("/me", (req, res) => {
  if (!req.session?.user) {
    return res.status(401).json({ success: false, message: "Not signed in" });
  }
  res.json({ success: true, user: req.session.user });
});

router.post("/google", async (req, res) => {
  const credential = req.body?.credential;
  if (!credential) {
    return res.status(400).json({
      success: false,
      message: "Missing Google credential",
    });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return res.status(500).json({
      success: false,
      message: "GOOGLE_CLIENT_ID is not configured on the server",
    });
  }

  try {
    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });
    const payload = ticket.getPayload();
    if (!payload?.email) {
      return res.status(401).json({
        success: false,
        message: "Google account has no email",
      });
    }

    req.session.user = {
      sub: payload.sub,
      email: String(payload.email).toLowerCase(),
      name: payload.name || payload.email,
      picture: payload.picture || "",
    };

    res.json({ success: true, user: req.session.user });
  } catch (err) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired Google sign-in",
    });
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
    res.clearCookie("connect.sid", { path: "/" });
    res.json({ success: true });
  });
});

module.exports = router;
