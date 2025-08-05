
import * as React from "react";
import { Sun, Moon } from "lucide-react";

const ThemeSwitcher = () => {
  const [dark, setDark] = React.useState(() => {
    return document.documentElement.classList.contains("dark");
  });
  React.useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  return (
    <button
      className="rounded-full p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
      title="Toggle dark mode"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setDark((v) => !v)}
      type="button"
    >
      {dark ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-gray-600" />}
    </button>
  );
};

export default ThemeSwitcher;
