
import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type SearchModalProps = {
  open: boolean;
  onClose: () => void;
};

const dummyResults = [
  { label: "CRM Leads", path: "/dashboard/crm" },
  { label: "Projects", path: "/dashboard/projects" },
  { label: "Finance", path: "/dashboard/finance" },
  { label: "Settings", path: "/dashboard/settings" }
];

const GlobalSearchModal: React.FC<SearchModalProps> = ({ open, onClose }) => {
  const [term, setTerm] = React.useState("");
  React.useEffect(() => {
    if (!open) return;
    const keyListener = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", keyListener);
    return () => window.removeEventListener("keydown", keyListener);
  }, [open, onClose]);

  if (!open) return null;
  const results = term
    ? dummyResults.filter(r => r.label.toLowerCase().includes(term.toLowerCase()))
    : dummyResults;

  return (
    <div className="fixed inset-0 z-[1010] bg-black/40 flex items-start justify-center animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl mt-36 w-full max-w-lg p-6 relative">
        <button className="absolute top-3 right-3" aria-label="Close" onClick={onClose}>
          <span className="text-xl">&times;</span>
        </button>
        <h2 className="mb-4 font-bold text-lg flex items-center gap-2">
          <Search className="w-5 h-5 text-gray-500" /> Search the platform
        </h2>
        <Input
          autoFocus
          placeholder="Type anything..."
          className="mb-3"
          value={term}
          onChange={e => setTerm(e.target.value)}
        />
        <ul>
          {results.length === 0 ? (
            <li className="text-gray-500 text-sm py-4 text-center">No results</li>
          ) : (
            results.map((r, idx) => (
              <li key={r.path} className="py-2 px-2 rounded-lg text-sm hover:bg-gray-50">
                <a href={r.path} onClick={onClose} className="font-medium">{r.label}</a>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default GlobalSearchModal;
