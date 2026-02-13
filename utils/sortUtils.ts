export function compareValues(a: string, b: string): number {
  const numA = Number(a);
  const numB = Number(b);
  if (!isNaN(numA) && !isNaN(numB) && a !== "" && b !== "") {
    return numA - numB;
  }
  if (a === "" && b !== "") return 1;
  if (a !== "" && b === "") return -1;
  return a.localeCompare(b);
}