import User from "../../../DB/Models/User.model.js";
import { encrypt } from "../../../Utils/security/encryption.utils.js";
import { emitter } from "../../../Service/sendEmail.service.js";
import { html } from "../../../Utils/email/html.utils.js";
import { nanoid } from "nanoid";
import BlackListedTokens from "../../../DB/Models/blackListedTokens.model.js";
import {
  errorResponse,
  sendSuccessResponse,
} from "../../../Utils/response/ApiResponse.js";
import { OAuth2Client } from "google-auth-library";
import { SYSTEM_PROVIDERS } from "../../../Constants/Constants.js";
import { findUserByEmail } from "../../../Utils/user/findUser.js";
import { compareHashedData, hashData } from "../../../Utils/security/hash.js";
import { generateOtp } from "../../../Utils/otp/otp.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../../../Utils/token/token.js";

export const signUp = async (req, res, next) => {
  const data = req.body;

  const isUserExist = await findUserByEmail(data.email);
  if (isUserExist) {
    return errorResponse({
      res,
      message: "User already exist",
      status: 409,
    });
  }

  const hashedPassword = hashData(data.password);
  const encryptedPhone =
    data.phone &&
    encrypt({
      plainText: data.phone,
      secretKey: process.env.PHONE_SECRET_KEY,
    });

  const { otp, otpExpiration, hashedOtp } = await generateOtp();
  emitter.emit("sendMail", {
    to: data.email,
    subject: "Welcome to ",
    html: html({
      userName: data.userName,
      otp,
      operation: "verify your account",
    }),
  });

  await User.create({
    ...data,
    password: hashedPassword,
    phone: encryptedPhone,
    otp: hashedOtp,
    otpExpiration,
  });
  sendSuccessResponse({
    res,
    message: "User created successfully",
    status: 201,
  });
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await findUserByEmail(email);
  if (!user) {
    return errorResponse({
      res,
      message: "in-correct email or password",
      status: 404,
    });
  }

  const isPasswordMatch = await compareHashedData(password, user.password);
  if (!isPasswordMatch) {
    return errorResponse({
      res,
      message: "in-correct email or password",
      status: 404,
    });
  }

  if (!user.isVerified) {
    return errorResponse({
      res,
      message: "Please verify your email",
      status: 403,
    });
  }

  const accessToken = await generateAccessToken({
    data: { id: user._id, email: user.email, role: user.role },
  });
  const refreshToken = await generateRefreshToken({
    data: { id: user._id, email: user.email, role: user.role },
  });

  sendSuccessResponse({
    res,
    message: "User logged in successfully",
    data: { accessToken, refreshToken },
  });
};

export const signUpWithGmail = async (req, res, next) => {
  const { idToken } = req.body;
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.CLIENT_ID,
  });
  const { email_verified, email, name } = ticket.getPayload();

  if (!email_verified) {
    return errorResponse({
      res,
      message: "Please verify your email",
      status: 403,
    });
  }

  const isUserExist = await findUserByEmail(email);
  if (isUserExist) {
    return errorResponse({
      res,
      message: "User already exist",
      status: 409,
    });
  }

  const payload = await User.create({
    email,
    userName: name,
    provider: SYSTEM_PROVIDERS.GOOGLE,
    isVerified: true,
    password: hashData(nanoid(), +process.env.SALT),
  });

  const accessToken = await generateAccessToken({
    data: { id: payload._id, email: payload.email, role: payload.role },
  });
  sendSuccessResponse({
    res,
    message: "User created successfully",
    data: { accessToken },
  });
};

export const signInWithGmail = async (req, res, next) => {
  const { idToken } = req.body;
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.CLIENT_ID,
  });
  const payload = ticket.getPayload();

  if (!payload.email_verified) {
    return errorResponse({
      res,
      message: "Please verify your email",
      status: 403,
    });
  }

  const user = await User.findOne({
    email: payload.email,
    provider: SYSTEM_PROVIDERS.GOOGLE,
  });
  if (!user) {
    return errorResponse({
      res,
      message: "User not found",
      status: 404,
    });
  }

  const accessToken = await generateAccessToken({
    data: { id: user._id, email: user.email, role: user.role },
  });
  const refreshToken = await generateRefreshToken({
    data: { id: user._id, email: user.email, role: user.role },
  });
  sendSuccessResponse({
    res,
    message: "User logged in successfully",
    data: { accessToken, refreshToken },
  });
};

