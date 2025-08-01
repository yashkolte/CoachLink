package com.yashkolte.coachlink.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Generic API Response wrapper for all REST endpoints
 *
 * This class provides a consistent response structure across all API endpoints,
 * making it easier for frontend applications to handle responses uniformly.
 *
 * The response includes: - success: boolean indicating if the operation was
 * successful - message: human-readable message describing the result - data:
 * the actual response payload (generic type T)
 *
 * @param <T> The type of data being returned in the response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {

    /**
     * Indicates whether the API operation was successful
     */
    private boolean success;

    /**
     * Human-readable message describing the operation result Useful for
     * displaying user-friendly messages in the frontend
     */
    private String message;

    /**
     * The actual data payload for successful operations Can be null for
     * operations that don't return data
     */
    private T data;

    /**
     * Factory method for creating successful responses with data
     *
     * @param <T> The type of data being returned
     * @param data The response data
     * @return ApiResponse with success=true and the provided data
     */
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, "Success", data);
    }

    /**
     * Factory method for creating successful responses with custom message and
     * data
     *
     * @param <T> The type of data being returned
     * @param message Custom success message
     * @param data The response data
     * @return ApiResponse with success=true, custom message, and the provided
     * data
     */
    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data);
    }

    /**
     * Factory method for creating error responses
     *
     * @param <T> The type of data (will be null for errors)
     * @param message Error message describing what went wrong
     * @return ApiResponse with success=false and the error message
     */
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null);
    }
}
