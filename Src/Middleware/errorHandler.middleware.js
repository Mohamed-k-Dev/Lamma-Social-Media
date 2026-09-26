import { errorResponse } from "../Utils/response/ApiResponse.js";

export const errorHandler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => {
      errorResponse({
        res,
        message: err.message || "Internal server error",
        status: err.cause || 500,
        error: err.errors || [],
        stack: err.stack || "",
      });
    });
  };
};

export const globalErrorHandler = (err, req, res, next) => {
  // console.log(`Error in global error handler middleware: ${err.message}`);
  // res.status(err.cause || 400).json({
  //   success: false,
  //   message: err.message || "Internal server error from global error handler",
  //   errors: err.errors || [],
  //   stack: err.stack,
  // });
  errorResponse({
    res,
    message: err.message || "Internal server error from global error handler",
    status: err.cause || 500,
    error: err.errors || [],
    stack: err.stack || "",
  });
};
