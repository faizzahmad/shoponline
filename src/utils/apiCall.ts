import axios from 'axios';

const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

const axiosInstance = () => {
  const instance = axios.create({
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return instance;
};

export const fetchData = async (endpoint: string) => {
  try {
    const response = await axiosInstance().get(`${BASE_URL}/${endpoint}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const postData = async (endpoint: string, data: any) => {
  try {
    const response = await axiosInstance().post(`${BASE_URL}/${endpoint}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const deleteData = async (endpoint: string) => {
  try {
    const response = await axiosInstance().delete(`${BASE_URL}/${endpoint}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateData = async (endpoint: string) => {
  try {
    const response = await axiosInstance().put(`${BASE_URL}/${endpoint}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateDatawithData = async (endpoint: string, data: any) => {
  try {
    const response = await axiosInstance().put(`${BASE_URL}/${endpoint}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};
