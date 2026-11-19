import ValidationError from "./ValidationError.js";

export default function handleError(res, err) {
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  console.error(err);
  return res.status(500).json({ message: "Server error. Try again." });
}
