export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// generate random number in range
export function getRandomNumberInRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomFloatInRange(max: number, min: number) {
  return Math.random() * (max - min) + min;
}
