// api/uploadStoryWithProgress.js
export function uploadStoryWithProgress({
  file,
  placeId = null,
  onProgress,
  initData,
}) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("story", file);
    if (placeId != null) formData.append("place", String(placeId));

    const xhr = new XMLHttpRequest();

    // Track upload progress
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);

          if (response.id) {
            resolve(response);
          } else {
            reject(new Error(response.message || "Upload failed"));
          }
        } catch (e) {
          reject(new Error("Invalid response from server"));
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Upload failed"));
    });

    // Use the base URL
    const API_BASE_URL = "https://foydabor.uz/api";
    xhr.open("POST", `${API_BASE_URL}/story/story/`);

    // Set authorization header with init data
    if (initData) {
      xhr.setRequestHeader("Authorization", `tma ${initData}`);
    }

    xhr.send(formData);
  });
}
