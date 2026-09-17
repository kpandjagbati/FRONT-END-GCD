export function mockDelay<T>(data: T, ms = 1600): Promise<T> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(data), ms);
  });
}
