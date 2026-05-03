import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
});

export async function uploadMeetingAudio({ title, file }) {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("file", file);

  const response = await api.post("/api/uploads", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

export async function getMeetings() {
  const response = await api.get("/api/meetings");
  return response.data;
}

export async function getMeeting(meetingId) {
  const response = await api.get(`/api/meetings/${meetingId}`);
  return response.data;
}

export async function updateActionItem(actionItemId, payload) {
  const response = await api.patch(`/api/action-items/${actionItemId}`, payload);
  return response.data;
}

export function getMeetingAudioUrl(meetingId) {
  return `${api.defaults.baseURL}/api/meetings/${meetingId}/audio`;
}

export function getApiErrorMessage(error) {
  return error.response?.data?.detail || error.message || "Something went wrong";
}
