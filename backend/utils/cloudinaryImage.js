import cloudinary from "../config/cloudinary.js";

const FOLDER = "ems/employees";
const DOC_FOLDER = "ems/employee-docs";

const isDataUrl = (value) =>
  typeof value === "string" && value.startsWith("data:");

const isImageDataUrl = (value) =>
  typeof value === "string" && value.startsWith("data:image/");

const isCloudinaryUrl = (value, folder = FOLDER) =>
  typeof value === "string" &&
  value.includes("res.cloudinary.com/") &&
  value.includes(`/${folder}/`);

/** Extract public_id from a Cloudinary delivery URL for this app folder. */
export const getCloudinaryPublicId = (imageUrl, folder = FOLDER) => {
  if (!isCloudinaryUrl(imageUrl, folder)) return null;

  try {
    const pathname = new URL(imageUrl).pathname;
    const marker = `/${folder}/`;
    const idx = pathname.indexOf(marker);
    if (idx === -1) return null;

    const afterFolder = pathname.slice(idx + 1);
    return afterFolder.replace(/\.[^/.]+$/, "");
  } catch {
    return null;
  }
};

const assertCloudinaryConfigured = () => {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
    );
  }
};

/**
 * If `image` is a base64 data URL, upload to Cloudinary and return secure_url.
 * Existing http(s) URLs are returned as-is. Empty stays empty.
 */
export const resolveEmployeeImage = async (image) => {
  if (!image) return "";

  if (!isImageDataUrl(image)) return image;

  assertCloudinaryConfigured();

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
  const publicId = getCloudinaryPublicId(imageUrl, FOLDER);
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.warn("Cloudinary destroy failed:", err.message);
  }
};

/**
 * Upload employee document (image or PDF data URL) → Cloudinary URL.
 * Existing http(s) URLs returned as-is.
 */
export const resolveEmployeeDocument = async (dataUrlOrUrl) => {
  if (!dataUrlOrUrl) return "";

  if (!isDataUrl(dataUrlOrUrl)) return dataUrlOrUrl;

  assertCloudinaryConfigured();

  const isPdf = dataUrlOrUrl.startsWith("data:application/pdf");
  const result = await cloudinary.uploader.upload(dataUrlOrUrl, {
    folder: DOC_FOLDER,
    resource_type: isPdf ? "raw" : "auto",
    overwrite: false,
  });

  return result.secure_url;
};

export const destroyEmployeeDocument = async (url) => {
  if (!url || !String(url).includes("res.cloudinary.com/")) return;

  try {
    const pathname = new URL(url).pathname;
    const marker = `/${DOC_FOLDER}/`;
    const idx = pathname.indexOf(marker);
    if (idx === -1) return;
    const afterFolder = pathname.slice(idx + 1);
    const publicId = afterFolder.replace(/\.[^/.]+$/, "");
    const isRaw = url.includes("/raw/upload/");
    await cloudinary.uploader.destroy(publicId, {
      resource_type: isRaw ? "raw" : "image",
    });
  } catch (err) {
    console.warn("Cloudinary doc destroy failed:", err.message);
  }
};
