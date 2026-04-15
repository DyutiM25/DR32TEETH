import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.MODE === "development"
    ? "http://localhost:3000/api"
    : "/api");

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});

export default axiosInstance;
