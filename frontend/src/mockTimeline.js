// Timeline data - NOW STORED IN DATABASE
// This file is kept for backwards compatibility but data comes from /api/timeline
// Old localStorage data will be automatically cleared by the cache buster in index.html

export const getTimelineEntries = () => {
  // Data now comes from the backend API, not localStorage
  // This function is deprecated but kept for safety
  console.warn('getTimelineEntries() is deprecated. Data is now fetched from the API.');
  return [];
};

export const saveTimelineEntries = (entries) => {
  // Data now saved to the backend API, not localStorage
  // This function is deprecated but kept for safety
  console.warn('saveTimelineEntries() is deprecated. Data is now saved to the API.');
};
