/**
 * OpeningHours component displaying library opening hours.
 *
 * Renders an accessible definition list with a status badge indicating
 * whether the library is currently open. Uses injected `now` prop for
 * testability rather than reading the system clock.
 */

import React from "react";
import styles from "./OpeningHours.module.css";

/** Schedule entry for a single day */
export interface DaySchedule {
  /** Full weekday name (e.g., "Monday") */
  day: string;
  /** Display text for hours (e.g., "09:00–17:00" or "Closed") */
  hours: string;
  /** Opening time in HH:MM format, or null if closed */
  opens: string | null;
  /** Closing time in HH:MM format, or null if closed */
  closes: string | null;
}

/** Props for the OpeningHours component */
export interface OpeningHoursProps {
  /** Seven-day schedule array, ordered Sunday-Saturday */
  schedule: DaySchedule[];
  /** The current instant to evaluate open/closed status against */
  now: Date;
}

/**
 * Parse a time string in HH:MM format to minutes since midnight.
 *
 * @param time - Time string like "09:00"
 * @returns Minutes since midnight
 */
function parseTime(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Check if the given time falls within the opening hours.
 *
 * @param now - Current date/time
 * @param opens - Opening time in HH:MM format
 * @param closes - Closing time in HH:MM format
 * @returns True if now is within opening hours
 */
function isOpen(now: Date, opens: string, closes: string): boolean {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = parseTime(opens);
  const closeMinutes = parseTime(closes);
  return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
}

/**
 * OpeningHours component.
 *
 * Renders a section with aria-label "Opening hours" containing a definition
 * list of days and their hours. Shows an "Open now" or "Closed" badge based
 * on the injected `now` prop. Marks the current weekday row with aria-current="date".
 *
 * @param props - OpeningHoursProps
 * @returns JSX.Element
 */
export default function OpeningHours({ schedule, now }: OpeningHoursProps): JSX.Element {
  const currentDayIndex = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const todaySchedule = schedule[currentDayIndex];
  
  // Determine if library is open now
  const isCurrentlyOpen = todaySchedule && 
    todaySchedule.opens && 
    todaySchedule.closes && 
    isOpen(now, todaySchedule.opens, todaySchedule.closes);

  return (
    <section 
      className={styles.panel} 
      aria-label="Opening hours"
      data-animation="rise"
    >
      <div className={styles.header}>
        <h2 className={styles.title}>Opening Hours</h2>
        <span 
          className={`${styles.badge} ${isCurrentlyOpen ? styles.open : styles.closed}`}
          data-animation="pulse"
        >
          {isCurrentlyOpen ? "Open now" : "Closed"}
        </span>
      </div>
      <dl className={styles.list}>
        {schedule.map((daySchedule, index) => {
          const isCurrentDay = index === currentDayIndex;
          return (
            <div 
              key={daySchedule.day} 
              className={`${styles.row} ${isCurrentDay ? styles.currentRow : ""}`}
              {...(isCurrentDay ? { "aria-current": "date" } : {})}
            >
              <dt className={styles.day}>{daySchedule.day}</dt>
              <dd className={`${styles.hours} ${daySchedule.hours === "Closed" ? styles.closedHours : ""}`}>
                {daySchedule.hours}
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
