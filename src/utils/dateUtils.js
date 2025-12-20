/**
 * Utility for handling dates in the Zambian timezone (GMT+2)
 * to prevent UTC-related "date jumping" issues.
 */

export const getZambianDate = (date = new Date()) => {
  // Zambia is GMT+2 (Central Africa Time)
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Harare",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const part = (type) => parts.find((p) => p.type === type).value;
  return `${part("year")}-${part("month")}-${part("day")}`;
};

export const getZambianDateTime = (date = new Date()) => {
  return new Intl.DateTimeFormat("en-ZA", {
    timeZone: "Africa/Harare",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
};

export const formatZambianTime = (date) => {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
};

export const formatZambianDate = (date) => {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Harare",
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(d);
};

export const getCurrentZambianDateTime = () => {
  const now = new Date();
  // Zambia is GMT+2 (120 minutes ahead of UTC)
  const zambianOffset = 120; // minutes
  const localOffset = now.getTimezoneOffset(); // minutes from UTC
  const offsetDifference = zambianOffset - localOffset;
  return new Date(now.getTime() + offsetDifference * 60000);
};

export const getCurrentZambianDateString = () => {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Harare",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "2-digit",
  }).format(new Date());
};