export const verifyEmail = async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await findUserByEmail(email);
  if (!user) {
    return errorResponse({
      res,
      message: "User not found",
      status: 404,
    });
  }

  const isOtpValid = await compareHashedData(otp, user.otp || "");
  if (!isOtpValid) {
    return errorResponse({
      res,
      message: "in-correct otp",
      status: 404,
    });
  }
  if (user.otpExpiration < Date.now()) {
    return errorResponse({
      res,
      message: "Otp expired",
      status: 404,
    });
  }

  await User.findOneAndUpdate(
    { email },
    { isVerified: true, $unset: { otp: "", otpExpiration: "" } }
  );

  sendSuccessResponse({
    res,
    message: "Email verified successfully",
  });
};

export const refreshToken = async (req, res, next) => {
  const { refreshtoken } = req.headers;
  if (!refreshtoken) {
    return errorResponse({
      res,
      message: "Please provide refresh token",
      status: 400,
    });
  }

  const decoded = await verifyRefreshToken(refreshtoken, res);
  if (!decoded) {
    return;
  }

  const isTokenBlacklisted = await BlackListedTokens.findOne({
    tokenId: decoded.jti,
  });
  if (isTokenBlacklisted) {
    return errorResponse({
      res,
      message: "Refresh token is blacklisted",
      status: 403,
    });
  }

  const accessToken = await generateAccessToken({
    data: { id: decoded.id, email: decoded.email, role: decoded.role },
  });

  const refreshToken = await generateRefreshToken({
    data: { id: decoded.id, email: decoded.email, role: decoded.role },
  });

  sendSuccessResponse({
    res,
    data: { accessToken, refreshToken },
  });
};

export const logout = async (req, res, next) => {
  const { accesstoken, refreshtoken } = req.headers;
  if (!accesstoken || !refreshtoken) {
    return errorResponse({
      res,
      message: "Please provide access token and refresh token",
      status: 400,
    });
  }

  const decodedAccess = await verifyAccessToken(accesstoken, res);
  const decodedRefresh = await verifyRefreshToken(refreshtoken, res);

  const isTokenBlacklisted = await BlackListedTokens.findOne({
    tokenId: { $in: [decodedAccess.jti, decodedRefresh.jti] },
  });
  if (isTokenBlacklisted) {
    return errorResponse({
      res,
      message: "Access token is blacklisted",
      status: 403,
    });
  }

  await BlackListedTokens.insertMany([
    {
      tokenId: decodedAccess.jti,
      expiredAt: decodedAccess.exp,
    },
    {
      tokenId: decodedRefresh.jti,
      expiredAt: decodedRefresh.exp,
    },
  ]);

  sendSuccessResponse({
    res,
    message: "User logged out successfully",
  });
};

export const forgetPassword = async (req, res, next) => {
  const { email } = req.body;
  const user = await findUserByEmail(email);
  if (!user) {
    return errorResponse({
      res,
      message: "User not found",
      status: 404,
    });
  }

  const {
    otp: forgetOtp,
    otpExpiration: forgetOtpExpiration,
    hashedOtp: hashedForgetOtp,
  } = await generateOtp();

  await User.findOneAndUpdate(
    { email },
    { forgetOtp: hashedForgetOtp, forgetOtpExpiration }
  );
  emitter.emit("sendMail", {
    to: email,
    subject: "Welcome to Sarahah",
    html: html({
      userName: user.userName,
      otp: forgetOtp,
      operation: "forget password",
    }),
  });

  sendSuccessResponse({
    res,
    message: "Otp sent successfully",
  });
};

export const resetPassword = async (req, res, next) => {
  const { email, password, otp } = req.body;
  const user = await findUserByEmail(email);
  if (!user) {
    return errorResponse({
      res,
      message: "User not found",
      status: 404,
    });
  }
  const isOtpValid = compareHashedData(otp, user.forgetOtp || "");
  if (!isOtpValid) {
    return errorResponse({
      res,
      message: "in-correct otp",
      status: 404,
    });
  }
  if (user.forgetOtpExpiration < Date.now()) {
    return errorResponse({
      res,
      message: "Otp expired",
      status: 404,
    });
  }

  const hashedPassword = hashData(password);
  await User.findOneAndUpdate(
    { email },
    {
      password: hashedPassword,
      $unset: { forgetOtp: "", forgetOtpExpiration: "" },
    }
  );
  sendSuccessResponse({
    res,
    message: "Password updated successfully",
  });
};
