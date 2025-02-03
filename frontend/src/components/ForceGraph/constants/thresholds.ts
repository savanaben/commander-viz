/**
 * Zoom level thresholds for different rendering modes
 */
export const DETAIL_THRESHOLD = 5.5;  // Switch from circle to card view
export const LABEL_SHOW_THRESHOLD = 2.0;  // Show/hide labels
export const LINK_DETAIL_THRESHOLD = 3.0;  // Show link details

/**
 * Force simulation constants
 */
export const FORCE_CONSTANTS = {
  CHARGE_STRENGTH: -50,
  CHARGE_MAX_DISTANCE: 400,
  LINK_MIN_DISTANCE: 30,
  LINK_MAX_DISTANCE: 300,
  CENTER_STRENGTH: 0.03,
  COLLIDE_RADIUS: 10,
  COLLIDE_STRENGTH: 0.1
};