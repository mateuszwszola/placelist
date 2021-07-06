export const getStatColor = (score: number): string => {
  if (score <= 3) {
    return 'bg-red-400';
  } else if (score <= 6) {
    return 'bg-yellow-400';
  } else {
    return 'bg-green-400';
  }
};
