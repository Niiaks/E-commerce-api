function generateOrderNumber() {
  const part1 = Math.floor(10000 + Math.random() * 90000);
  const part2 = Math.floor(10 + Math.random() * 90);
  return `${part1}-${part2}`;
}

console.log(generateOrderNumber());
