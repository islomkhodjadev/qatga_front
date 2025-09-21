import { retrieveRawInitData } from "@telegram-apps/sdk-react";
import { X } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadStoryWithProgress } from "../../api/uploadStoryWithProgress";
import { useBotClient } from "../../utils/BotClientContext";
import { useLang } from "../../utils/language";
import BottomControls from "./BottomControls";
import CameraControls from "./CameraControls";
import CameraView from "./CameraView";
import GalleryView from "./GalleryView";
import PreviewScreen from "./PreviewScreen";
import VerificationModal from "./VerificationModal";
export default function RecordStoryScreen({ onClose, placeId }) {
  const { botClient } = useBotClient();
  const { lang } = useLang();
  const navigate = useNavigate();

  // State management
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaType, setMediaType] = useState("video");
  const [facingMode, setFacingMode] = useState("user");
  const [flashMode, setFlashMode] = useState(false);
  const [galleryMedia, setGalleryMedia] = useState([]);
  const [showGallery, setShowGallery] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [stream, setStream] = useState(null);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0); // New state for upload progress
  const [isUploading, setIsUploading] = useState(false); // New state for upload status

  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const recordedChunksRef = useRef([]);

  // Check if user is verified
  if (!botClient?.is_verified) {
    return <VerificationModal lang={lang} onClose={onClose} />;
  }

  // Check permissions
  useEffect(() => {
    const setupPermissions = async () => {
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        newStream.getTracks().forEach((track) => track.stop());
        setPermissionsGranted(true);
      } catch (e) {
        console.error("Permission failed:", e);
        alert("Camera and microphone access is required to use this feature.");
        setPermissionsGranted(false);
      }
    };

    setupPermissions();
  }, []);

  // Initialize camera
  const initializeCamera = useCallback(async () => {
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode },
        audio: true,
      });

      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (error) {
      console.error("Camera error:", error);
      if (
        error.name === "NotAllowedError" ||
        error.name === "PermissionDeniedError"
      ) {
        alert(
          "Camera and microphone access is required. Please grant permission in your browser settings."
        );
      } else {
        alert(
          "An error occurred while accessing the camera. Please try again."
        );
      }
    }
  }, [facingMode, stream]);

  // Load gallery media
  const loadGalleryMedia = useCallback(() => {
    const mockGallery = [
      {
        id: 1,
        type: "video",
        url: "https://www.w3schools.com/html/mov_bbb.mp4",
        thumbnail: "https://img.youtube.com/vi/YE7VzlLtp-4/hqdefault.jpg",
      },
      {
        id: 2,
        type: "image",
        url: "https://picsum.photos/400/600?random=1",
        thumbnail: "https://picsum.photos/150/200?random=1",
      },
      {
        id: 3,
        type: "video",
        url: "https://media.w3.org/2010/05/sintel/trailer_hd.mp4",
        thumbnail: "https://img.youtube.com/vi/eRsGyueVLvQ/hqdefault.jpg",
      },
      {
        id: 4,
        type: "image",
        url: "https://picsum.photos/400/600?random=2",
        thumbnail: "https://picsum.photos/150/200?random=2",
      },
    ];
    setGalleryMedia(mockGallery);
  }, []);

  // Setup camera and gallery
  useEffect(() => {
    if (permissionsGranted) {
      initializeCamera();
    }
    loadGalleryMedia();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [permissionsGranted, facingMode]);

  // Recording timer
  useEffect(() => {
    if (isRecording && !isPaused) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 60) {
            stopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }

    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [isRecording, isPaused]);

  // Start recording
  const startRecording = useCallback(() => {
    if (!stream) return;

    recordedChunksRef.current = [];
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: "video/webm;codecs=vp8,opus",
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setRecordedBlob(blob);
      setRecordedVideo(url);
      setPreviewMode(true);
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start(100);
    setIsRecording(true);
    setRecordingTime(0);
  }, [stream]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
    }
  }, [isRecording]);

  // Pause/Resume recording
  const togglePauseResume = useCallback(() => {
    if (mediaRecorderRef.current) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
      }
    }
  }, [isPaused]);

  // Take photo
  const takePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        setRecordedBlob(blob);
        setRecordedVideo(url);
        setMediaType("image");
        setPreviewMode(true);
      },
      "image/jpeg",
      0.9
    );
  }, []);

  // Switch camera
  const switchCamera = async () => {
    const newMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(newMode);
  };

  // Toggle flash
  const toggleFlash = useCallback(async () => {
    if (!stream) return;

    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack) return;

    try {
      const capabilities = videoTrack.getCapabilities();
      const isTorchSupported = capabilities.torch;

      if (isTorchSupported) {
        await videoTrack.applyConstraints({
          advanced: [{ torch: !flashMode }],
        });
        setFlashMode((prev) => !prev);
      } else {
        alert("Flash is not supported on this device or camera.");
      }
    } catch (error) {
      console.error("Flash control error:", error);
    }
  }, [stream, flashMode]);

  // Select from gallery
  const selectFromGallery = useCallback((media) => {
    setSelectedMedia(media);
    setMediaType(media.type);
    setPreviewMode(true);
    setShowGallery(false);
  }, []);

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  // Get the init data in the component
  const initData = retrieveRawInitData();
  // In your RecordStoryScreen component, update the sendStory function
  const sendStory = useCallback(async () => {
    try {
      let file;

      if (selectedMedia?._file) {
        file = selectedMedia._file;
      } else if (recordedBlob) {
        const isVideo = recordedBlob.type.startsWith("video/");
        const name = isVideo ? "story.webm" : "story.jpg";
        file = new File([recordedBlob], name, { type: recordedBlob.type });
      } else if (recordedVideo) {
        const blob = await (await fetch(recordedVideo)).blob();
        const isVideo = blob.type.startsWith("video/");
        const name = isVideo ? "story.webm" : "story.jpg";
        file = new File([blob], name, { type: blob.type });
      } else {
        alert("No media selected to send.");
        return;
      }

      // Set uploading state
      setIsUploading(true);
      setUploadProgress(0);

      // Use the external function with progress callback and init data
      const newStory = await uploadStoryWithProgress({
        file,
        placeId,
        onProgress: (progress) => setUploadProgress(progress),
        initData, // Pass the init data here
      });

      // Add the new story to the groupedStories state in parent component
      // We'll use a custom event to communicate with the parent
      const event = new CustomEvent("storyAdded", { detail: newStory });
      window.dispatchEvent(event);

      // Reset upload state
      setIsUploading(false);
      setUploadProgress(0);

      onClose();
    } catch (err) {
      console.error(err);
      setIsUploading(false);
      setUploadProgress(0);
      alert(err.message || "Failed to send story. Please try again.");
    }
  }, [selectedMedia, recordedBlob, recordedVideo, onClose, placeId, initData]);

  // Reset and retake
  const retake = useCallback(() => {
    setRecordedVideo(null);
    setSelectedMedia(null);
    setPreviewMode(false);
    setRecordingTime(0);
    setMediaType("video");
  }, []);

  // Download media
  const downloadMedia = useCallback(() => {
    if (recordedVideo) {
      const a = document.createElement("a");
      a.href = recordedVideo;
      a.download = `story_${Date.now()}.${
        mediaType === "video" ? "webm" : "jpg"
      }`;
      a.click();
    }
  }, [recordedVideo, mediaType]);

  // Handle close
  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setStream(null);
    onClose();
  };

  // Reattach stream to video element
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    if (!previewMode && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [previewMode, stream]);

  if (previewMode) {
    return (
      <PreviewScreen
        selectedMedia={selectedMedia}
        recordedVideo={recordedVideo}
        mediaType={mediaType}
        onRetake={retake}
        onSend={sendStory}
        onDownload={downloadMedia}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-gradient-to-b from-black/50 to-transparent relative z-10">
        <button
          onClick={handleClose}
          className="p-2 rounded-full bg-black/30 text-white"
        >
          <X size={24} />
        </button>

        <CameraControls
          facingMode={facingMode}
          flashMode={flashMode}
          onSwitchCamera={switchCamera}
          onToggleFlash={toggleFlash}
        />
      </div>

      {/* Recording Timer */}
      {(isRecording || recordingTime > 0) && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex items-center gap-2 bg-red-500 px-3 py-1 rounded-full">
            {isRecording && !isPaused && (
              <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            )}
            <span className="text-white text-sm font-mono">
              {formatTime(recordingTime)}
            </span>
          </div>
        </div>
      )}

      <CameraView
        videoRef={videoRef}
        canvasRef={canvasRef}
        facingMode={facingMode}
        isRecording={isRecording}
        recordingTime={recordingTime}
      />

      <GalleryView
        onSelectMedia={selectFromGallery}
        showGallery={showGallery}
      />

      <BottomControls
        showGallery={showGallery}
        mediaType={mediaType}
        isRecording={isRecording}
        isPaused={isPaused}
        onToggleGallery={() => setShowGallery(!showGallery)}
        onTakePhoto={takePhoto}
        onStartRecording={startRecording}
        onTogglePauseResume={togglePauseResume}
        onStopRecording={stopRecording}
        onChangeMediaType={() =>
          setMediaType((prev) => (prev === "video" ? "image" : "video"))
        }
      />
    </div>
  );
}
