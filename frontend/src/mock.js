// Mock data for development
export const ENTRY_CODE = '05052017';

// Mock index entries (15-20 items sorted by date)
export const indexEntries = [
  { id: 1, header: 'October 2013 Entry', date: '10/2013', description: 'The obvious set-up of events' },
  { id: 2, header: 'November 2013 Entry', date: '11/2013', description: 'The setting up of Domino pieces to fall.' },
  { id: 3, header: 'December 2013 Entry', date: '12/2013', description: 'The illegal Inquisition.' },
  { id: 4, header: 'January 2014 Entry', date: '01/2014', description: 'New Year, new fear' },
  { id: 5, header: 'February 2014 Entry', date: '02/2014', description: 'Winter records' },
  { id: 6, header: 'March 2014 Entry', date: '03/2014', description: 'Spring season notes' },
  { id: 7, header: 'April 2014 Entry', date: '04/2014', description: 'April update' },
  { id: 8, header: 'May 2014 Entry', date: '05/2014', description: 'Spring summary' },
  { id: 9, header: 'June 2014 Entry', date: '06/2014', description: 'Summer beginning' },
  { id: 10, header: 'July 2014 Entry', date: '07/2014', description: 'Mid-year checkpoint' },
  { id: 11, header: 'August 2014 Entry', date: '08/2014', description: 'August records' },
  { id: 12, header: 'September 2014 Entry', date: '09/2014', description: 'Fall season start' },
  { id: 13, header: 'October 2014 Entry', date: '10/2014', description: 'October notes' },
  { id: 14, header: 'November 2014 Entry', date: '11/2014', description: 'Late year records' },
  { id: 15, header: 'December 2014 Entry', date: '12/2014', description: 'Year-end summary' },
  { id: 16, header: 'January 2015 Entry', date: '01/2015', description: 'New year 2015' },
  { id: 17, header: 'February 2015 Entry', date: '02/2015', description: 'Early 2015 notes' },
  { id: 18, header: 'March 2015 Entry', date: '03/2015', description: 'Spring 2015' },
  { id: 19, header: 'April 2015 Entry', date: '04/2015', description: 'April 2015 update' },
  { id: 20, header: 'May 2015 Entry', date: '05/2015', description: 'Mid 2015 overview' }
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