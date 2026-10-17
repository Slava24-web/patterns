// Паттерн: Adapter (Адаптер), пример на React + Chart.js
// Идея: у нашего приложения свой интерфейс (ChartRenderer), у библиотеки Chart.js свой.
// Адаптер переводит один интерфейс в другой. Компоненты говорят только на "нашем" языке
// и не знают, что под капотом Chart.js.

import { useEffect, useRef } from 'react';
import { Chart, registerables, type ChartConfiguration } from 'chart.js';

Chart.register(...registerables);

// 1. НАШ интерфейс: что нужно приложению. Не зависит от библиотеки.
export type Point = { label: string; value: number };

export interface ChartRenderer {
  // Рисует данные в canvas и возвращает функцию очистки
  render(canvas: HTMLCanvasElement, points: Point[]): () => void;
}

// 2. ADAPTEE: API библиотеки Chart.js. Мы его не меняем и не контролируем.
// new Chart(canvas, { type, data: { labels, datasets }, options }) и chart.destroy()

// 3. ADAPTER: переводит наши Point[] в конфиг Chart.js и управляет жизненным циклом библиотеки
export class ChartJsAdapter implements ChartRenderer {
  constructor(private readonly type: 'bar' | 'line' = 'bar') {}

  render(canvas: HTMLCanvasElement, points: Point[]): () => void {
    const config: ChartConfiguration<'bar' | 'line'> = {
      type: this.type,
      data: {
        labels: points.map((p) => p.label),
        datasets: [{ label: 'Продажи', data: points.map((p) => p.value) }],
      },
      options: { responsive: true, plugins: { legend: { display: false } } },
    };

    const chart = new Chart(canvas, config);

    // Адаптер сам уничтожает график, компонент об этом не думает
    return () => chart.destroy();
  }
}

// 4. КЛИЕНТ: компонент знает только ChartRenderer и Point, про Chart.js не знает ничего
export function SalesChart({ data, renderer }: { data: Point[]; renderer: ChartRenderer }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    return renderer.render(canvasRef.current, data);
  }, [data, renderer]);

  return <canvas ref={canvasRef} />;
}

// 5. Использование: данные в нашей форме, адаптер подставляется снаружи.
// Заменить Chart.js на другую библиотеку можно, написав новый адаптер. SalesChart при этом не меняется.
const sales: Point[] = [
  { label: 'Пн', value: 12 },
  { label: 'Вт', value: 19 },
  { label: 'Ср', value: 7 },
  { label: 'Чт', value: 15 },
  { label: 'Пт', value: 22 },
];

const renderer = new ChartJsAdapter('bar');

export default function Dashboard() {
  return <SalesChart data={sales} renderer={renderer} />;
}
