import { retrieveRawInitData } from "@telegram-apps/sdk-react";
import { Domain } from "./globalDomain";

export async function apiCall(
  url,
  method = "GET",
  body = null,
  content_type = null
) {
  const initRawData = retrieveRawInitData();
  url = `${Domain}/${url}`;
  const options = {
    method,
    headers: {
      Authorization: `tma ${initRawData}`,
    },
  };

  // Set Content-Type header only if not FormData
  if (!(body instanceof FormData)) {
    options.headers["Content-Type"] =
      content_type === null ? "application/json" : content_type;
  }

  // Handle body
  if (body instanceof FormData) {
    options.body = body; // Browser will set correct Content-Type with boundary
  } else if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);

    // Handle 204 No Content and other empty responses
    if (response.status === 204 || response.status === 205) {
      return {
        success: true,
        status: response.status,
        data: null,
        timestamp: Date.now(),
      };
    }

    if (!response.ok) {
      let errorMessage = `Error ${response.status}: ${response.statusText}`;

      // Try to get more detailed error message from response body
      try {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          errorMessage =
            errorData.message || errorData.error || JSON.stringify(errorData);
        } else {
          errorMessage = await response.text();
        }
      } catch (parseError) {
        // If we can't parse the error response, use the status text
        console.warn("Could not parse error response:", parseError);
      }

      throw new Error(errorMessage);
    }

    // Parse successful response
    const contentType = response.headers.get("content-type");
    let data = null;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else if (contentType && contentType.includes("text/")) {
      data = await response.text();
    } else {
      // For other content types, return as blob or empty
      data = await response.blob();
    }

    return {
      success: true,
      status: response.status,
      data: data,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("Api error:", error);
    return {
      success: false,
      status: null,
      error: error.message,
      data: null,
    };
  }
}
