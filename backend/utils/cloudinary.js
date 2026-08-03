const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadAvatar = (buffer) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "neurocare/avatars",
        resource_type: "image",
        transformation: [
          { width: 512, height: 512, crop: "fill", gravity: "face" },
          { fetch_format: "auto", quality: "auto" },
        ],
      },
      (error, result) => (error ? reject(error) : resolve(result)),
    );

    uploadStream.end(buffer);
  });

module.exports = { cloudinary, uploadAvatar };
