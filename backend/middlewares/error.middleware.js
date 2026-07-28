const notFound = (req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
};

const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error("[NeuroCare API]", err);
  if (err.name === "ValidationError") {
    return res.status(400).json({ success: false, message: Object.values(err.errors).map((item) => item.message).join(", ") });
  }
  if (err.name === "CastError") return res.status(400).json({ success: false, message: "Invalid resource identifier." });
  if (err.code === 11000) return res.status(409).json({ success: false, message: "A record with those details already exists." });
  return res.status(err.statusCode || 500).json({ success: false, message: err.message || "Something went wrong. Please try again." });
};

module.exports = { notFound, errorHandler };
