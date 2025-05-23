import axios from 'axios';

const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

// Axios instance
const axiosInstance = () => {
  const instance = axios.create({
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return instance;
};

// Fetch data (GET)
export const fetchData = async <T>(endpoint: string): Promise<T> => {
  try {
    const response = await axiosInstance().get(`${BASE_URL}/${endpoint}`);
    return response.data as T;
  } catch (error) {
    throw error;
  }
};

// Post data (POST)
export const postData = async <TRequest, TResponse>(
  endpoint: string,
  data: TRequest
): Promise<TResponse> => {
  try {
    const response = await axiosInstance().post(`${BASE_URL}/${endpoint}`, data);
    return response.data as TResponse;
  } catch (error) {
    throw error;
  }
};

// Delete data (DELETE)
export const deleteData = async <T>(endpoint: string): Promise<T> => {
  try {
    const response = await axiosInstance().delete(`${BASE_URL}/${endpoint}`);
    return response.data as T;
  } catch (error) {
    throw error;
  }
};

// Update data without body (PUT)
export const updateData = async <T>(endpoint: string): Promise<T> => {
  try {
    const response = await axiosInstance().put(`${BASE_URL}/${endpoint}`);
    return response.data as T;
  } catch (error) {
    throw error;
  }
};

// Update data with body (PUT)
export const updateDataWithData = async <TRequest, TResponse>(
  endpoint: string,
  data: TRequest
): Promise<TResponse> => {
  try {
    const response = await axiosInstance().put(`${BASE_URL}/${endpoint}`, data);
    return response.data as TResponse;
  } catch (error) {
    throw error;
  }
};
