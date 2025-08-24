import "aos/dist/aos.css";
import "react";
import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import NavBar from "./components/navbar/NavBar";
import CategoryScreen from "./screens/CategoryScreen";
import PlaceDetailScreen from "./screens/PlaceDetailScreen";
import PlacesListScreen from "./screens/PlacesListScreen";
import ProfileScreen from "./screens/ProfileScreen";
function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="bg-white w-full h-full flex flex-col text-slate-800">
      <NavBar />
      <Routes>
        <Route path="/" element={<CategoryScreen />} />

        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/category/:categoryId" element={<PlacesListScreen />} />
        <Route path="/place-detail/" element={<PlaceDetailScreen />} />
      </Routes>
    </div>
  );
}

export default App;
