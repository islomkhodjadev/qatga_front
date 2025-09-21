import { format } from "date-fns";
import { IoClose, IoVolumeHigh, IoVolumeMute } from "react-icons/io5";

export default function StoryHeader({
  bot_client,
  story,
  isImage,
  muted,
  setMuted,
  onClose,
}) {
  return (
    <div className="absolute top-5 left-0 w-full px-4 z-50">
      <div className="flex items-center justify-between bg-black/50 rounded-xl px-3 py-2 backdrop-blur-sm">
        {/* Left side: mute + user */}
        <div className="flex items-center gap-3">
          {/* Hide mute toggle when image */}
          {!isImage && (
            <button
              onClick={() => setMuted((m) => !m)}
              className="text-white text-2xl"
            >
              {muted ? <IoVolumeMute /> : <IoVolumeHigh />}
            </button>
          )}

          {bot_client.profile_picture ? (
            <img
              src={bot_client.profile_picture}
              alt="Profile"
              className="h-9 w-9 rounded-full border border-white/40 object-cover"
            />
          ) : (
            <div className="w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-200 to-indigo-300 text-white  font-bold shadow">
              {bot_client.first_name?.charAt(0)}
              {bot_client.last_name?.charAt(0)}
            </div>
          )}
          {/* Username + time */}
          <div className="flex flex-col leading-tight">
            <span className="text-white font-medium">
              {bot_client.username}
            </span>
            <span className="text-gray-300 text-xs">
              {story.created_at
                ? format(new Date(story.created_at), "MMM d, yyyy • HH:mm")
                : ""}
            </span>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="text-white text-3xl hover:text-red-400 transition"
        >
          <IoClose />
        </button>
      </div>
    </div>
  );
}
