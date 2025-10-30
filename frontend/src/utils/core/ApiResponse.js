// frontend/src/utils/ApiResponse.js
class ApiResponse {
  constructor(statusCode = 200, data = null, message = 'Request successful') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode >= 200 && statusCode < 400;
  }

  static fromAxios(response) {
    return new ApiResponse(response.status, response.data, response.statusText);
  }
}

export default ApiResponse;
