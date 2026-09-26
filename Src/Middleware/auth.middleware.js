import User from "../DB/Models/User.model.js";
import { verifyAccessToken } from "../Utils/token/token.js";
import { getAccessToken } from "../Utils/token/getAccessToken.js";
import { isTokenBlacklisted } from "../Utils/token/isTokenBlacklisted.js";
import { decryptPhone } from "../Utils/security/decryptPhone.js";
import { errorHandler } from "./errorHandler.middleware.js";
import { errorResponse } from "../Utils/response/ApiResponse.js";

const excludedFields = {
  password: 0,
  __v: 0,
  createdAt: 0,
  updatedAt: 0,
  isVerified: 0,
  otp: 0,
  otpExpiration: 0,
  forgetOtp: 0,
  forgetOtpExpiration: 0,
  isBlocked: 0,
  isDeleted: 0,
};

export const authenticationMiddleware = errorHandler(async (req, res, next) => {
  const accessToken = getAccessToken(req, res);

  const decoded = await verifyAccessToken(accessToken, res);
  const isAccessTokenBlacklisted = await isTokenBlacklisted(decoded.jti);
  if (isAccessTokenBlacklisted) {
    errorResponse({
      res,
      message: "Access token is blacklisted",
      status: 401,
    });
  }

  const user = await User.findById(decoded.id, excludedFields);
  if (!user) {
    errorResponse({
      res,
      message: "User not found",
      status: 404,
    });
  }

  user.phone = decryptPhone(user.phone);
  req.authUser = user;
  req.authUser.token = { tokenId: decoded.jti, expiredAt: decoded.exp };
  next();
});

export const authorizationMiddleware = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.authUser.role)) {
      return errorResponse({
        res,
        message: "You are not authorized",
        status: 403,
      });
    }
    next();
  };
};
