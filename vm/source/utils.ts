export function unmatched(value: never) {
  throw new Error(`Non-exhaustive pattern matching. Missing ${value}`);
}
