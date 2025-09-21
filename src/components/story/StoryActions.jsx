import { FcLike, FcLikePlaceholder } from "react-icons/fc";
import { MdDelete } from "react-icons/md";
import { PiShareFatFill } from "react-icons/pi";
import DeleteStory from "../../api/deleteStory";
import { useBotClient } from "../../utils/BotClientContext";

export default function StoryActions({
  story,
  like,
  toggleLike,
  onDelete,
  onClose,
  userLikeId,
}) {
  const { botClient } = useBotClient();

  const handleDelete = async (event) => {
    event.stopPropagation(); // Prevent triggering parent click events
    try {
      const result = await DeleteStory(story.id);
      if (result.success) {
        onDelete(story.id); // Notify parent to remove the story
        if (onClose) {
          onClose(); // Close the modal if provided
        }
      } else {
        console.error("Failed to delete story:", result.error);
        alert("Failed to delete story. Please try again.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("An error occurred while deleting the story.");
    }
  };

  return (
    <div className="absolute right-0 flex bottom-10 gap-4 px-2 flex-col items-center text-white z-50">
      {like != -1 ? (
        <FcLike
          size={34}
          onClick={async () => {
            await toggleLike(story.id, botClient.id, like);
          }}
          className="cursor-pointer"
        />
      ) : (
        <FcLikePlaceholder
          size={34}
          onClick={async () => {
            await toggleLike(story.id, botClient.id, like);
          }}
          className="cursor-pointer"
        />
      )}
      <span>{story.likes_count}</span>
      <PiShareFatFill size={32} className="cursor-pointer" />
      {story.bot_client.chat_id == botClient.chat_id ? (
        <MdDelete size={32} className="cursor-pointer" onClick={handleDelete} />
      ) : null}
    </div>
  );
}
