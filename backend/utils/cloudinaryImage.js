import cloudinary from "../config/cloudinary.js";

const FOLDER = "ems/employees";

const isDataUrl = (value) =>
  typeof value === "string" && value.startsWith("data:image/");

const isCloudinaryUrl = (value) =>
  typeof value === "string" &&
  value.includes("res.cloudinary.com/") &&
  value.includes(`/${FOLDER}/`);

/** Extract public_id from a Cloudinary delivery URL for this app folder. */
export const getCloudinaryPublicId = (imageUrl) => {
  if (!isCloudinaryUrl(imageUrl)) return null;

  try {
    const pathname = new URL(imageUrl).pathname;
    const marker = `/${FOLDER}/`;
    const idx = pathname.indexOf(marker);
    if (idx === -1) return null;

    const afterFolder = pathname.slice(idx + 1); // ems/employees/...
    return afterFolder.replace(/\.[^/.]+$/, "");
  } catch {
    return null;
  }
};

/**
 * If `image` is a base64 data URL, upload to Cloudinary and return secure_url.
 * Existing http(s) URLs are returned as-is. Empty stays empty.
 */
export const resolveEmployeeImage = async (image) => {
  if (!image) return "";

  if (!isDataUrl(image)) return image;

  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
    );
  }

  const result = await cloudinary.uploader.upload(image, {
    folder: FOLDER,
    resource_type: "image",
    overwrite: false,
    transformation: [
      { width: 500, height: 500, crop: "limit" },
      { quality: "auto:good", fetch_format: "auto" },
    ],
  });

  return result.secure_url;
};

export const destroyEmployeeImage = async (imageUrl) => {
  const publicId = getCloudinaryPublicId(imageUrl);
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.warn("Cloudinary destroy failed:", err.message);
  }
};
