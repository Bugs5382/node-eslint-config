/** Sums with an indexed loop. */
export const sum = (values: number[]): number => {
  let total = 0;
  for (let index = 0; index < values.length; index++) {
    total += values[index] ?? 0;
  }
  return total;
};
