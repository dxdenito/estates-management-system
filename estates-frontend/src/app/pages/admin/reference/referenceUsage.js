const LABELS = {
  requests: ["request", "requests"],
  inspections: ["inspection", "inspections"],
  assignments: ["assignment", "assignments"],
  children: ["sub-location", "sub-locations"],
  supervisors: ["contractor supervisor", "contractor supervisors"],
};

export const usageText = (usage) => {
  const parts = Object.entries(LABELS)
    .filter(([key]) => usage[key] > 0)
    .map(([key, [one, many]]) => `${usage[key]} ${usage[key] === 1 ? one : many}`);

  return parts.length > 0 ? `Used by ${parts.join(", ")}` : "Not in use";
};

export const LOCATION_TYPES = ["compound", "building", "floor", "room", "road", "park"];

export const formatType = (type) => type.charAt(0).toUpperCase() + type.slice(1);