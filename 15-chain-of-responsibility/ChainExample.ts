// Паттерн: Chain of Responsibility (Цепочка обязанностей), пример на Express
// Идея: запрос проходит по цепочке обработчиков. Каждое звено решает: ответить самому и остановить цепочку,
// или передать запрос дальше через next(). Звенья не знают друг о друге, порядок задаёт маршрут.

import { pathToFileURL } from 'node:url';
import express, { type NextFunction, type Request, type Response } from 'express';

// 1. ОБРАБОТЧИК: общий тип звена. Все звенья принимают одинаковые аргументы.
type Handler = (req: Request, res: Response, next: NextFunction) => void;

// 2. ЗВЕНО 1: авторизация. Без правильного токена цепочка обрывается, дальше запрос не идёт.
const authenticate: Handler = (req, res, next) => {
  if (req.header('authorization') !== 'Bearer secret-token') {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }
  next();
};

// 3. ЗВЕНО 2: валидация тела запроса. Некорректный заказ отклоняется здесь, до создания.
const validateOrder: Handler = (req, res, next) => {
  const { productId, quantity } = req.body ?? {};
  if (typeof productId !== 'string' || !Number.isInteger(quantity) || quantity <= 0) {
    res.status(400).json({ error: 'invalid order' });
    return;
  }
  next();
};

// 4. ЗВЕНО 3: конечный обработчик. Создаёт заказ и отвечает, дальше цепочка не идёт.
const createOrder: Handler = (req, res) => {
  res.status(201).json({ status: 'created', ...req.body });
};

// 5. Сборка: порядок звеньев в маршруте - это и есть цепочка. Поменяли порядок - поменяли поведение.
export function createApp() {
  const app = express();
  app.use(express.json());
  app.post('/orders', authenticate, validateOrder, createOrder);
  return app;
}

// Запуск сервера только при прямом вызове файла, а не при импорте в тестах
if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  createApp().listen(3000, () => console.log('listening on http://localhost:3000'));
}

// 6. Чтобы добавить звено (например, лимит запросов), вставляем его в маршрут перед нужным обработчиком.
// Остальные звенья при этом не меняются.
