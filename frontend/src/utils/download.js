import api from "../api/axios";

export const downloadFile = async (url, filename) => {
  try {
    const response = await api.get(url, {
      responseType: 'blob',
    });
    
    // Create a URL for the blob
    const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', filename);
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    
    // Clean up the URL object
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error("Download failed:", error);
    alert("Failed to download file. Please try again.");
  }
};
