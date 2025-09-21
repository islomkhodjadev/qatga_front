export default function StoryMedia({ story, isImage, videoRef, muted }) {
  return (
    <>
      {!isImage ? (
        <video
          ref={videoRef}
          src={story.story}
          className="h-full max-h-screen object-contain"
          autoPlay
          muted={muted}
          playsInline
        />
      ) : (
        <img
          src={story.story}
          alt=""
          className="h-full max-h-screen object-contain select-none"
          draggable={false}
        />
      )}
    </>
  );
}
