const API_URL = "http://127.0.0.1:3000/api/v1";

// Helper function for handling fetch responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
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
    return handleResponse(response);
  },

  // Upload chunk
  uploadChunk: async (chunk, chunkIndex, uploadId, totalChunks) => {
    const formData = new FormData();
    formData.append("chunk", chunk);
    formData.append("chunkIndex", chunkIndex);
    formData.append("uploadId", uploadId);
    formData.append("totalChunks", totalChunks);

    const response = await fetch(`${API_URL}/media/chunk`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
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
  updateMedia: async (mediaId, updateData) => {
    const response = await fetch(`${API_URL}/media/${mediaId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });
    return handleResponse(response);
  },

  // Delete media
  deleteMedia: async (mediaId) => {
    const response = await fetch(`${API_URL}/media/${mediaId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return handleResponse(response);
  },
};
