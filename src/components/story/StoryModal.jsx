import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import ToggleLike from "../../api/toggleLike";
import { useBotClient } from "../../utils/BotClientContext";
import StoryActions from "./StoryActions";
import StoryControls from "./StoryControls";
import StoryHeader from "./StoryHeader";
import StoryMedia from "./StoryMedia";
import StoryProgress from "./StoryProgress";
export default function StoryModal({
  stories,
  bot_client,
  initialIndex = 0,
  onClose,
  onAllFinished,
  onDeleteStory,
  onUpdateStory,
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const { botClient } = useBotClient();
  const [progress, setProgress] = useState(0);
  const [muted, setMuted] = useState(true);
  const [overlayIcon, setOverlayIcon] = useState(null);

  const videoRef = useRef(null);
  const imageTimerRef = useRef(null);
  const imageStartRef = useRef(null);

  const story = stories[currentIndex];

  const [like, setLike] = useState(story.has_user_liked);

  const isImage = (() => {
    const src = story?.story || "";
    return /\.(png|jpe?g|gif|webp|avif|svg)$/i.test(src);
  })();

  // ✅ Mark as watched immediately when modal opens
  useEffect(() => {
    if (onAllFinished && stories[0]?.bot_client?.id) {
      onAllFinished(stories[0].bot_client.id);
    }
  }, []);
  useEffect(() => {
    setLike(story.has_user_liked);
  }, [currentIndex]);
  // Reset progress when story changes
  useEffect(() => {
    setProgress(0);
  }, [currentIndex]);

  // Sync progress bar with video
  useEffect(() => {
    if (!story || isImage) return;

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
        handleClose();
      }
    };

    video.addEventListener("timeupdate", updateProgress);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", updateProgress);
      video.removeEventListener("ended", handleEnded);

      // Reset video playback rate
      if (video) {
        video.playbackRate = 1.0;
      }
    };
  }, [currentIndex, stories.length, isImage, story]);

  // ⏱️ Image: 5s auto-progress + auto-advance
  useEffect(() => {
    if (!story || !isImage) return;

    // Clear any existing timer
    if (imageTimerRef.current) {
      clearInterval(imageTimerRef.current);
      imageTimerRef.current = null;
    }

    const DURATION_MS = 5000;
    imageStartRef.current = performance.now();

    imageTimerRef.current = setInterval(() => {
      const elapsed = performance.now() - imageStartRef.current;
      const pct = Math.min(100, (elapsed / DURATION_MS) * 100);
      setProgress(pct);

      if (elapsed >= DURATION_MS) {
        clearInterval(imageTimerRef.current);
        imageTimerRef.current = null;
        if (currentIndex < stories.length - 1) {
          setCurrentIndex((i) => i + 1);
        } else {
          handleClose();
        }
      }
    }, 50);

    return () => {
      if (imageTimerRef.current) {
        clearInterval(imageTimerRef.current);
        imageTimerRef.current = null;
      }
    };
  }, [currentIndex, stories.length, isImage, story]);

  // ✅ unified close
  const handleClose = () => {
    if (onAllFinished && stories[0]?.bot_client?.id) {
      onAllFinished(stories[0].bot_client.id);
    }
    onClose();
  };

  const ToggleLikeHandler = async (story_id, bot_client_id, like_id) => {
    try {
      const result = await ToggleLike({
        story_id,
        bot_client_id,
        like_id,
      });

      let newLikesCount = story.likes_count;

      if (result.id === -1) {
        // unlike
        newLikesCount = Math.max(0, newLikesCount - 1);
      } else if (like_id === -1) {
        // new like
        newLikesCount = newLikesCount + 1;
      }
      // else: toggling same like → no count change

      const updatedStory = {
        ...story,
        has_user_liked: result.id, // boolean
        like_id: result.id, // id or -1
        likes_count: newLikesCount,
      };

      // Update local state (like = id of the Like object)
      setLike(updatedStory.has_user_liked);

      if (onUpdateStory) {
        onUpdateStory(updatedStory);
      }
    } catch (error) {
      // revert locally
      setLike((prev) => (prev === -1 ? like_id : -1));
    }
  };

  // Hold left/right
  const handlePress = (side) => {
    const video = videoRef.current;
    if (!video || isImage) return;

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
    if (!video || isImage) return;

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
        <StoryHeader
          bot_client={bot_client}
          story={story}
          isImage={isImage}
          muted={muted}
          setMuted={setMuted}
          onClose={handleClose}
        />

        <StoryMedia
          story={story}
          isImage={isImage}
          videoRef={videoRef}
          muted={muted}
        />

        <StoryControls
          isImage={isImage}
          overlayIcon={overlayIcon}
          handlePress={handlePress}
          handleRelease={handleRelease}
          handleTap={handleTap}
        />

        <StoryActions
          story={story}
          like={like}
          toggleLike={ToggleLikeHandler}
          onDelete={onDeleteStory}
          onClose={handleClose}
        />

        <StoryProgress
          stories={stories}
          currentIndex={currentIndex}
          progress={progress}
        />
      </motion.div>
    </div>
  );
}
