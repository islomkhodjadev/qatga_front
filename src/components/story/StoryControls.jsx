import { motion } from "framer-motion";
import { FaForward, FaPause } from "react-icons/fa";

export default function StoryControls({
  isImage,
  overlayIcon,
  handlePress,
  handleRelease,
  handleTap,
}) {
  return (
    <>
      {/* Left zone */}
      <div
        className="absolute left-0 top-0 h-full w-1/2 z-40"
        onMouseDown={() => handlePress("left")}
        onMouseUp={handleRelease}
        onMouseLeave={handleRelease}
        onTouchStart={() => handlePress("left")}
        onTouchEnd={handleRelease}
        onClick={() => handleTap("left")}
      />

      {/* Right zone */}
      <div
        className="absolute right-0 top-0 h-full w-1/2 z-40"
        onMouseDown={() => handlePress("right")}
        onMouseUp={handleRelease}
        onMouseLeave={handleRelease}
        onTouchStart={() => handlePress("right")}
        onTouchEnd={handleRelease}
        onClick={() => handleTap("right")}
      />

      {/* Overlay icons (video only) */}
      {!isImage && overlayIcon === "pause" && (
        <div className="absolute text-white text-6xl opacity-80">
          <FaPause />
        </div>
      )}
      {!isImage && overlayIcon === "ff" && (
        <motion.div
          className="absolute text-white text-6xl opacity-80"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ repeat: Infinity, duration: 0.6 }}
        >
          <FaForward />
        </motion.div>
      )}
    </>
  );
}
