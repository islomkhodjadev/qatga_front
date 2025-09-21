import RecordStoryScreen from "../story/RecordStoryScreen";
import StoryModal from "../story/StoryModal";

// Helper function to get initials
function getInitials(firstName, lastName, username) {
  if (firstName && lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }
  if (firstName) {
    return firstName.charAt(0).toUpperCase();
  }
  if (lastName) {
    return lastName.charAt(0).toUpperCase();
  }
  if (username) {
    return username.charAt(0).toUpperCase();
  }
  return "U"; // Default fallback
}

export default function PlaceStories({
  groupedStories,
  watchedClients,
  activeStory,
  setActiveStory,
  openRecorder,
  setOpenRecorder,
  place,
  setWatchedClients,
  onDeleteStory,
  setGroupedStories,
}) {
  return (
    <div className="flex gap-4 overflow-x-auto py-2 pl-0.5 ">
      {/* Add Story Button */}
      <div className="flex flex-col items-center">
        <div
          className="w-[65px] h-[65px] flex items-center justify-center cursor-pointer mb-1"
          onClick={() => setOpenRecorder(true)}
        >
          <div className="inset-0 rounded-full p-[3px] bg-gradient-to-tr from-green-500 via-blue-500 to-green-500">
            <div className="w-[60px] h-[60px] rounded-full flex justify-center items-center text-4xl bg-white">
              +
            </div>
          </div>
        </div>
        <div className="text-xs text-center text-slate-600 max-w-[65px] truncate">
          Your story
        </div>
      </div>

      {/* Story Recorder Modal */}
      {openRecorder && (
        <RecordStoryScreen
          onClose={() => setOpenRecorder(false)}
          placeId={place.id}
        />
      )}

      {/* User Stories */}
      {groupedStories.length > 0
        ? groupedStories.map((group) => {
            const isWatched = watchedClients.includes(group.bot_client.id);
            return (
              <div
                key={group.bot_client.id}
                className="flex flex-col items-center"
                onClick={() => setActiveStory(group)}
              >
                {/* Story circle container */}
                <div className="relative w-[65px] h-[65px] flex items-center justify-center mb-1">
                  {/* Animated border */}
                  <div
                    className={`absolute inset-0 rounded-full 
                      ${
                        isWatched
                          ? "bg-gray-400"
                          : "bg-gradient-to-tr from-green-500 via-blue-500 to-green-500 animate-spin [animation-duration:3s]"
                      }`}
                  >
                    <div className="w-full h-full rounded-full bg-transparent"></div>
                  </div>

                  {/* Profile picture or initials */}
                  <div
                    style={{
                      backgroundImage: group.bot_client.profile_picture
                        ? `url(${group.bot_client.profile_picture})`
                        : "none",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                    className="w-[60px] h-[60px] rounded-full z-5 flex items-center justify-center bg-slate-200"
                  >
                    {!group.bot_client.profile_picture && (
                      <span className="text-lg font-semibold text-slate-600">
                        {getInitials(
                          group.bot_client.first_name,
                          group.bot_client.last_name,
                          group.bot_client.username
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {/* Username */}
                <div className="text-xs text-center text-slate-600 max-w-[65px] truncate">
                  {group.bot_client.username ||
                    group.bot_client.first_name ||
                    "User"}
                </div>
              </div>
            );
          })
        : null}

      {/* Story Viewer Modal */}
      {activeStory && (
        <StoryModal
          stories={activeStory.stories}
          bot_client={activeStory.bot_client}
          onClose={() => setActiveStory(null)}
          onAllFinished={(clientId) =>
            setWatchedClients((prev) => [...prev, clientId])
          }
          onDeleteStory={onDeleteStory}
          onUpdateStory={(updatedStory) => {
            // update groupedStories in parent
            setGroupedStories((prev) =>
              prev.map((group) =>
                group.bot_client.id === updatedStory.bot_client.id
                  ? {
                      ...group,
                      stories: group.stories.map((s) =>
                        s.id === updatedStory.id ? updatedStory : s
                      ),
                    }
                  : group
              )
            );
          }}
        />
      )}
    </div>
  );
}
