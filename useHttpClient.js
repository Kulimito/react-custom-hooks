import { useState, useCallback, useRef, useEffect } from "react";

import axiosInstance from "../axios-instances/axios-localhost";
import axios from "axios";

export const useHttpClient = () => {
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState(null);

  const activeHttpRequests = useRef([]);

  const errorHandler = () => {
    setError(null);
  };

  const sendRequest = useCallback(
    async (url, data = null, method = "get", headers = null) => {
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();

      activeHttpRequests.current.push(source);

      setIsLoading(true);

      try {
        const response = await axiosInstance({
          method,
          url,
          data,
          headers,
          cancelToken: source.token
        });

        const responseData = response.data;

        setIsLoading(false);

        return responseData;
      } catch (err) {
        setIsLoading(false);
        if (axios.isCancel(err)) {
          console.log("Request canceled", err.message);
        } else if (err.response) {
          setError(err.response.data.message);
        } else {
          setError(err.message || "Something went wrong, please try again.");
        }
      }
    },
    []
  );

  useEffect(() => {
    const source = activeHttpRequests.current;
    return () => {
      source.forEach((source) =>
        source.cancel("Operation canceled by the user.")
      );
    };
  }, []);

  return [isLoading, error, sendRequest, errorHandler];
};
