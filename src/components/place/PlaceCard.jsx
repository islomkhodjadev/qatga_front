import { motion } from "motion/react";
import "react";
import { Link } from "react-router-dom";
export default function PlaceCard({
  placeImage,
  placeName,
  placeLocation,
  PlaceTags = [],
  PlaceId,
  viewport,
  indx,
  placeObject,
}) {
  return (
    <Link to={`/place-detail/`} state={{ placeObject: placeObject }}>
      <motion.div
        initial={{ x: indx % 2 ? 80 : -80, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.2, root: viewport?.current }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="rounded-2xl overflow-hidden
      shadow-[0_0_5px_rgba(59,130,246,0.6)] bg-white m-2 flex-none"
      >
        <img
          src={placeImage}
          alt=""
          className="w-full aspect-[4/3] object-cover"
        />
        <div className="p-2">
          <h4 className="text-[#3B82F6]">{placeName}</h4>
          <p>&#128640; {placeLocation}</p>
          <div>
            {PlaceTags.length > 0 &&
              PlaceTags.map((tag) => (
                <div
                  key={tag}
                  className="border-2 p-1 inline-block m-1 rounded-xl"
                >
                  {tag}
                </div>
              ))}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
