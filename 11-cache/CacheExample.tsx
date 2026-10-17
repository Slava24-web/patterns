// Паттерн: Cache (Кэш), пример на React + TanStack Query
// Идея: данные с сервера хранятся в кэше по ключу. Пока запись свежая, повторный запрос не идёт в сеть.
// После изменения данных кэш помечаем устаревшим и библиотека сама перечитывает нужный ключ.

import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

export type Product = { id: string; name: string; price: number };

// 1. ИСТОЧНИК ДАННЫХ: имитация API. Считаем запросы, чтобы видеть, что дошло до сервера.
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const api = {
  requests: 0,
  rows: new Map<string, Product>([
    ['coffee', { id: 'coffee', name: 'Кофе', price: 500 }],
    ['tea', { id: 'tea', name: 'Чай', price: 300 }],
  ]),

  async getProduct(id: string): Promise<Product> {
    this.requests++;
    await delay(50);
    const product = this.rows.get(id);
    if (!product) throw new Error(`Unknown product: ${id}`);
    return product;
  },

  async updatePrice(id: string, price: number): Promise<Product> {
    await delay(50);
    const product = this.rows.get(id);
    if (!product) throw new Error(`Unknown product: ${id}`);
    const updated = { ...product, price };
    this.rows.set(id, updated);
    return updated;
  },
};

// 2. КЛЮЧИ КЭША: одинаковый ключ = одна запись в кэше. Ключ строится функцией, чтобы не опечататься.
export const productKeys = {
  detail: (id: string) => ['product', id] as const,
};

// 3. ЧТЕНИЕ ИЗ КЭША: useQuery сам решает, идти ли в сеть.
// staleTime - сколько запись считается свежей (здесь минуту). В это время запрос берётся из кэша.
export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => api.getProduct(id),
    staleTime: 60_000,
  });
}

// 4. ЗАПИСЬ: после успешного изменения помечаем ключ устаревшим. Активные компоненты перечитают данные.
export function useChangePrice(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (price: number) => api.updatePrice(id, price),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.detail(id) }),
  });
}

// 5. Компонент: не знает ни про сеть, ни про кэш. Получает данные и вызывает мутацию.
export function ProductCard({ id }: { id: string }) {
  const product = useProduct(id);
  const changePrice = useChangePrice(id);

  if (!product.data) {
    return <p>Загрузка...</p>;
  }

  return (
    <div>
      <p>
        {product.data.name}: <strong>{product.data.price}</strong>
      </p>
      <button onClick={() => changePrice.mutate(product.data.price + 50)}>+50</button>
    </div>
  );
}

// 6. Корень приложения: QueryClient создаётся один раз и хранит кэш для всего дерева.
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ProductCard id="coffee" />
    </QueryClientProvider>
  );
}

// 7. Чтобы добавить новый источник данных, пишем новый хук с useQuery и своим ключом.
// Кэш, повторные запросы и инвалидация работают для него так же.
