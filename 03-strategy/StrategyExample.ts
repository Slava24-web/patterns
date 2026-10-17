// Паттерн: Strategy (Стратегия), пример на Angular
// Идея: один и тот же шаг (расчёт доставки) можно выполнить разными алгоритмами.
// Компонент не содержит if/switch по способу доставки: он держит выбранную стратегию и делегирует ей расчёт.
// Стратегию можно поменять на ходу, сам компонент при этом не меняется.

import { Component, computed, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';

// 1. Контракт стратегии: все алгоритмы реализуют один интерфейс
export interface ShippingStrategy {
  readonly name: string;
  calculate(weightKg: number, distanceKm: number): number;
}

// 2. Конкретные стратегии. Каждая знает только свою формулу.
export const standardShipping: ShippingStrategy = {
  name: 'Стандартная',
  calculate: (weight, distance) => 200 + weight * 30 + distance * 2,
};

export const expressShipping: ShippingStrategy = {
  name: 'Экспресс',
  calculate: (weight, distance) => 500 + weight * 50 + distance * 5,
};

export const pickupShipping: ShippingStrategy = {
  name: 'Самовывоз',
  calculate: () => 0,
};

// Список стратегий: данные, а не if по названиям
const strategies: ShippingStrategy[] = [standardShipping, expressShipping, pickupShipping];

// 3. КОНТЕКСТ: компонент хранит текущую стратегию и делегирует ей расчёт
@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    <h3>Доставка</h3>

    <label>
      Способ:
      <select (change)="onStrategyChange($event)">
        @for (s of strategies; track s.name) {
          <option [value]="s.name" [selected]="s.name === strategy().name">{{ s.name }}</option>
        }
      </select>
    </label>

    <label>
      Вес, кг:
      <input type="number" [value]="weight()" (input)="onWeightChange($event)" />
    </label>

    <p>Стоимость: <strong>{{ cost() | number: '1.0-0' }} ₽</strong></p>
  `,
})
export class CheckoutComponent {
  readonly strategies = strategies;

  // Текущая стратегия в signal. Смена стратегии = смена алгоритма.
  readonly strategy = signal<ShippingStrategy>(standardShipping);
  readonly weight = signal(2);
  readonly distance = signal(120);

  // computed пересчитает стоимость сам, когда изменится стратегия или входные данные
  readonly cost = computed(() => this.strategy().calculate(this.weight(), this.distance()));

  onStrategyChange(event: Event) {
    const name = (event.target as HTMLSelectElement).value;
    const found = this.strategies.find((s) => s.name === name);
    if (found) this.strategy.set(found);
  }

  onWeightChange(event: Event) {
    this.weight.set(Number((event.target as HTMLInputElement).value));
  }
}

// 4. Чтобы добавить новый способ доставки, достаточно описать стратегию и добавить её в список.
// CheckoutComponent при этом не меняется:
//
// const courierShipping: ShippingStrategy = {
//   name: 'Курьер',
//   calculate: (weight, distance) => 350 + weight * 40 + distance * 3,
// };
//
// const strategies = [standardShipping, expressShipping, pickupShipping, courierShipping];
