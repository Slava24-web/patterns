// Паттерн: Proxy (Заместитель), пример на MobX
// Идея: прокси имеет тот же интерфейс, что и реальный объект, и стоит перед ним.
// Реальная корзина - observable-хранилище MobX. Прокси отдаёт те же данные, но запрещает запись для роли viewer.
// Так как прокси отдаёт живые данные MobX, подписки (autorun, observer) реагируют на изменения через него.

import { autorun, configure, makeAutoObservable } from 'mobx';

// Запрещаем менять observable вне action: все изменения идут через методы хранилища
configure({ enforceActions: 'always' });

// 1. ИНТЕРФЕЙС: общий для хранилища и прокси
export type Item = { name: string; price: number };

export interface CartApi {
  readonly items: readonly Item[];
  readonly total: number;
  add(item: Item): void;
}

// 2. РЕАЛЬНЫЙ ОБЪЕКТ: observable-хранилище MobX. makeAutoObservable делает поля наблюдаемыми,
// а методы - action, поэтому каждое изменение проходит через одну точку.
export class CartStore implements CartApi {
  items: Item[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  get total(): number {
    return this.items.reduce((sum, item) => sum + item.price, 0);
  }

  add(item: Item): void {
    this.items.push(item);
  }
}

// 3. ПРОКСИ: защитный. Чтение проходит насквозь, запись разрешена только роли buyer.
export type Role = 'viewer' | 'buyer';

export class RoleCartProxy implements CartApi {
  constructor(
    private readonly inner: CartApi,
    private readonly role: Role,
  ) {}

  get items(): readonly Item[] {
    return this.inner.items;
  }

  get total(): number {
    return this.inner.total;
  }

  add(item: Item): void {
    if (this.role !== 'buyer') {
      throw new Error('Forbidden: viewer cannot add items');
    }
    this.inner.add(item);
  }
}

// 4. Использование: одно хранилище, два прокси с разными правами. Оба видят одни и те же данные.
const cart = new CartStore();
const buyerView: CartApi = new RoleCartProxy(cart, 'buyer');
const viewerView: CartApi = new RoleCartProxy(cart, 'viewer');

// Подписка на данные через прокси: реакция приходит при изменении хранилища
autorun(() => {
  console.log(`total via viewer: ${viewerView.total}`);
});

function demo() {
  buyerView.add({ name: 'Кофе', price: 500 });
  buyerView.add({ name: 'Чай', price: 300 });

  try {
    viewerView.add({ name: 'Печенье', price: 200 });
  } catch (error) {
    console.log((error as Error).message);
  }
}

demo();

// 5. Чтобы добавить новое правило (например, лимит на число товаров), пишем условие в прокси.
// CartStore и клиенты при этом не меняются.
