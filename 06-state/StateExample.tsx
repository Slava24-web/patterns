// Паттерн: State (Состояние), пример на React + Zustand
// Идея: объект меняет поведение в зависимости от своего состояния.
// Каждое состояние - отдельный класс, который знает, какие события принимает и в какое состояние переходит.
// Zustand хранит только текущее состояние и передаёт событие ему. Ни одного if по статусу в store нет.

import { create } from 'zustand';

// 1. Контракт состояния: все состояния реализуют один интерфейс
type Event = 'SUBMIT' | 'PAY' | 'CANCEL' | 'SHIP';

interface OrderState {
  readonly name: string;
  readonly allowed: Event[];
  // Возвращает следующее состояние. Если событие не разрешено, остаётся в текущем.
  next(event: Event): OrderState;
}

// 2. Конкретные состояния. Каждое знает только свои переходы.
class DraftState implements OrderState {
  readonly name = 'draft';
  readonly allowed: Event[] = ['SUBMIT'];

  next(event: Event): OrderState {
    return event === 'SUBMIT' ? pendingState : this;
  }
}

class PendingState implements OrderState {
  readonly name = 'pending';
  readonly allowed: Event[] = ['PAY', 'CANCEL'];

  next(event: Event): OrderState {
    switch (event) {
      case 'PAY':
        return paidState;
      case 'CANCEL':
        return draftState;
      default:
        return this;
    }
  }
}

class PaidState implements OrderState {
  readonly name = 'paid';
  readonly allowed: Event[] = ['SHIP'];

  next(event: Event): OrderState {
    return event === 'SHIP' ? shippedState : this;
  }
}

class ShippedState implements OrderState {
  readonly name = 'shipped';
  readonly allowed: Event[] = []; // финальное состояние: событий нет

  next(): OrderState {
    return this;
  }
}

const draftState = new DraftState();
const pendingState = new PendingState();
const paidState = new PaidState();
const shippedState = new ShippedState();

// 3. Store: хранит текущее состояние и делегирует ему событие
interface OrderStore {
  state: OrderState;
  send: (event: Event) => void;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  state: draftState,
  send: (event) => set({ state: get().state.next(event) }),
}));

// Подписи кнопок
const events: { event: Event; label: string }[] = [
  { event: 'SUBMIT', label: 'Оформить' },
  { event: 'PAY', label: 'Оплатить' },
  { event: 'CANCEL', label: 'Отменить' },
  { event: 'SHIP', label: 'Отправить' },
];

// 4. Компонент: не знает, что разрешено в каждом состоянии. Смотрит на allowed у текущего.
export default function OrderStatus() {
  const state = useOrderStore((s) => s.state);
  const send = useOrderStore((s) => s.send);

  return (
    <div>
      <p>Статус заказа: <strong>{state.name}</strong></p>

      {events.map(({ event, label }) => (
        <button
          key={event}
          disabled={!state.allowed.includes(event)}
          onClick={() => send(event)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// 5. Чтобы добавить состояние, например "returned", пишем новый класс и один переход из другого состояния.
// Store и компонент при этом не меняются.
