// Persian (۰-۹) and Arabic-Indic (٠-٩) digits -> ASCII, so validation works with any keyboard.
export function toEnglishDigits(value) {
  if (value === null || value === undefined) return value;
  return String(value)
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
}
