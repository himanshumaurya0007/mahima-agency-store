import { StatusCodes } from "http-status-codes";

class ApiResponse {
    constructor(statusCode = StatusCodes.OK, data = null, message = "Request successful") {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode >= StatusCodes.OK && statusCode < StatusCodes.BAD_REQUEST;
    }
}

export { ApiResponse };
