import axios from "axios";

const devBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === "development" ? devBaseUrl : "/api",
  withCredentials: true,
});

console.log("Axios baseURL:", axiosInstance.defaults.baseURL);

export default axiosInstance;
