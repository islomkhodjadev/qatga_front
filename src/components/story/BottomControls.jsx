import { Camera, Image, Pause, Play, Square, Timer } from "lucide-react";

export default function BottomControls({
  showGallery,
  mediaType,
  isRecording,
  isPaused,
  onToggleGallery,
  onTakePhoto,
  onStartRecording,
  onTogglePauseResume,
  onStopRecording,
  onChangeMediaType,
}) {
  return (
    <div className="p-6 bg-gradient-to-t from-black/50 to-transparent">
      <div className="flex items-center justify-between">
        {/* Gallery Button */}
        <button
          onClick={onToggleGallery}
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
                onClick={onTakePhoto}
                className="w-12 h-12 rounded-full bg-white/20 border-2 border-white flex items-center justify-center"
              >
                <Camera size={20} className="text-white" />
              </button>

              {/* Record Button */}
              <button
                onClick={onStartRecording}
                className="w-20 h-20 rounded-full bg-white/20 border-4 border-white flex items-center justify-center relative"
              >
                <div className="w-6 h-6 bg-red-500 rounded-full"></div>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              {/* Pause/Resume Button */}
              <button
                onClick={onTogglePauseResume}
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
                onClick={onStopRecording}
                className="w-20 h-20 rounded-full bg-white/20 border-4 border-white flex items-center justify-center"
              >
                <Square size={24} className="text-white" fill="white" />
              </button>
            </div>
          )}
        </div>

        {/* Mode Toggle */}
        <button
          onClick={onChangeMediaType}
          className="p-3 rounded-full bg-black/30 text-white"
        >
          {mediaType === "video" ? <Camera size={24} /> : <Timer size={24} />}
        </button>
      </div>

      {/* Mode Indicator */}
      <div className="flex justify-center mt-4">
        <div className="flex bg-black/30 rounded-full p-1">
          <button
            onClick={() => onChangeMediaType("image")}
            className={`px-4 py-2 rounded-full text-sm transition-colors ${
              mediaType === "image" ? "bg-white text-black" : "text-white"
            }`}
          >
            Photo
          </button>
          <button
            onClick={() => onChangeMediaType("video")}
            className={`px-4 py-2 rounded-full text-sm transition-colors ${
              mediaType === "video" ? "bg-white text-black" : "text-white"
            }`}
          >
            Video
          </button>
        </div>
      </div>
    </div>
  );
}
