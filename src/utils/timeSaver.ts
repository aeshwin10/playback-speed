// timeSaver.ts
// Logic to calculate time saved by watching at increased speed

export function calculateTimeSaved(actualSpeed: number, videoDuration: number): number {
  if (actualSpeed <= 1) return 0;
  return (1 - 1 / actualSpeed) * videoDuration;
}
