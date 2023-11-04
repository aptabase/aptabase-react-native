export function newSessionId(): string {
  const epochInSeconds = BigInt(Math.floor(Date.now() / 1000));
  const random = BigInt(Math.floor(Math.random() * 100000000));
  return (epochInSeconds * 100000000n + random).toString();
}
