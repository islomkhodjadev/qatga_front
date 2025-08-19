import "react";

import { useEffect, useState } from "react";
import { getCategory } from "../api/getCategory";
import CategoryCard from "../components/category/CategoryCard";
import { pickLangField } from "../utils/i18nField";
import { useLang } from "../utils/language";

function CategoryScreen() {
  const { lang, setLang } = useLang();

  const [cats, setCats] = useState([]);
  useEffect(() => {
    async function fetchCategory() {
      const categoryList = await getCategory();
      setCats(categoryList);
    }
    fetchCategory();
  }, []);

  return (
    <div className="screen grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4  p-4 content-start scroll-bounce">
      {cats.length > 0 ? (
        cats.map((cat) => (
          <CategoryCard
            imageUrl={cat.icon}
            categoryName={pickLangField(cat, "name", lang, ["ru", "uz"])}
            key={cat.id}
            id={cat.id}
            categoryObject={cat}
          />
        ))
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default CategoryScreen;
