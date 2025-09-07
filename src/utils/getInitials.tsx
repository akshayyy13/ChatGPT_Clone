/**
 * Extract initials from full name
 * Examples: "John Doe" → "JD", "Alice" → "A", "Bob Smith Johnson" → "BJ"
 */
export function getInitials(name: string | undefined | null): string {
  if (!name || name.trim() === "") return "";

  const cleanName = name.trim();
  const nameParts = cleanName.split(" ").filter((part) => part.length > 0);

  if (nameParts.length === 0) return "";

  // Single name: just first letter
  if (nameParts.length === 1) {
    return nameParts[0][0].toUpperCase();
  }

  // Multiple names: first letter of first name + first letter of last name
  const firstInitial = nameParts[0][0].toUpperCase();
  const lastInitial = nameParts[nameParts.length - 1][0].toUpperCase();

  return firstInitial + lastInitial;
}

/**
 * Generate consistent background color for initials
 */
export function getInitialsColor(name: string | undefined | null): string {
  const colors = [
    "#FF6B6B", // Red
    "#4ECDC4", // Teal
    "#45B7D1", // Blue
    "#96CEB4", // Green
    "#FFEAA7", // Yellow
    "#DDA0DD", // Plum
    "#98D8C8", // Mint
    "#F7DC6F", // Light Yellow
    "#BB8FCE", // Light Purple
    "#85C1E9", // Light Blue
  ];

  if (!name) return colors[0];

  // Create consistent hash from name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}
