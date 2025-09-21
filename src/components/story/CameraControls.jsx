import { RotateCcw, Zap, ZapOff } from "lucide-react";

export default function CameraControls({
  facingMode,
  flashMode,
  onSwitchCamera,
  onToggleFlash,
}) {
  return (
    <div className="flex items-center gap-2">
      {facingMode === "environment" && (
        <button
          onClick={onToggleFlash}
          className="p-2 rounded-full bg-black/30 text-white"
        >
          {flashMode ? <Zap size={20} /> : <ZapOff size={20} />}
        </button>
      )}
      <button
        onClick={onSwitchCamera}
        className="p-2 rounded-full bg-black/30 text-white"
      >
        <RotateCcw size={20} />
      </button>
    </div>
  );
}
