// frontend/src/utils/ApiError.js
class ApiError extends Error {
    constructor(
        statusCode = 500,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ) {
        super(message);

        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.success = false;
        this.errors = errors;

        if (stack) {
            this.stack = stack;
        } else {
            if (Error.captureStackTrace) {
                Error.captureStackTrace(this, this.constructor);
            }
        }
    }

    static fromAxios(error) {
        if (error.response) {
            // Server responded with error
            return new ApiError(
                error.response.status,
                error.response.data?.message || "Request failed",
                error.response.data?.errors || []
            );
        }
        if (error.request) {
            // No response
            return new ApiError(503, "No response from server");
        }
        // Request setup error
        return new ApiError(400, error.message);
    }
}

export default ApiError;
