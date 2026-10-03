import { useEffect, useState } from "react";
import { fetchLocationChildren } from "../../api/locations";
import { inputClass } from "../../components/ui/styles";

const formatType = (type) => type.charAt(0).toUpperCase() + type.slice(1);

export default function LocationPicker({ onChange, rootIds }) {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLocationChildren(null)
      .then((options) => {
        const visible = rootIds ? options.filter((option) => rootIds.includes(option.id)) : options;
        setLevels([{ options: visible, selectedId: "" }]);
      })
      .catch((err) => {
        console.error("Failed to load locations:", err);
        setError("Could not load locations. Please refresh the page.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = async (index, rawId) => {
    const kept = levels.slice(0, index + 1);
    kept[index] = { ...kept[index], selectedId: rawId };
    setLevels(kept);
    setError(null);

    if (!rawId) {
      onChange(index > 0 ? Number(kept[index - 1].selectedId) : null);
      return;
    }

    onChange(Number(rawId));

    try {
      const children = await fetchLocationChildren(rawId);
      if (children.length === 0) return;
      setLevels((current) =>
        current.length === index + 1 && current[index].selectedId === rawId
          ? [...current, { options: children, selectedId: "" }]
          : current
      );
    } catch (err) {
      console.error("Failed to load child locations:", err);
      setError("Could not load more detail for this location.");
    }
  };

  if (loading) return <p className="text-sm text-ink-faint">Loading locations...</p>;

  return (
    <div className="space-y-2">
      {levels.map((level, index) => (
        <select
          key={index}
          value={level.selectedId}
          onChange={(event) => handleSelect(index, event.target.value)}
          required={index === 0}
          className={inputClass}
        >
          <option value="">
            {index === 0
              ? "Select location"
              : `Select ${level.options[0].type} (optional)`}
          </option>
          {level.options.map((option) => (
            <option key={option.id} value={option.id}>
              {index === 0 ? option.name : `${formatType(option.type)}: ${option.name}`}
            </option>
          ))}
        </select>
      ))}
      {error && (
        <p role="alert" className="text-sm text-danger-strong">
          {error}
        </p>
      )}
    </div>
  );
}