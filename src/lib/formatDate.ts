export default function formatDate(date: any) {
  // Extract day, month, and year
  const currentDate = new Date(date)
  const day = ("0" + currentDate.getDate()).slice(-2); // Ensure two digits
  const month = ("0" + (currentDate.getMonth() + 1)).slice(-2); // Add 1 to month (months are zero-indexed)
  const year = currentDate.getFullYear();

  // Format the date as MM/DD/YYYY
  return month + "/" + day + "/" + year;
}
