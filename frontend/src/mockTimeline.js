// Timeline data - starts empty, admin will add entries
// Data is stored in localStorage and will eventually move to backend
export const getTimelineEntries = () => {
  const stored = localStorage.getItem('blankenship_timeline');
  if (stored) {
    return JSON.parse(stored);
  }
  return []; // Start with empty timeline
};

export const saveTimelineEntries = (entries) => {
  localStorage.setItem('blankenship_timeline', JSON.stringify(entries));
};
