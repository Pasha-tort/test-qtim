export function snakeToCamelObj<T>(obj: any): T {
  if (obj instanceof Date) {
    return obj as unknown as T;
  }

  if (Array.isArray(obj)) {
    return obj.map(snakeToCamelObj) as unknown as T;
  }

  if (obj !== null && typeof obj === 'object') {
    const newObj = Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        snakeToCamel(key),
        snakeToCamelObj(value),
      ]),
    );
    return newObj as T;
  }

  return obj as T;
}

export function snakeToCamel(str: string): string {
  return str
    .toLowerCase()
    .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}
