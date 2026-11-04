import { b, a } from "./mod";
import type { Thing } from "./types";
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; side: number }
  | { kind: "rect"; width: number; height: number };
export const area = (shape: Shape): number => {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "square":
      return shape.side * shape.side;
    default:
      return shape.width * shape.height;
  }
};
export const config = {
  alpha: 1,
  beta: "two",
  gamma: [1, 2, 3],
  delta: { nested: true, deeper: { value: "x".repeat(40) } },
  epsilon: null,
};
const chained = [1, 2, 3, 4, 5]
  .map((x) => x * 2)
  .filter((x) => x > 4)
  .reduce((sum, x) => sum + x, 0);
export async function load(
  url: string,
  options?: { retries?: number; timeoutMs?: number },
): Promise<string> {
  const res = await fetch(url, {
    method: "GET",
    headers: { accept: "application/json" },
  });
  return res.text();
}
export const Card = ({ title, items }: { title: string; items: string[] }) => (
  <section className="card">
    <h2>{title}</h2>
    <ul>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  </section>
);
const template = `value: ${chained} and ${a} and ${b}`;
export class Store<T extends Thing> {
  private items: T[] = [];
  add(item: T) {
    this.items.push(item);
    return this;
  }
  get size() {
    return this.items.length;
  }
}
export default template;
