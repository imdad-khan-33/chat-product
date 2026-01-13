import { jwtDecode } from "jwt-decode";

export const attachAuthHeaders = (headers) => {
  try {
    const rawToken = localStorage.getItem("Therapy-user-token");
    if (rawToken) {
      // Token is stored as a string, not JSON
      const decodedToken = jwtDecode(rawToken);
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp && decodedToken.exp > currentTime) {
        headers.set("Authorization", `Bearer ${rawToken}`);
        headers.set("Accept", "application/json");
      } else {
        localStorage.removeItem("Therapy-user-token");
        window.location.href = "/login";
      }
    }
  } catch (error) {
    console.error("Error decoding JWT token:", error);
    localStorage.removeItem("Therapy-user-token");
    window.location.href = "/login";
  }
  return headers;
};
