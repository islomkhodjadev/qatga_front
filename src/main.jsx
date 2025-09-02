import { init, miniApp } from "@telegram-apps/sdk";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import { BotClientProvider } from "./utils/BotClientContext.jsx";
import { LanguageProvider } from "./utils/language";
const initializeTelegramSDK = async () => {
  try {
    await init();

    if (miniApp.ready.isAvailable()) {
      await miniApp.ready();
    }
  } catch (error) {
    console.log(error);
  }
};

initializeTelegramSDK();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BotClientProvider>
      <LanguageProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </LanguageProvider>
    </BotClientProvider>
  </StrictMode>
);
