import {
  Camera,
  Download,
  Image,
  Pause,
  Play,
  RotateCcw,
  Square,
  Timer,
  Trash2,
  X,
  Zap,
  ZapOff,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import postStory from "../../api/postStory";
export default function RecordStoryScreen({ onClose, placeId }) {
  // State management
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaType, setMediaType] = useState("video"); // 'video' or 'image'
  const [facingMode, setFacingMode] = useState("user"); // 'user' or 'environment'
  const [flashMode, setFlashMode] = useState(false);
  const [galleryMedia, setGalleryMedia] = useState([]);
  const [showGallery, setShowGallery] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [stream, setStream] = useState(null);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);

  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const checkPermissions = async () => {
    try {
      const perms = await navigator.permissions.query({ name: "camera" });
      if (perms.state === "granted") {
        setPermissionsGranted(true);
      } else if (perms.state === "denied") {
        // Permission is denied, no need to ask again.
        alert(
          "Camera permission is denied. Please allow it in your browser settings."
        );
      } else {
        // Permission is prompt, proceed to request it.
        try {
          const newStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          newStream.getTracks().forEach((track) => track.stop()); // Stop immediately after getting permission
          setPermissionsGranted(true);
        } catch (e) {
          console.error("Permission request failed:", e);
          alert(
            "Camera and microphone access is required to use this feature."
          );
        }
      }
    } catch (e) {
      console.warn("Permission check failed:", e);
    }
  };
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
  // Load gallery media (simulated - in real app, use file input or Telegram API)
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

  useEffect(() => {
    const setupPermissions = async () => {
      try {
        // Calling getUserMedia() here will trigger the browser's permission dialog.
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        // Immediately stop the tracks after getting permission to avoid using resources.
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
  useEffect(() => {
    if (permissionsGranted) {
      initializeCamera();
    }

    loadGalleryMedia(); // 👈 seeds gallery when component mounts

    // This cleanup function is crucial to stop the stream and avoid multiple stream issues.
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
            // 60 second limit like Instagram
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
      setRecordedBlob(blob); // <-- keep the Blob for upload
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
        setRecordedBlob(blob); // <-- keep the Blob for upload
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

  // Send story

  const sendStory = useCallback(async () => {
    try {
      let file;

      if (selectedMedia?._file) {
        // Picked from device gallery (file input)
        file = selectedMedia._file;
      } else if (recordedBlob) {
        // From camera (recorded video or captured photo)
        const isVideo = recordedBlob.type.startsWith("video/");
        const name = isVideo ? "story.webm" : "story.jpg";
        file = new File([recordedBlob], name, { type: recordedBlob.type });
      } else if (recordedVideo) {
        // Fallback: convert the object URL to a Blob
        const blob = await (await fetch(recordedVideo)).blob();
        const isVideo = blob.type.startsWith("video/");
        const name = isVideo ? "story.webm" : "story.jpg";
        file = new File([blob], name, { type: blob.type });
      } else {
        alert("No media selected to send.");
        return;
      }

      await postStory({ file, placeId }); // placeId optional if your API allows

      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to send story. Please try again.");
    }
  }, [selectedMedia, recordedBlob, recordedVideo, onClose]);

  // Reset and retake
  const retake = useCallback(() => {
    setRecordedVideo(null);
    setSelectedMedia(null);
    setPreviewMode(false);
    setRecordingTime(0);
    setMediaType("video");
  }, []);
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Reattach stream to video element after leaving preview mode
  useEffect(() => {
    if (!previewMode && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [previewMode, stream]);
  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setStream(null);
    onClose(); // Prop callback to close modal or screen
  };
  if (previewMode) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        {/* Preview Header */}
        <div className="flex justify-between items-center p-4 bg-gradient-to-b from-black/50 to-transparent">
          <button
            onClick={retake}
            className="p-2 rounded-full bg-black/30 text-white"
          >
            <X size={24} />
          </button>
          <div className="text-white text-sm font-medium">Story Preview</div>
          <button
            onClick={sendStory}
            className="px-4 py-2 bg-blue-500 rounded-full text-white font-medium"
          >
            Send
          </button>
        </div>

        {/* Preview Content */}
        <div className="flex-1 flex items-center justify-center bg-black">
          {selectedMedia ? (
            selectedMedia.type === "video" ? (
              <video
                src={selectedMedia.url}
                className="max-w-full max-h-full object-contain"
                controls
                autoPlay
                loop
                muted
              />
            ) : (
              <img
                src={selectedMedia.url}
                alt="Selected"
                className="max-w-full max-h-full object-contain"
              />
            )
          ) : recordedVideo ? (
            mediaType === "video" ? (
              <video
                src={recordedVideo}
                className="max-w-full max-h-full object-contain"
                controls
                autoPlay
                loop
                muted
              />
            ) : (
              <img
                src={recordedVideo}
                alt="Recorded"
                className="max-w-full max-h-full object-contain"
              />
            )
          ) : null}
        </div>

        {/* Preview Actions */}
        <div className="p-4 bg-gradient-to-t from-black/50 to-transparent">
          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                if (recordedVideo) {
                  const a = document.createElement("a");
                  a.href = recordedVideo;
                  a.download = `story_${Date.now()}.${
                    mediaType === "video" ? "webm" : "jpg"
                  }`;
                  a.click();
                }
              }}
              className="p-3 rounded-full bg-black/30 text-white"
            >
              <Download size={20} />
            </button>
            <button
              onClick={retake}
              className="p-3 rounded-full bg-black/30 text-white"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      </div>
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

        <div className="flex items-center gap-2">
          {facingMode == "environment" ? (
            <button
              onClick={toggleFlash}
              className="p-2 rounded-full bg-black/30 text-white"
            >
              {flashMode ? <Zap size={20} /> : <ZapOff size={20} />}
            </button>
          ) : null}
          <button
            onClick={switchCamera}
            className="p-2 rounded-full bg-black/30 text-white"
          >
            <RotateCcw size={20} />
          </button>
        </div>
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

      {/* Camera View */}
      <div className="flex-1 relative overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${
            facingMode === "user" ? "scale-x-[-1]" : ""
          }`}
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Progress bar for recording */}
        {isRecording && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
            <div
              className="h-full bg-red-500 transition-all duration-1000"
              style={{ width: `${(recordingTime / 60) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Gallery Preview */}
      {showGallery && (
        <div className="absolute bottom-32 left-0 right-0 h-32 bg-black/80 backdrop-blur">
          <div className="flex gap-2 p-4 overflow-x-auto">
            {galleryMedia.map((media) => (
              <button
                key={media.id}
                onClick={() => selectFromGallery(media)}
                className="relative flex-shrink-0 w-20 h-24 rounded-lg overflow-hidden border-2 border-white/20"
              >
                <img
                  src={media.thumbnail}
                  alt="Gallery item"
                  className="w-full h-full object-cover"
                />
                {media.type === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play size={16} className="text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="p-6 bg-gradient-to-t from-black/50 to-transparent">
        <div className="flex items-center justify-between">
          {/* Gallery Button */}
          <button
            onClick={() => setShowGallery(!showGallery)}
            className={`p-3 rounded-full transition-colors ${
              showGallery ? "bg-white text-black" : "bg-black/30 text-white"
            }`}
          >
            <Image size={24} />
          </button>

          {/* Main Action Button */}
          <div className="relative">
            {!isRecording ? (
              <div className="flex items-center gap-4">
                {/* Photo Button */}
                <button
                  onClick={takePhoto}
                  className="w-12 h-12 rounded-full bg-white/20 border-2 border-white flex items-center justify-center"
                >
                  <Camera size={20} className="text-white" />
                </button>

                {/* Record Button */}
                <button
                  onClick={startRecording}
                  className="w-20 h-20 rounded-full bg-white/20 border-4 border-white flex items-center justify-center relative"
                >
                  <div className="w-6 h-6 bg-red-500 rounded-full"></div>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                {/* Pause/Resume Button */}
                <button
                  onClick={togglePauseResume}
                  className="w-12 h-12 rounded-full bg-white/20 border-2 border-white flex items-center justify-center"
                >
                  {isPaused ? (
                    <Play size={20} className="text-white ml-1" />
                  ) : (
                    <Pause size={20} className="text-white" />
                  )}
                </button>

                {/* Stop Button */}
                <button
                  onClick={stopRecording}
                  className="w-20 h-20 rounded-full bg-white/20 border-4 border-white flex items-center justify-center"
                >
                  <Square size={24} className="text-white" fill="white" />
                </button>
              </div>
            )}
          </div>

          {/* Mode Toggle */}
          <button
            onClick={() =>
              setMediaType((prev) => (prev === "video" ? "image" : "video"))
            }
            className="p-3 rounded-full bg-black/30 text-white"
          >
            {mediaType === "video" ? <Camera size={24} /> : <Timer size={24} />}
          </button>
        </div>

        {/* Mode Indicator */}
        <div className="flex justify-center mt-4">
          <div className="flex bg-black/30 rounded-full p-1">
            <button
              onClick={() => setMediaType("image")}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                mediaType === "image" ? "bg-white text-black" : "text-white"
              }`}
            >
              Photo
            </button>
            <button
              onClick={() => setMediaType("video")}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                mediaType === "video" ? "bg-white text-black" : "text-white"
              }`}
            >
              Video
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
