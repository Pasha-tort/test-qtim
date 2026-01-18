export function cleanerObject(obj: object) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined),
  );
}

/**
 * Removes properties with `undefined` values.
 *
 * ⚠️ Mutates the input object.
 *
 * @param obj - Object to clean (will be mutated)
 * @returns Returns nothing
 */
export function cleanerObjectSrc(obj: { [k in string]: string }) {
  for (const key in obj) {
    if (obj[key] === undefined) {
      delete obj[key];
    }
  }
}
