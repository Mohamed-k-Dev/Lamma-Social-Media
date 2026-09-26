import { errorResponse } from "../response/ApiResponse.js";

export const getAccessToken = (req, res) => {
  const token = req.headers.authorization || req.cookies?.accessToken;

  if (!token) {
    errorResponse({ res, message: "Access token not found", status: 401 });
  }

  return token;
};
