export default function StoryProgress({ stories, currentIndex, progress }) {
  return (
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
  );
}
