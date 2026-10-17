// Паттерн: Template Method (Шаблонный метод), пример на axios
// Идея: базовый класс задаёт скелет алгоритма: запрос -> разбор ответа -> обработка ошибки.
// Порядок шагов фиксирован и не меняется в подклассах. Подклассы переопределяют только отдельные шаги.

import axios, { type AxiosInstance } from 'axios';

// 1. ШАБЛОН: базовый класс с шаблонным методом load()
abstract class ApiLoader<TRaw, TResult> {
  constructor(protected readonly http: AxiosInstance) {}

  // Шаблонный метод: порядок шагов задан здесь. Подклассы его не переопределяют.
  async load(): Promise<TResult> {
    try {
      const response = await this.http.get<TRaw>(this.endpoint());
      return this.parse(response.data);
    } catch (error) {
      return this.onError(error);
    }
  }

  // Шаги, которые подкласс обязан реализовать
  protected abstract endpoint(): string;
  protected abstract parse(raw: TRaw): TResult;

  // Хук с поведением по умолчанию: подкласс может переопределить
  protected onError(error: unknown): TResult {
    throw error;
  }
}

// 2. Конкретные загрузчики. Каждый задаёт только свои шаги.
type UserDto = { id: number; name: string; email: string };
type User = { id: number; displayName: string };

class UsersLoader extends ApiLoader<UserDto[], User[]> {
  protected endpoint() {
    return '/users';
  }

  protected parse(raw: UserDto[]): User[] {
    return raw.map((u) => ({ id: u.id, displayName: u.name }));
  }
}

type PostDto = { id: number; title: string };
type Post = { id: number; title: string };

class PostsLoader extends ApiLoader<PostDto[], Post[]> {
  protected endpoint() {
    return '/posts';
  }

  protected parse(raw: PostDto[]): Post[] {
    return raw;
  }

  // Посты не критичны: при ошибке показываем пустой список вместо падения
  protected onError(): Post[] {
    return [];
  }
}

// 3. Использование: один HTTP-клиент на всё приложение, загрузчики используют его
const http = axios.create({ baseURL: 'https://jsonplaceholder.typicode.com', timeout: 5000 });

export async function loadDashboard() {
  const users = await new UsersLoader(http).load();
  const posts = await new PostsLoader(http).load();
  return { users, posts };
}

// 4. Чтобы добавить новый источник данных, достаточно наследника с endpoint() и parse().
// Порядок шагов в load() менять не нужно.
