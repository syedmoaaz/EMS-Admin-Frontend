import crypto from "crypto";

export const hashDeviceSecret = (secret) =>
  crypto.createHash("sha256").update(String(secret)).digest("hex");

export const generateDeviceSecret = () => {
  const raw = crypto.randomBytes(24).toString("hex");
  return `ems_dev_${raw}`;
};
