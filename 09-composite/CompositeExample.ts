// Паттерн: Composite (Компоновщик), пример на zod
// Идея: отдельный товар (лист) и набор товаров (композит) работают через один интерфейс.
// Набор может содержать товары и другие наборы. Код, считающий цену, не знает, с чем работает:
// он просто вызывает price() у каждого элемента, и вложенность обрабатывается сама.

import { z } from 'zod';

// 1. КОМПОНЕНТ: общий интерфейс листьев и композитов
export interface CartItem {
  readonly name: string;
  price(): number;
}

// 2. ЛИСТ: отдельный товар. Не содержит других элементов.
export class Product implements CartItem {
  constructor(
    readonly name: string,
    private readonly unitPrice: number,
  ) {}

  price(): number {
    return this.unitPrice;
  }
}

// 3. КОМПОЗИТ: набор, который содержит товары и другие наборы.
// Его price() суммирует детей, а каждый ребёнок сам знает свою цену.
export class Bundle implements CartItem {
  private readonly children: CartItem[] = [];

  constructor(readonly name: string, private readonly discount = 0) {}

  add(item: CartItem): this {
    this.children.push(item);
    return this;
  }

  price(): number {
    const total = this.children.reduce((sum, item) => sum + item.price(), 0);
    return Math.round(total * (1 - this.discount));
  }
}

// 4. Валидация входящих данных с помощью zod. Схема рекурсивна: набор содержит элементы той же формы.
type ItemDto =
  | { type: 'product'; name: string; price: number }
  | { type: 'bundle'; name: string; discount?: number; items: ItemDto[] };

const itemSchema: z.ZodType<ItemDto> = z.lazy(() =>
  z.discriminatedUnion('type', [
    z.object({ type: z.literal('product'), name: z.string(), price: z.number().nonnegative() }),
    z.object({
      type: z.literal('bundle'),
      name: z.string(),
      discount: z.number().min(0).max(1).optional(),
      items: z.array(itemSchema),
    }),
  ]),
);

// Превращаем проверенные данные в дерево композитов.
// Один рекурсивный вызов работает и для товара, и для набора любой глубины.
export function toCartItem(dto: ItemDto): CartItem {
  if (dto.type === 'product') {
    return new Product(dto.name, dto.price);
  }
  return dto.items.reduce(
    (bundle, child) => bundle.add(toCartItem(child)),
    new Bundle(dto.name, dto.discount),
  );
}

// 5. Использование: данные приходят как JSON, zod проверяет их, дерево строится и считается
export function parseCart(input: unknown): CartItem {
  return toCartItem(itemSchema.parse(input));
}

const cart = parseCart({
  type: 'bundle',
  name: 'Корзина',
  items: [
    { type: 'product', name: 'Кофе', price: 500 },
    {
      type: 'bundle',
      name: 'Завтрак',
      discount: 0.1,
      items: [
        { type: 'product', name: 'Круассан', price: 150 },
        { type: 'product', name: 'Сок', price: 200 },
      ],
    },
  ],
});

console.log(`${cart.name}: ${cart.price()} ₽`);

// 6. Чтобы добавить новый тип элемента (например, подарочный сертификат), реализуем CartItem.
// Код подсчёта цены в Bundle менять не нужно.
