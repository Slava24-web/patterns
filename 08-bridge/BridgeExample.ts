// Паттерн: Bridge (Мост), пример на pino
// Идея: два независимых измерения. Абстракция (что логируем: обычные записи, запросы, ошибки)
// и реализация (куда пишем: pino в JSON, консоль). Их можно комбинировать без взрыва классов.
// Вместо Logger, RequestLogger и ErrorLogger для каждого приёмника, связываем абстракцию с реализацией через мост.

import pino from 'pino';

// 1. РЕАЛИЗАЦИЯ: интерфейс того, куда пишем. Абстракция работает только с ним.
export interface LogWriter {
  write(level: 'info' | 'error', data: Record<string, unknown>, message: string): void;
}

// 2. Конкретные реализации. Каждая знает только свой приёмник.
export class PinoWriter implements LogWriter {
  constructor(private readonly logger: pino.Logger) {}

  write(level: 'info' | 'error', data: Record<string, unknown>, message: string): void {
    this.logger[level](data, message);
  }
}

export class ConsoleWriter implements LogWriter {
  write(level: 'info' | 'error', data: Record<string, unknown>, message: string): void {
    const line = `[${level}] ${message} ${JSON.stringify(data)}`;
    if (level === 'error') {
      console.error(line);
    } else {
      console.log(line);
    }
  }
}

// 3. АБСТРАКЦИЯ: что логируем. Держит ссылку на реализацию (это и есть мост).
export class Logger {
  constructor(protected readonly writer: LogWriter) {}

  info(message: string, data: Record<string, unknown> = {}): void {
    this.writer.write('info', data, message);
  }

  error(message: string, data: Record<string, unknown> = {}): void {
    this.writer.write('error', data, message);
  }
}

// Уточнённая абстракция: добавляет requestId ко всем записям. Работает с любым приёмником.
export class RequestLogger extends Logger {
  constructor(writer: LogWriter, private readonly requestId: string) {
    super(writer);
  }

  override info(message: string, data: Record<string, unknown> = {}): void {
    super.info(message, { requestId: this.requestId, ...data });
  }

  override error(message: string, data: Record<string, unknown> = {}): void {
    super.error(message, { requestId: this.requestId, ...data });
  }
}

// Ещё одна абстракция: при ошибке добавляет stack. Тоже работает с любым приёмником.
export class ErrorLogger extends Logger {
  reportError(error: unknown): void {
    const err = error instanceof Error ? error : new Error(String(error));
    super.error(err.message, { stack: err.stack });
  }
}

// 4. Использование: 2 абстракции × 2 реализации, без отдельного класса на каждую комбинацию
const pinoWriter = new PinoWriter(pino({ level: 'info' }));
const consoleWriter = new ConsoleWriter();

const appLog = new Logger(pinoWriter);
const requestLog = new RequestLogger(pinoWriter, 'req-42');
const debugLog = new ErrorLogger(consoleWriter);

appLog.info('Приложение запущено');
requestLog.info('Запрос обработан', { route: '/users' });
debugLog.reportError(new Error('Таймаут при загрузке'));

// 5. Чтобы добавить новый приёмник (например, отправку в Sentry), пишем новый LogWriter.
// Абстракции (Logger, RequestLogger, ErrorLogger) при этом не меняются.
