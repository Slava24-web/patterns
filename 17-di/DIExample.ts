// Паттерн: DI (Внедрение зависимостей), пример на tsyringe
// Идея: класс не создаёт свои зависимости сам, а получает их снаружи. Контейнер знает, какая реализация
// нужна, и передаёт её в конструктор. Так можно подменить платёж на заглушку, не меняя OrderService.

import 'reflect-metadata';
import { container, inject, injectable } from 'tsyringe';

// 1. ИНТЕРФЕЙС зависимости: сервис знает только контракт, а не конкретную реализацию.
export interface PaymentGateway {
  charge(amount: number): Promise<string>; // возвращает id платежа
}

// Токен для интерфейса: TypeScript не сохраняет интерфейсы в runtime, поэтому нужна строка или символ.
export const PAYMENT_GATEWAY = 'PaymentGateway';

// 2. РЕАЛИЗАЦИЯ 1: боевой платёжный шлюз (здесь имитация, без сети).
@injectable()
export class RealPaymentGateway implements PaymentGateway {
  async charge(amount: number): Promise<string> {
    return `real-${amount}`;
  }
}

// 3. РЕАЛИЗАЦИЯ 2: заглушка для тестов. Записывает платежи, ничего никуда не отправляет.
@injectable()
export class FakePaymentGateway implements PaymentGateway {
  readonly charges: number[] = [];

  async charge(amount: number): Promise<string> {
    this.charges.push(amount);
    return `fake-${this.charges.length}`;
  }
}

// 4. КЛИЕНТ: получает шлюз через конструктор. Сам не решает, какой использовать.
@injectable()
export class OrderService {
  constructor(@inject(PAYMENT_GATEWAY) private readonly payments: PaymentGateway) {}

  async placeOrder(amount: number): Promise<string> {
    return this.payments.charge(amount);
  }
}

// 5. Регистрация: контейнер выбирает реализацию. В приложении - боевую, в тестах - заглушку.
container.register(PAYMENT_GATEWAY, { useClass: RealPaymentGateway });

async function demo() {
  const orders = container.resolve(OrderService);
  console.log('order paid with', await orders.placeOrder(500));
}

demo();

// 6. Чтобы заменить реализацию, достаточно другой регистрации. OrderService при этом не меняется.
// Например: container.register(PAYMENT_GATEWAY, { useClass: FakePaymentGateway });
