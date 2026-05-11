import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

export const axiosClient = axios.create({
  baseURL,
  timeout: 20000,
});

export const axiosAuthClient = axios.create({
  baseURL,
  timeout: 20000,
  withCredentials: true,
});
