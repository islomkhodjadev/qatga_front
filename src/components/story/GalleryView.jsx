import { Plus } from "lucide-react";
import { useRef } from "react";

export default function GalleryView({ onSelectMedia, showGallery }) {
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const fileType = file.type.startsWith("video/") ? "video" : "image";
    const objectUrl = URL.createObjectURL(file);

    onSelectMedia({
      type: fileType,
      url: objectUrl,
      file: file, // Store the actual file for upload
      _file: file, // Keep reference to original file
    });
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (!showGallery) return null;

  return (
    <div className="absolute bottom-32 left-0 right-0 h-32 bg-black/80 backdrop-blur">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="flex gap-2 p-4 overflow-x-auto">
        {/* Add from gallery button */}
        <button
          onClick={triggerFileInput}
          className="relative flex-shrink-0 w-20 h-24 rounded-lg overflow-hidden border-2 border-dashed border-white/40 flex items-center justify-center bg-black/30"
        >
          <Plus size={24} className="text-white" />
        </button>

        {/* You could also show recently taken media here if you want to cache them */}
        {/* For now, we'll just show the add button since we're accessing the device gallery directly */}
      </div>
    </div>
  );
}
