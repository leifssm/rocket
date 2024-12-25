import type { Prettify } from './helpers/types';

interface CacheEntry<T = unknown> {
  value: T | null;
  factory: () => Promise<T>;
}

type CacheContent = Record<string, any>;

type ExtractKeys<T> = keyof T extends string ? keyof T : never;

export class Cache<Content extends CacheContent = {}, Keys extends string = ExtractKeys<Content>> {
  private cache = {} as Record<Keys, CacheEntry>;

  public async get<Key extends Keys>(key: Key, refresh?: boolean) {
    if (!this.cache[key]) {
      throw new Error(`Key ${key} does not exist in cache`);
    }

    if (refresh || this.cache[key].value === null) {
      this.cache[key].value = await this.cache[key].factory();
    }

    return this.cache[key].value as Content[Key];
  }

  public store<Key extends string, Type>(
    key: Key,
    factory: () => Promise<Type>
  ) {
    if (key in this.cache) {
      throw new Error(`Key ${key} already exists in cache`);
    }

    // @ts-ignore
    this.cache[key] = {
      value: null,
      factory,
    };
    return this as unknown as Cache<Prettify<Content & { [key in Key]: Type }>>;
  }

  public invalidate<Key extends Keys>(key: Key) {
    if (!this.cache[key]) {
      throw new Error(`Key ${key} does not exist in cache`);
    }
    this.cache[key].value = null;
  }
}
