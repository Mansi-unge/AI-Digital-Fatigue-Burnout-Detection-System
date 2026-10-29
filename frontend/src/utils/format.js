export const secondsToHm = (seconds = 0) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

export const timeAgo = (isoString) => {
  if (!isoString) return "—";

  let dateString = isoString;

  // Backend currently sends UTC timestamps without "Z".
  // Tell JavaScript that these timestamps are UTC.
  if (
    typeof dateString === "string" &&
    !dateString.endsWith("Z") &&
    !dateString.includes("+")
  ) {
    dateString = `${dateString}Z`;
  }

  const timestamp = new Date(dateString).getTime();

  if (Number.isNaN(timestamp)) {
    return "—";
  }

  const diffMs = Date.now() - timestamp;

  if (diffMs < 0) {
    return "Just now";
  }

  const mins = Math.floor(diffMs / 60000);

  if (mins < 1) {
    return "Just now";
  }

  if (mins < 60) {
    return `${mins} min ago`;
  }

  const hrs = Math.floor(mins / 60);

  if (hrs < 24) {
    return `${hrs}h ago`;
  }

  return new Date(dateString).toLocaleDateString();
};

// DATA_COLLECTION_TARGET: how many activity records count as "100% collected".
// Adjust this single constant once you know the exact number you need.
export const DATA_COLLECTION_TARGET = 3000;

export const computeCollectionProgress = (recordCount = 0, target = DATA_COLLECTION_TARGET) => {
  if (!recordCount) return 0;
  return Math.max(0, Math.min(100, Math.round((recordCount / target) * 100)));
};