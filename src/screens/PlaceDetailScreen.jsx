import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import getStories from "../api/getStories";
import PlaceAmenities from "../components/place/PlaceAmenities";
import PlaceFacts from "../components/place/PlaceFacts";
import PlaceGallery from "../components/place/PlaceGallery";
import PlaceHeader from "../components/place/PlaceHeader";
import PlaceServices from "../components/place/PlaceServices";
import PlaceStories from "../components/place/PlaceStories";
import { useLang } from "../utils/language";

export default function PlaceScreen() {
  const { lang } = useLang();
  const location = useLocation();
  const { placeObject: place } = location.state || {};
  const [groupedStories, setGroupedStories] = useState([]);
  const [activeStory, setActiveStory] = useState(null);
  const [openRecorder, setOpenRecorder] = useState(false);
  const [watchedClients, setWatchedClients] = useState([]);

  useEffect(() => {
    async function fetchStories() {
      if (!place?.id) return;

      const data = await getStories(`place=${place.id}`);

      // group stories by bot_client.id
      const grouped = data.reduce((acc, story) => {
        const clientId = story.bot_client.id;
        if (!acc[clientId]) {
          acc[clientId] = {
            bot_client: story.bot_client,
            stories: [],
          };
        }
        acc[clientId].stories.push(story);
        return acc;
      }, {});

      setGroupedStories(Object.values(grouped));
    }

    fetchStories();
  }, [place]);

  // Add event listener for new stories
  useEffect(() => {
    const handleNewStory = (event) => {
      const newStory = event.detail;

      setGroupedStories((prevGroupedStories) => {
        // Create a deep copy of the groupedStories array
        const updatedGroupedStories = [...prevGroupedStories];

        // Find if the client already exists in the grouped stories
        const clientId = newStory.bot_client.id;
        const clientIndex = updatedGroupedStories.findIndex(
          (group) => group.bot_client.id === clientId
        );

        if (clientIndex !== -1) {
          // Client exists, add the new story to their stories array
          updatedGroupedStories[clientIndex] = {
            ...updatedGroupedStories[clientIndex],
            stories: [newStory, ...updatedGroupedStories[clientIndex].stories],
          };
        } else {
          // Client doesn't exist, create a new group
          updatedGroupedStories.unshift({
            bot_client: newStory.bot_client,
            stories: [newStory],
          });
        }

        return updatedGroupedStories;
      });
    };

    window.addEventListener("storyAdded", handleNewStory);

    return () => {
      window.removeEventListener("storyAdded", handleNewStory);
    };
  }, []);

  // Function to delete a story locally by ID
  const handleDeleteStory = (storyId) => {
    setGroupedStories((prevGroupedStories) => {
      // Create a deep copy of the groupedStories array
      const updatedGroupedStories = prevGroupedStories.map((group) => ({
        ...group,
        stories: [...group.stories],
      }));

      // Find and remove the story with the matching ID
      for (let i = 0; i < updatedGroupedStories.length; i++) {
        const group = updatedGroupedStories[i];
        const storyIndex = group.stories.findIndex(
          (story) => story.id === storyId
        );

        if (storyIndex !== -1) {
          // Remove the story from this group
          group.stories.splice(storyIndex, 1);

          // If this group now has no stories, remove the entire group
          if (group.stories.length === 0) {
            updatedGroupedStories.splice(i, 1);
          }

          break;
        }
      }

      return updatedGroupedStories;
    });

    // If the active story was deleted, clear it
    if (
      activeStory &&
      activeStory.stories.some((story) => story.id === storyId)
    ) {
      setActiveStory(null);
    }
  };

  if (!place) {
    return (
      <div className="p-4 text-center text-slate-600">
        <p>
          No place data passed. Provide a <code>placeObject</code> in
          location.state.
        </p>
      </div>
    );
  }

  const name = place.name;

  return (
    <div className="screen max-w-6xl p-4 sm:p-6">
      {/* Stories Section */}
      <PlaceStories
        groupedStories={groupedStories}
        watchedClients={watchedClients}
        activeStory={activeStory}
        setActiveStory={setActiveStory}
        openRecorder={openRecorder}
        setOpenRecorder={setOpenRecorder}
        place={place}
        setWatchedClients={setWatchedClients}
        onDeleteStory={handleDeleteStory}
        setGroupedStories={setGroupedStories}
      />
      {/* Header */}
      <PlaceHeader place={place} lang={lang} />
      {/* Media + Facts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PlaceGallery images={place.images} name={name} lang={lang} />
        <PlaceFacts place={place} lang={lang} />
      </div>
      {/* Services */}
      <PlaceServices services={place.services} lang={lang} />
      {/* Amenities */}
      <PlaceAmenities amenities={place.amenities} lang={lang} />
    </div>
  );
}
