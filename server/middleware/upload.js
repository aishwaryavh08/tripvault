const path = require("path");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

const cloudName = String(process.env.CLOUDINARY_CLOUD_NAME || "").trim();
const apiKey = String(process.env.CLOUDINARY_API_KEY || "").trim();
const apiSecret = String(process.env.CLOUDINARY_API_SECRET || "").trim();

const cloudinaryConfigured = Boolean(
  cloudName &&
    apiKey &&
    apiSecret &&
    /^[a-z0-9-]+$/i.test(cloudName)
);

if (!cloudinaryConfigured) {
  const message =
    "Cloudinary env vars are missing or invalid. Photo uploads require persistent Cloudinary storage.";

  if (process.env.NODE_ENV === "production") {
    throw new Error(message);
  }

  console.error(`${message} Falling back to local uploads in server/uploads.`);
} else {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

const storage = cloudinaryConfigured
  ? new CloudinaryStorage({
      cloudinary,
      params: {
        folder: "tripvault",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
      },
    })
  : multer.diskStorage({
      destination: function (_req, _file, cb) {
        cb(null, path.join(__dirname, "../uploads"));
      },
      filename: function (_req, file, cb) {
        const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname || "")}`;
        cb(null, safeName);
      },
    });

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = upload;