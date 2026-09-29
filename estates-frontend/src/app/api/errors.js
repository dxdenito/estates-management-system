export const getErrorMessage = (err) => {
  const detail = err.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail.length > 0) return detail[0].msg;
  return "Something went wrong. Please try again.";
};