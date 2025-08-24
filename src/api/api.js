import { Domain } from "./globalDomain";

import { retrieveRawInitData } from "@telegram-apps/sdk-react";
export async function apiCall(url, method = "GET", body = null) {
  const initRawData = retrieveRawInitData();
  url = `${Domain}/${url}`;
  const options = {
    method,
    headers: {
      Authorization: `tma ${initRawData}`,
      "Content-Type": "application/json",
    },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      // try to parse the body as JSON
      let errorMessage = "";
      try {
        const data = await response.json();
        errorMessage = data.message || JSON.stringify(data);
      } catch {
        // fallback if body isn’t JSON
        errorMessage = await response.text();
      }

      throw new Error(`Error ${response.status}: ${errorMessage}`);
    }
    const data = await response.json();

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
