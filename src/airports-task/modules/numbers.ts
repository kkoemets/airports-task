export const roundNumber = (value: number, decimals: number) =>
  round(value, decimals);

export const isNumber = (n: number) => typeof n === 'number';

const round = (n, d) => Math.round(n * Math.pow(10, d)) / Math.pow(10, d);
