export type BoxStatus = 'past' | 'future' | 'event';

export interface BoxInfo {
  date: Date;
  status: BoxStatus;
}

/**
 * Calculate the number of full days from now until the given event date.
 * Returns a positive number for future dates, zero for today, and a negative
 * number for past dates.
 */
export const daysUntil = (eventDate: Date): number => {
  const now = new Date();
  // Reset time components to midnight for an accurate day count
  const utcNow = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const utcEvent = Date.UTC(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((utcEvent - utcNow) / msPerDay);
};

/**
 * Generate a grid of BoxInfo objects representing a calendar for the current year
 * plus any additional months needed to include the event date.
 * Days before today are grey (past), days from today to event are green (future),
 * the event day is red, and days after the event are grey.
 */
export const generateGrid = (eventDate: Date): BoxInfo[] => {
  const today = new Date();
  // Normalize both dates to midnight for consistent comparisons
  const base = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  const event = new Date(Date.UTC(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate()));

  const boxes: BoxInfo[] = [];

  // Start from Jan 1 of current year
  const startDate = new Date(Date.UTC(today.getFullYear(), 0, 1));

  // Determine end date: Dec 31 of current year, or event's month end if event is in future year
  let endYear = today.getFullYear();
  let endMonth = 11; // December

  if (event.getFullYear() > today.getFullYear()) {
    endYear = event.getFullYear();
    endMonth = event.getMonth();
  } else if (event.getFullYear() === today.getFullYear() && event.getMonth() > today.getMonth()) {
    // Event is later this year but we still show full year
    endMonth = 11;
  }

  const endDate = new Date(Date.UTC(endYear, endMonth + 1, 0)); // Last day of endMonth

  // Start from startDate and go to endDate
  const current = new Date(startDate);

  while (current <= endDate) {
    let status: BoxStatus;
    if (current.toDateString() === event.toDateString()) {
      status = 'event'; // Event day is red
    } else if (current < base) {
      status = 'past'; // Days before today are grey
    } else if (current < event) {
      status = 'future'; // Days from today to event are green
    } else {
      status = 'past'; // Days after event are grey
    }
    boxes.push({ date: new Date(current), status });
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return boxes;
};