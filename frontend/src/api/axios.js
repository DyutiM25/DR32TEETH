import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  withCredentials: true,
});

console.log("Axios baseURL:", axiosInstance.defaults.baseURL);

export default axiosInstance;
