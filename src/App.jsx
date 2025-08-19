import "aos/dist/aos.css";
import "react";
import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import NavBar from "./components/navbar/NavBar";
import CategoryScreen from "./screens/CategoryScreen";
import PlaceDetailScreen from "./screens/PlaceDetailScreen";
import PlacesListScreen from "./screens/PlacesListScreen";
function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="bg-white w-full h-full flex flex-col text-slate-800">
      <NavBar />
      <Routes>
        <Route path="/" element={<CategoryScreen />} />
        <Route path="/category/:categoryId" element={<PlacesListScreen />} />
        <Route path="/place-detail/" element={<PlaceDetailScreen />} />
      </Routes>
      {/* <CategoryScreen /> */}
    </div>
  );
}

export default App;
