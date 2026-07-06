import { useEffect, useState } from "react";

export default function useDarkMode() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("theme");
    setEnabled(stored === "dark");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", enabled);
    window.localStorage.setItem("theme", enabled ? "dark" : "light");
  }, [enabled]);

  return { enabled, setEnabled };
}
