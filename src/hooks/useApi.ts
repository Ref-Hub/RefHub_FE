import { useState, useCallback, useRef } from "react";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { handleApiError, isNetworkError } from "@/utils/errorHandler";

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  retryCount?: number;
  retryDelay?: number;
}

export const useApi = <T = any>(options: UseApiOptions<T> = {}) => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const retryCountRef = useRef(0);
  const { retryCount = 3, retryDelay = 1000, onSuccess, onError } = options;

  const execute = useCallback(
    async (config: AxiosRequestConfig) => {
      setIsLoading(true);
      setError(null);

      try {
        const response: AxiosResponse<T> = await axios(config);
        setData(response.data);
        onSuccess?.(response.data);
        return response.data;
      } catch (error) {
        const apiError = handleApiError(error);
        setError(apiError);

        // 네트워크 에러인 경우 재시도
        if (isNetworkError(error) && retryCountRef.current < retryCount) {
          retryCountRef.current += 1;
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          return execute(config);
        }

        onError?.(apiError);
        throw apiError;
      } finally {
        setIsLoading(false);
        retryCountRef.current = 0;
      }
    },
    [onSuccess, onError, retryCount, retryDelay]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
    retryCountRef.current = 0;
  }, []);

  return {
    data,
    error,
    isLoading,
    execute,
    reset,
  };
};
