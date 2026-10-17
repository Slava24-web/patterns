// Паттерн: Cache (Кэш-сайд, Cache-Aside), пример на cache-manager
// Идея: приложение само управляет кэшем. Читаем из кэша, при промахе идём в источник данных
// и кладём результат в кэш. При изменении данных удаляем запись из кэша, чтобы не отдавать старое.

import { createCache } from 'cache-manager';

export type Product = { id: string; name: string; price: number };

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 1. ИСТОЧНИК ДАННЫХ: медленная база. Считаем обращения, чтобы видеть, сколько запросов дошло до неё.
export class ProductRepository {
  readonly reads = { count: 0 };
  private readonly rows = new Map<string, Product>([
    ['coffee', { id: 'coffee', name: 'Кофе', price: 500 }],
    ['tea', { id: 'tea', name: 'Чай', price: 300 }],
  ]);

  async findById(id: string): Promise<Product | null> {
    this.reads.count++;
    await delay(50);
    return this.rows.get(id) ?? null;
  }

  async save(product: Product): Promise<void> {
    await delay(50);
    this.rows.set(product.id, product);
  }
}

// 2. КЭШ-САЙД: сервис сам читает кэш, при промахе идёт в базу и кладёт результат в кэш.
export class ProductService {
  // ttl в миллисекундах: запись живёт минуту, потом читается заново из базы
  private readonly cache = createCache({ ttl: 60_000 });

  constructor(private readonly repo: ProductRepository) {}

  async getProduct(id: string): Promise<Product | null> {
    const key = `product:${id}`;

    const cached = await this.cache.get<Product>(key);
    if (cached) {
      return cached; // попадание: база не трогаем
    }

    const product = await this.repo.findById(id); // промах: идём в источник
    if (product) {
      // пустой результат не кэшируем, иначе отсутствующий товар "залипнет" в кэше
      await this.cache.set(key, product);
    }
    return product;
  }

  // 3. ЗАПИСЬ: меняем источник и удаляем запись из кэша. Следующее чтение получит свежие данные.
  async changePrice(id: string, price: number): Promise<void> {
    const product = await this.repo.findById(id);
    if (!product) {
      throw new Error(`Unknown product: ${id}`);
    }
    await this.repo.save({ ...product, price });
    await this.cache.del(`product:${id}`);
  }
}

// 4. Использование
async function demo() {
  const repo = new ProductRepository();
  const service = new ProductService(repo);

  console.log(await service.getProduct('coffee')); // промах: идёт в базу
  console.log(await service.getProduct('coffee')); // попадание: из кэша
  console.log('reads after two gets:', repo.reads.count);

  await service.changePrice('coffee', 550); // база обновлена, кэш очищен
  console.log(await service.getProduct('coffee')); // снова промах, свежая цена
  // 3 = первый промах + чтение внутри changePrice + промах после очистки кэша
  console.log('reads total:', repo.reads.count);
}

demo();

// 5. Чтобы ввести другой кэш (например, Redis), заменяем только createCache на адаптер того же интерфейса.
// ProductService и ProductRepository при этом не меняются.
