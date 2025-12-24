
import axios from "axios";

export const API_BASE = "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
});
