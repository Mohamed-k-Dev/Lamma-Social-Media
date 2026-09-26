export const sendSuccessResponse = ({
  res,
  message = "success",
  data = undefined,
  status = 200,
} = {}) => {
  res.status(status).json({ success: true, message, data });
};

export const errorResponse = ({
  res,
  message = "Something went wrong",
  status = 500,
  error = undefined,
  stack = undefined,
}) => {
  return res.status(status).json({
    success: false,
    message,
    error,
    stack,
  });
};
