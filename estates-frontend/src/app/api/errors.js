export const getErrorMessage = (err) => {
  if (!err.response) {
    return "Could not reach the server. Check your connection and try again.";
  }

  const detail = err.response.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail.length > 0) return detail[0].msg;
  return "Something went wrong. Please try again.";
};