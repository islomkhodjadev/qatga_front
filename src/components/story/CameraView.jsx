export default function CameraView({
  videoRef,
  canvasRef,
  facingMode,
  isRecording,
  recordingTime,
}) {
  return (
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
  );
}
