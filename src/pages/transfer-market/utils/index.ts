
export const formatMoney = (value: number) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else {
    return `$${(value / 1000).toFixed(0)}K`;
  }
};
