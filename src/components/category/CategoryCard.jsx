import "react";
import { Link } from "react-router-dom";
function CategoryCard({ imageUrl, categoryName, id, categoryObject }) {
  return (
    <Link to={`/category/${id}`} state={{ categoryObject: categoryObject }}>
      <div
        className="category-card shadow-[0_0_5px_rgba(59,130,246,0.6)]"
        style={{ backgroundImage: `url(${imageUrl})` }}
      >
        <p className="text-white font-bold break-words text-xl">
          {categoryName}
        </p>
      </div>
    </Link>
  );
}
export default CategoryCard;
