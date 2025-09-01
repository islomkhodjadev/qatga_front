import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { FaForward, FaPause } from "react-icons/fa";
import { FcLike, FcLikePlaceholder } from "react-icons/fc";
import { IoClose, IoVolumeHigh, IoVolumeMute } from "react-icons/io5";
import { PiShareFatFill } from "react-icons/pi";

export default function StoryModal({
  stories,
  bot_client,
  initialIndex = 0,
  onClose,
  onAllFinished, // ✅ added
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [like, setLike] = useState(false);
  const [progress, setProgress] = useState(0);
  const [muted, setMuted] = useState(true);
  const [overlayIcon, setOverlayIcon] = useState(null);

  const videoRef = useRef(null);

  // ✅ Mark as watched immediately when modal opens
  useEffect(() => {
    if (onAllFinished && stories[0]?.bot_client?.id) {
      onAllFinished(stories[0].bot_client.id);
    }
  }, []); // runs once on mount

  // Reset progress when story changes
  useEffect(() => {
    setProgress(0);
  }, [currentIndex]);

  // Sync progress bar with video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    const handleEnded = () => {
      if (currentIndex < stories.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        handleClose(); // ✅ close after last story
      }
    };

    video.addEventListener("timeupdate", updateProgress);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", updateProgress);
      video.removeEventListener("ended", handleEnded);
    };
  }, [currentIndex, stories.length]);

  // ✅ unified close
  const handleClose = () => {
    if (onAllFinished && stories[0]?.bot_client?.id) {
      onAllFinished(stories[0].bot_client.id);
    }
    onClose();
  };

  // Hold left/right
  const handlePress = (side) => {
    const video = videoRef.current;
    if (!video) return;

    if (side === "left") {
      video.pause();
      setOverlayIcon("pause");
    } else if (side === "right") {
      video.playbackRate = 2.0;
      setOverlayIcon("ff");
    }
  };

  const handleRelease = () => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = 1.0;
    setOverlayIcon(null);
    if (video.paused) video.play();
  };

  // Tap left/right to move between stories
  const handleTap = (side) => {
    if (side === "left" && currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    } else if (side === "right") {
      if (currentIndex < stories.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        handleClose();
      }
    }
  };

  const story = stories[currentIndex];

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <motion.div
        className="relative w-full h-full flex items-center justify-center"
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        onDragEnd={(event, info) => {
          if (info.offset.y > 150) handleClose();
        }}
      >
        {/* Close button */}

        {/* Sound toggle */}
        <div className=" flex gap-1 w-full absolute top-5 bg-[#00000075] rounded px-2 justify-between items-center z-50">
          <div className="flex justify-center items-center gap-1">
            <button
              onClick={() => setMuted((m) => !m)}
              className=" text-white text-2xl z-50"
            >
              {muted ? <IoVolumeMute /> : <IoVolumeHigh />}
            </button>

            <img
              src={`${bot_client.profile_picture}`}
              alt=""
              className=" h-[30px] rounded-[50%]"
            />
            <span className="text-white">{bot_client.username}</span>
          </div>
          <button
            onClick={handleClose}
            className=" relative text-white text-3xl z-50"
          >
            <IoClose />
          </button>
        </div>

        {/* Video */}
        <video
          ref={videoRef}
          src={story.story}
          className="h-full max-h-screen object-contain"
          autoPlay
          muted={muted}
          playsInline
        />

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

        {/* Overlay icons */}
        {overlayIcon === "pause" && (
          <div className="absolute text-white text-6xl opacity-80">
            <FaPause />
          </div>
        )}
        {overlayIcon === "ff" && (
          <motion.div
            className="absolute text-white text-6xl opacity-80"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ repeat: Infinity, duration: 0.6 }}
          >
            <FaForward />
          </motion.div>
        )}

        {/* Like / Share */}

        <div className="absolute right-0 flex  bottom-10 gap-4 px-2 flex-col items-center text-white z-50">
          {like ? (
            <FcLike
              size={34}
              onClick={() => setLike(false)}
              className="cursor-pointer"
            />
          ) : (
            <FcLikePlaceholder
              size={34}
              onClick={() => setLike(true)}
              className="cursor-pointer"
            />
          )}
          <PiShareFatFill size={32} className="cursor-pointer" />
        </div>

        {/* Progress bars */}
        <div className="absolute top-0 left-0 w-full flex gap-1 px-2 pt-2">
          {stories.map((_, i) => (
            <div key={i} className="flex-1 h-1 bg-white/20">
              {i < currentIndex && <div className="h-full bg-white w-full" />}
              {i === currentIndex && (
                <div
                  className="h-full bg-white transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
