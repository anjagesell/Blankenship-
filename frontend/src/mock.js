// Mock data for development
export const ENTRY_CODE = '05052017';

// Mock index entries (15-20 items sorted by date)
export const indexEntries = [
  { id: 1, header: 'January 2017 Entry', date: '01/2017', description: 'First quarter update' },
  { id: 2, header: 'February 2017 Entry', date: '02/2017', description: 'February documentation' },
  { id: 3, header: 'March 2017 Entry', date: '03/2017', description: 'Spring season notes' },
  { id: 4, header: 'April 2017 Entry', date: '04/2017', description: 'April records' },
  { id: 5, header: 'May 2017 Entry', date: '05/2017', description: 'Mid-year overview' },
  { id: 6, header: 'June 2017 Entry', date: '06/2017', description: 'Summer beginning' },
  { id: 7, header: 'July 2017 Entry', date: '07/2017', description: 'Mid-year checkpoint' },
  { id: 8, header: 'August 2017 Entry', date: '08/2017', description: 'August summary' },
  { id: 9, header: 'September 2017 Entry', date: '09/2017', description: 'Fall season start' },
  { id: 10, header: 'October 2017 Entry', date: '10/2017', description: 'October records' },
  { id: 11, header: 'November 2017 Entry', date: '11/2017', description: 'Late year notes' },
  { id: 12, header: 'December 2017 Entry', date: '12/2017', description: 'Year-end summary' },
  { id: 13, header: 'January 2018 Entry', date: '01/2018', description: 'New year beginning' },
  { id: 14, header: 'February 2018 Entry', date: '02/2018', description: 'Early 2018 notes' },
  { id: 15, header: 'March 2018 Entry', date: '03/2018', description: 'Spring 2018' },
  { id: 16, header: 'April 2018 Entry', date: '04/2018', description: 'April 2018 update' },
  { id: 17, header: 'May 2018 Entry', date: '05/2018', description: 'Mid 2018 overview' },
  { id: 18, header: 'June 2018 Entry', date: '06/2018', description: 'Summer 2018' },
  { id: 19, header: 'July 2018 Entry', date: '07/2018', description: 'July 2018 records' },
  { id: 20, header: 'August 2018 Entry', date: '08/2018', description: 'Late summer 2018' }
];

// Mock content for individual pages
export const getEntryContent = (id) => {
  return {
    id,
    title: indexEntries.find(e => e.id === parseInt(id))?.header || 'Entry',
    content: 'This is placeholder content. The actual content will be added later. This section will contain detailed information, notes, and any relevant documentation for this specific entry.',
    hasPhoto: true
  };
};