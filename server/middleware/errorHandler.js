export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  if (error.name === "ValidationError") {
    return res.status(400).json({
      message: Object.values(error.errors).map((item) => item.message).join(" ")
    });
  }

  if (error.name === "CastError") {
    return res.status(400).json({ message: "Invalid plant id." });
  }

  console.error(error);
  return res.status(error.status || 500).json({
    message: error.status ? error.message : "Something went wrong. Please try again."
  });
}
