import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface SensoryModeContextType {
  sensoryMode: boolean;
  toggleSensoryMode: () => void;
}

const SensoryModeContext = createContext<SensoryModeContextType>({
  sensoryMode: false,
  toggleSensoryMode: () => {},
});

export const useSensoryMode = () => useContext(SensoryModeContext);

export const SensoryModeProvider = ({ children }: { children: ReactNode }) => {
  const [sensoryMode, setSensoryMode] = useState(() => {
    return localStorage.getItem("kinftech-sensory") === "true";
  });

  useEffect(() => {
    localStorage.setItem("kinftech-sensory", String(sensoryMode));
    if (sensoryMode) {
      document.documentElement.classList.add("sensory-mode");
    } else {
      document.documentElement.classList.remove("sensory-mode");
    }
  }, [sensoryMode]);

  const toggleSensoryMode = () => setSensoryMode((prev) => !prev);

  return (
    <SensoryModeContext.Provider value={{ sensoryMode, toggleSensoryMode }}>
      {children}
    </SensoryModeContext.Provider>
  );
};
