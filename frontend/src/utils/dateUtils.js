/**
 * Formats a date for display, ensuring no timezone conversion issues
 * @param {string|Date} dateInput - The date to format
 * @returns {string} - Formatted date string (MM/DD/YYYY)
 */
export const formatDateForDisplay = (dateInput) => {
    if (!dateInput) return '';
    
    // If it's already a date object, convert to string first
    const dateStr = dateInput instanceof Date ? dateInput.toISOString() : dateInput;
    
    // Extract just the date part (YYYY-MM-DD) to avoid timezone issues
    const datePart = dateStr.split('T')[0];
    const [year, month, day] = datePart.split('-');
    
    // Create date using local timezone to avoid conversion
    const date = new Date(year, month - 1, day);
    
    return date.toLocaleDateString();
  };
  
  /**
   * Formats a date for input fields (YYYY-MM-DD format)
   * @param {string|Date} dateInput - The date to format
   * @returns {string} - Date in YYYY-MM-DD format
   */
  export const formatDateForInput = (dateInput) => {
    if (!dateInput) return '';
    
    // If it's already a date object, convert to string first
    const dateStr = dateInput instanceof Date ? dateInput.toISOString() : dateInput;
    
    // Extract just the date part (YYYY-MM-DD)
    return dateStr.split('T')[0];
  };
  
  /**
   * Creates a date string that won't have timezone conversion issues
   * @param {string} dateInput - Date input from HTML date field (YYYY-MM-DD)
   * @returns {string} - ISO string for the date at local midnight
   */
  export const createLocalDateString = (dateInput) => {
    if (!dateInput) return '';
    
    const [year, month, day] = dateInput.split('-');
    const date = new Date(year, month - 1, day);
    
    return date.toISOString();
  };