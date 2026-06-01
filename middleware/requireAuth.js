function requireAuth(req, res, next) {
  const email = req.session?.user?.email;
  if (!email) {
    return res.status(401).json({
      success: false,
      message: "Sign in required",
    });
  }
  next();
}

module.exports = { requireAuth };
