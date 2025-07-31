import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Utility function to extract error message from API responses
 */
export const getErrorMessage = (err: unknown): string => {
  if (err && typeof err === 'object' && 'response' in err) {
    const response = (err as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message || 'An error occurred. Please try again.';
  }
  
  if (err instanceof Error) {
    return err.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
};
