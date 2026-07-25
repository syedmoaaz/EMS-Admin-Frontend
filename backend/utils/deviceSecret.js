import crypto from "crypto";

export const MIN_DEVICE_SECRET_LENGTH = 14;

export const hashDeviceSecret = (secret) =>
  crypto.createHash("sha256").update(String(secret)).digest("hex");

export const generateDeviceSecret = () => {
  const raw = crypto.randomBytes(24).toString("hex");
  return `ems_dev_${raw}`;
};

export const assertDeviceSecretRules = (secret) => {
  const value = String(secret || "").trim();
  if (!value) {
    throw new Error("Device secret is required.");
  }
  if (value.length < MIN_DEVICE_SECRET_LENGTH) {
    throw new Error(
      `Device secret must be at least ${MIN_DEVICE_SECRET_LENGTH} characters.`
    );
  }
  if (/\s/.test(value)) {
    throw new Error("Device secret must not contain spaces.");
  }
  return value;
};
