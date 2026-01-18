export function stableStringify(obj: object): string {
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    const sortedKeys = Object.keys(obj).sort();
    const sortedObj: any = {};
    for (const key of sortedKeys) {
      sortedObj[key] = stableStringify((obj as { [k in string]: object })[key]);
    }
    return JSON.stringify(sortedObj);
  } else if (Array.isArray(obj)) {
    return JSON.stringify(obj.map(stableStringify));
  } else {
    return JSON.stringify(obj);
  }
}
