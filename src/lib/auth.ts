import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";
import crypto from "crypto";

function getJwtSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  
  const dev = process.env.NODE_ENV !== "production";
  if (dev) return "super-secret-key-for-billing-software-123";

  const appDataPath = process.env.APPDATA || (process.platform === 'darwin' ? path.join(process.env.HOME || '', 'Library', 'Application Support') : path.join(process.env.HOME || '', '.config'));
  const appFolder = path.join(appDataPath, 'BillingSystem');
  const secretPath = path.join(appFolder, '.jwt_secret');
  
  try {
    if (fs.existsSync(secretPath)) {
      return fs.readFileSync(secretPath, 'utf8').trim();
    }
  } catch (e) {
    // Fall back to generation
  }
  
  const newSecret = crypto.randomBytes(32).toString('hex');
  try {
    if (!fs.existsSync(appFolder)) fs.mkdirSync(appFolder, { recursive: true });
    fs.writeFileSync(secretPath, newSecret, 'utf8');
  } catch (e) {
    console.error("Could not save JWT secret", e);
  }
  return newSecret;
}

const secretKey = getJwtSecret();
const encodedKey = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return null;
  return await decrypt(session);
}

export async function requireAdmin() {
  const session = await getSession();
  if (session?.role !== "Admin") {
    const { redirect } = await import("next/navigation");
    redirect("/billing");
  }
}
