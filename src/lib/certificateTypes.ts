/**
 * Suggested (not enforced) certificate types, covering the standard UK fire &
 * security compliance disciplines — matches what BAFE-accredited firms and
 * competitors like FireCert track. Free text is still accepted for anything
 * client-specific that doesn't fit.
 */
export const CERTIFICATE_TYPES = [
  "Fire Alarm System (BS 5839-1)",
  "Emergency Lighting (BS 5266-1)",
  "Fire Extinguishers (BS 5306-3)",
  "Intruder Alarm (PD 6662)",
  "CCTV System",
  "Access Control System",
  "Dry Riser (BAFE SP105)",
  "Wet Riser (BAFE SP105)",
  "Sprinkler System (BS EN 12845 / BS 9251)",
  "Kitchen Fire Suppression (BAFE SP206)",
  "Fixed Gas Suppression (BAFE SP203-3)",
  "Fire Door Inspection",
] as const;
