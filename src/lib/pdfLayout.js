import fs from "fs";
import path from "path";

let cachedLogo = null;

export function getLogoBase64() {
  if (cachedLogo !== null) return cachedLogo;
  try {
    const logoPath = path.join(process.cwd(), "public", "logo.png");
    const logoBuffer = fs.readFileSync(logoPath);
    cachedLogo = `data:image/png;base64,${logoBuffer.toString("base64")}`;
  } catch (e) {
    cachedLogo = "";
  }
  return cachedLogo;
}

let cachedStamp = null;

export function getStampBase64() {
  if (cachedStamp !== null) return cachedStamp;
  try {
    const stampPath = path.join(process.cwd(), "public", "stamp.png");
    const stampBuffer = fs.readFileSync(stampPath);
    cachedStamp = `data:image/png;base64,${stampBuffer.toString("base64")}`;
  } catch (e) {
    cachedStamp = "";
  }
  return cachedStamp;
}
