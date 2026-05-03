import { useEffect, useState } from "react";

import Dashboard from "../components/Dashboard";
import Toast from "../components/Toast";
import UploadPanel from "../components/UploadPanel";
import { getApiErrorMessage, getMeetings } from "../services/api";

function HomePage() {
  const [meetings, setMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  async function loadMeetings() {
    setError("");
    try {
      const meetingList = await getMeetings();
      setMeetings(meetingList);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadMeetings();
  }, []);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  function handleUploaded(uploadedMeeting) {
    setMeetings((currentMeetings) => [uploadedMeeting, ...currentMeetings.filter((meeting) => meeting.id !== uploadedMeeting.id)]);
    setToast({ message: "Upload started. AI processing is running in the background.", type: "success" });
  }

  return (
    <>
      <Toast message={toast?.message} onDismiss={() => setToast(null)} type={toast?.type} />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <UploadPanel onUploaded={handleUploaded} />
        <Dashboard meetings={meetings} isLoading={isLoading} error={error} onRefresh={loadMeetings} />
      </div>
    </>
  );
}

export default HomePage;
