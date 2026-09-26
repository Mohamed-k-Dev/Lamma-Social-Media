import { customAlphabet } from "nanoid";
import { hashData } from "../security/hash.js";

export const generateOtp = async () => {
  const otp = customAlphabet("1234567890", 6)();
  const otpExpiration = new Date(
    Date.now() + +process.env.OTP_EXPIRATION * 60 * 1000
  );
  const hashedOtp = await hashData(otp, +process.env.OTP_SALT);
  return { otp, otpExpiration, hashedOtp };
};
