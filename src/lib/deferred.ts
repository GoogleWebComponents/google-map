export class Deferred<T> {
  readonly promise: Promise<T> = new Promise<T>((resolve, reject) => {
    this.resolve = resolve;
    this.reject = reject;
  });
  resolve!: (v: T) => void;
  reject!: (e: Error) => void;
}
