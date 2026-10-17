// Паттерн: Decorator (Декоратор), пример на NestJS
// Идея: сервис отправки уведомлений оборачиваем декораторами: логирование и повтор при ошибке.
// Каждый декоратор реализует тот же интерфейс, что и внутренний сервис, и делегирует ему вызов.
// Цепочку собираем в модуле через провайдер, контроллер получает готовый сервис по токену.

import 'reflect-metadata';
import { Body, Controller, Inject, Injectable, Module, Post } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

// 1. КОМПОНЕНТ: интерфейс отправки. Все декораторы реализуют его же.
export interface Notifier {
  send(to: string, text: string): Promise<void>;
}

export const NOTIFIER = Symbol('NOTIFIER');

// 2. КОНКРЕТНЫЙ КОМПОНЕНТ: основная логика отправки. Декораторы о нём ничего не знают.
@Injectable()
export class EmailNotifier implements Notifier {
  readonly sent: string[] = [];

  async send(to: string, text: string): Promise<void> {
    this.sent.push(`${to}: ${text}`);
  }
}

// 3. ДЕКОРАТОР 1: логирование. Пишет начало и результат каждой отправки.
// Декораторы не помечаем @Injectable: их создаёт фабрика в модуле, а не DI напрямую.
export class LoggingNotifier implements Notifier {
  constructor(private readonly inner: Notifier) {}

  async send(to: string, text: string): Promise<void> {
    console.log(`send -> ${to}`);
    try {
      await this.inner.send(to, text);
      console.log(`sent -> ${to}`);
    } catch (error) {
      console.log(`failed -> ${to}`);
      throw error;
    }
  }
}

// 4. ДЕКОРАТОР 2: повтор при ошибке. Делает до maxAttempts попыток, потом пробрасывает ошибку.
export class RetryNotifier implements Notifier {
  constructor(
    private readonly inner: Notifier,
    private readonly maxAttempts = 3,
  ) {}

  async send(to: string, text: string): Promise<void> {
    let lastError: unknown;
    for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
      try {
        return await this.inner.send(to, text);
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError;
  }
}

// 5. Контроллер знает только токен NOTIFIER и интерфейс Notifier. Про декораторы не знает.
@Controller('signup')
export class SignupController {
  constructor(@Inject(NOTIFIER) private readonly notifier: Notifier) {}

  @Post()
  async welcome(@Body() body: { email: string }) {
    await this.notifier.send(body.email, 'Добро пожаловать!');
    return { status: 'sent' };
  }
}

// 6. Модуль: собираем цепочку в фабрике провайдера. Внешний декоратор - тот, что получает контроллер.
@Module({
  controllers: [SignupController],
  providers: [
    EmailNotifier,
    {
      provide: NOTIFIER,
      inject: [EmailNotifier],
      useFactory: (email: EmailNotifier): Notifier =>
        new LoggingNotifier(new RetryNotifier(email, 3)),
    },
  ],
})
export class AppModule {}

// 7. Запуск. Порт берём из окружения, по умолчанию 3000.
export async function bootstrap(port = Number(process.env.PORT ?? 3000)) {
  const app = await NestFactory.create(AppModule, { logger: false });
  await app.listen(port);
  return app;
}

if (require.main === module) {
  bootstrap();
}

// 8. Чтобы добавить новое поведение (например, таймаут), пишем ещё один класс с тем же интерфейсом
// и оборачиваем им цепочку в фабрике. EmailNotifier, контроллер и остальные декораторы не меняются.
