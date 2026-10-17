// Паттерн: Singleton (Одиночка), пример на Redux
// Идея: во всём приложении ровно один экземпляр хранилища (store).
// Модуль выполняется один раз, и его экспорт кэшируется, поэтому все импорты получают один и тот же store.
// Компоненты не создают store сами: они получают его через Provider и хуки.

import { configureStore, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { Provider, useDispatch, useSelector } from 'react-redux';

// 1. Состояние и редьюсер (slice): единственное место, где меняется состояние
const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementBy: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
  },
});

export const { increment, decrement, incrementBy } = counterSlice.actions;

// 2. SINGLETON: store создаётся один раз на уровне модуля
export const store = configureStore({
  reducer: { counter: counterSlice.reducer },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Типизированные хуки: все компоненты работают с одним и тем же store
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

// 3. Компоненты: ни один не создаёт store, все берут его через хуки
function Counter() {
  const value = useAppSelector((state) => state.counter.value);
  const dispatch = useAppDispatch();

  return (
    <div>
      <button onClick={() => dispatch(decrement())}>-</button>
      <span>{value}</span>
      <button onClick={() => dispatch(increment())}>+</button>
    </div>
  );
}

function CounterLabel() {
  // Второй компонент видит то же состояние: store один на всё приложение
  const value = useAppSelector((state) => state.counter.value);

  return <p>Значение в шапке: {value}</p>;
}

// 4. Корень приложения: Provider передаёт store один раз, на вершине дерева
export default function App() {
  return (
    <Provider store={store}>
      <Counter />
      <CounterLabel />
    </Provider>
  );
}

// 5. Почему это синглтон: при любом импорте './store' получаем тот же объект.
// Если создать второй store вручную, у него будет отдельное состояние, и компоненты рассинхронизируются.
// Поэтому store создаётся один раз в модуле, а не внутри компонента.
