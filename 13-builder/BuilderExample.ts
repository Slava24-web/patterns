// Паттерн: Builder (Строитель), пример на mongoose
// Идея: сложный запрос собираем пошагово через цепочку методов. Каждый шаг добавляет одно условие,
// а build() в конце отдаёт готовый результат. Так не нужен конструктор с десятком необязательных параметров.
// mongoose сам умеет строить запросы. Мы оборачиваем его в собственный строитель под задачу магазина.

import mongoose from 'mongoose';

// 1. Модель заказа. Соединения с базой нет: запрос собирается, но не выполняется.
const Order = mongoose.model(
  'Order',
  new mongoose.Schema({
    status: String,
    total: Number,
    customer: String,
    createdAt: Date,
  }),
);

// 2. СТРОИТЕЛЬ: каждый метод добавляет одно условие и возвращает this, поэтому их можно сцеплять.
export class OrdersQueryBuilder {
  private query = Order.find().select('customer total createdAt');

  withStatus(status: string): this {
    this.query = this.query.where('status', status);
    return this;
  }

  minTotal(amount: number): this {
    this.query = this.query.where('total').gte(amount);
    return this;
  }

  createdAfter(date: Date): this {
    this.query = this.query.where({ createdAt: { $gt: date } });
    return this;
  }

  newestFirst(): this {
    this.query = this.query.sort({ createdAt: -1 });
    return this;
  }

  limit(count: number): this {
    this.query = this.query.limit(count);
    return this;
  }

  // 3. ГОТОВЫЙ ОБЪЕКТ: build() отдаёт запрос. Его можно выполнить через await query.exec().
  build() {
    return this.query;
  }
}

// 4. Использование: условия добавляются только по необходимости, порядок вызовов не важен.
const query = new OrdersQueryBuilder()
  .withStatus('paid')
  .minTotal(1000)
  .createdAfter(new Date('2026-01-01'))
  .newestFirst()
  .limit(20)
  .build();

console.log('filter:', JSON.stringify(query.getFilter()));
console.log('options:', JSON.stringify(query.getOptions()));

// Без условий строитель выдаёт базовый запрос
const plain = new OrdersQueryBuilder().build();
console.log('plain filter:', JSON.stringify(plain.getFilter()));

// 5. Чтобы добавить новое условие (например, фильтр по покупателю), пишем ещё один метод.
// Остальные шаги и build() при этом не меняются.
