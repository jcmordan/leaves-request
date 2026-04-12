import { format, isValid } from "date-fns";

export const formatPhoneNumber = (phoneNumber: string) => {
  //Filter only numbers from the input
  const cleaned = cleanPhoneNumber(phoneNumber);

  //Check if the input is of correct length
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);

  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }

  return phoneNumber;
};

export const cleanPhoneNumber = (phoneNumber: string) => {
  return `${phoneNumber}`.replace(/\D/g, "");
};

export const formatPercentage = (value?: number | null) =>
  value !== undefined && value !== null
    ? value.toLocaleString(undefined, {
        style: "percent",
        maximumFractionDigits: 2,
      })
    : "-";

export const formatCurrency = (value?: number | null, currency?: string) =>
  value !== undefined && value !== null
    ? value.toLocaleString(undefined, {
        style: "currency",
        maximumFractionDigits: 2,
        currency: currency ?? "DOP",
        currencyDisplay: "narrowSymbol",
      })
    : "-";

export const formatDate = (
  date?: string | number | Date | null,
  formatStr = "PPp",
  fallback = "-",
) => {
  if (!date) {
    return fallback;
  }

  const dateObj = date instanceof Date ? date : new Date(date);

  if (!isValid(dateObj) || dateObj.getFullYear() <= 1) {
    return fallback;
  }

  return format(dateObj, formatStr);
};

export const getInitials = (value: string) => {
  const names = value.split(" ");
  let initials = names[0].substring(0, 1).toUpperCase();

  if (names.length === 4) {
    initials += names[2].substring(0, 1).toUpperCase();
  } else if (names.length >= 2) {
    initials += names[1].substring(0, 1).toUpperCase();
  }

  return initials;
};

/**
 * Formats a string into the Dominican Republic Cédula format: XXX-XXXXXXX-X
 * @param {string} nationalId - The raw numeric string
 * @returns {string} - The formatted cédula
 */
export const formatNationalId = (nationalId?: string) => {
  if (!nationalId) {
    return "-";
  }

  if (nationalId.length !== 11) {
    return nationalId;
  }

  // 1. Remove all non-digits
  const cleaned = ("" + nationalId).replace(/\D/g, "");

  // 2. Check if we have the required 11 digits
  // (Optional: handle partial strings if you want "live" formatting)
  const match = cleaned.match(/^(\d{3})(\d{7})(\d{1})$/);

  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }

  return "Invalid length; must be 11 digits.";
};

/**
 * Truncates a string to a specified length and adds an ellipsis if it exceeds that length.
 * @param {string} value - The string to truncate
 * @param {number} maxLength - The maximum length before truncation
 * @returns {string} - The truncated string
 */
export const truncate = (value?: string | null, maxLength = 50) => {
  if (!value) {
    return "-";
  }

  if (value.length <= maxLength) {
    return value;
  }

  return `${value.substring(0, maxLength)}...`;
};
