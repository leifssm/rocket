export type Prettify<T> = {
  [key in keyof T]: T[key];
} & {};

export type PromiseOrNot<T> = T | Promise<T>;
