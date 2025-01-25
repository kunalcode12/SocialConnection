const API_URL = "http://127.0.0.1:3000/api/v1";

// Helper function for handling fetch responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    console.log(error);
    throw new Error(error.message || "Something went wrong");
  }
  return response.json();
};

export const mediaService = {
  // Get user's media with pagination and filters
  getUserMedia: async (
    userId,
    page = 1,
    limit = 12,
    type,
    sortBy = "createdAt",
    order = "desc"
  ) => {
    const params = new URLSearchParams({
      page,
      limit,
      ...(type && { type }),
      sortBy,
      order,
    });

    const response = await fetch(`${API_URL}/media/user/${userId}?${params}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return handleResponse(response);
  },

  // Get media feed
  getFeed: async (page = 1, limit = 20, lastId = null, type = null) => {
    const params = new URLSearchParams({
      page,
      limit,
      ...(lastId && { lastId }),
      ...(type && { type }),
    });

    const response = await fetch(`${API_URL}/media/feed?${params}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return handleResponse(response);
  },

  // Search media
  searchMedia: async (
    query,
    type,
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    order = "desc"
  ) => {
    const params = new URLSearchParams({
      query,
      page,
      limit,
      sortBy,
      order,
      ...(type && { type }),
    });

    const response = await fetch(`${API_URL}/media/search?${params}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return handleResponse(response);
  },

  // Initialize upload
  initializeUpload: async (mediaData) => {
    const response = await fetch(`${API_URL}/media/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mediaData),
    });

    const d = await response.json();
    console.log(d);
    // return handleResponse(response);
    return d;
  },

  // Upload chunk
  uploadChunk: async (chunk, chunkIndex, uploadId, totalChunks, typeFile) => {
    const formData = new FormData();

    // Ensure chunk is added correctly
    formData.append("chunk", chunk, `chunk-${chunkIndex}`);
    formData.append("uploadId", uploadId);
    formData.append("totalChunks", totalChunks);
    formData.append("chunkIndex", chunkIndex);
    formData.append("typeFile", typeFile);

    const response = await fetch(`${API_URL}/media/chunk`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        // Do NOT set Content-Type, let browser set it for FormData
      },
      body: formData,
    });

    return handleResponse(response);
  },

  // Get upload status
  getUploadStatus: async (uploadId) => {
    const response = await fetch(`${API_URL}/media/status/${uploadId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return handleResponse(response);
  },

  // Update media
  updateMedia: async (mediaId, file, typeFile, contentId) => {
    try {
      const formData = new FormData();
      formData.append("file", file); // 'file' should match the middleware expectation
      formData.append("typeFile", typeFile);
      formData.append("contentId", contentId);

      const url = new URL(`${API_URL}/media/${mediaId}`);

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Add the authorization header
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Media update failed");
      }

      return await response.json();
    } catch (error) {
      console.error("Media update error:", error);
      throw error;
    }
  },

  // Delete media
  deleteMedia: async (mediaId) => {
    try {
      const response = await fetch(`${API_URL}/media/${mediaId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // For 204 No Content, return null or a success indicator
      if (response.status === 204) {
        return { success: true };
      }

      // For other status codes, parse JSON
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Delete media error:", error);
      throw error;
    }
  },
};
