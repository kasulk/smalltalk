export function getRandomNumFromNums(...nums: number[]): number {
  const randomIndex = Math.floor(Math.random() * nums.length);
  return nums[randomIndex];
}
