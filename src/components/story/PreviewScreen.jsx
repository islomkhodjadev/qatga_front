import { Download, Trash2, X } from "lucide-react";

export default function PreviewScreen({
  selectedMedia,
  recordedVideo,
  mediaType,
  onRetake,
  onSend,
  onDownload,
  isUploading, // Add this prop
  uploadProgress, // Add this prop
}) {
  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Preview Header */}
      <div className="flex justify-between items-center p-4 bg-gradient-to-b from-black/50 to-transparent">
        <button
          onClick={onRetake}
          className="p-2 rounded-full bg-black/30 text-white"
        >
          <X size={24} />
        </button>
        <div className="text-white text-sm font-medium">Story Preview</div>
        <button
          onClick={onSend}
          className="px-4 py-2 bg-blue-500 rounded-full text-white font-medium"
          disabled={isUploading} // Disable button during upload
        >
          {isUploading ? "Uploading..." : "Send"}
        </button>
      </div>

      {/* Upload Progress Overlay */}
      {isUploading && (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-50">
          <div className="w-64 bg-gray-800 rounded-lg p-4">
            <h3 className="text-white text-center mb-3">Uploading Story</h3>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-white text-center mt-2 text-sm">
              {uploadProgress}% Complete
            </p>
          </div>
        </div>
      )}

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
            onClick={onDownload}
            className="p-3 rounded-full bg-black/30 text-white"
            disabled={isUploading} // Disable during upload
          >
            <Download size={20} />
          </button>
          <button
            onClick={onRetake}
            className="p-3 rounded-full bg-black/30 text-white"
            disabled={isUploading} // Disable during upload
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
