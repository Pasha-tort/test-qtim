export function camelToSnake(str: string): string {
  return str
    .replace(/([A-Z])/g, '_$1') // перед каждой заглавной вставляем _
    .toLowerCase();
}
