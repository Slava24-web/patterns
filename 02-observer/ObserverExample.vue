<!-- Паттерн: Observer (Наблюдатель), пример на Vue.js -->
<!-- Идея: есть Subject (источник состояния). Он хранит список подписчиков и оповещает их при изменении.
     Подписчики не знают друг о друге и не знают, как устроен источник. Они только подписываются и получают уведомления. -->

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

// 1. Контракт наблюдателя: это функция, которую вызовут при каждом изменении
type Observer<T> = (value: T) => void;

// 2. SUBJECT: хранит подписчиков и оповещает их. Ничего не знает о конкретных компонентах.
class Subject<T> {
  private observers = new Set<Observer<T>>();

  subscribe(observer: Observer<T>): () => void {
    this.observers.add(observer);
    // Возвращаем функцию отписки, чтобы не копить подписчиков после размонтирования
    return () => {
      this.observers.delete(observer);
    };
  }

  notify(value: T) {
    this.observers.forEach((observer) => observer(value));
  }
}

// 3. Источник: одна корзина на все компоненты приложения
const cart = new Subject<string[]>();
const items = ref<string[]>([]);

const products = ['Кофе', 'Чай', 'Печенье'];

function addItem(name: string) {
  items.value = [...items.value, name];
  // Меняем состояние и сообщаем всем подписчикам. Кто подписан, тот и отреагирует.
  cart.notify(items.value);
}

// 4. НАБЛЮДАТЕЛИ: каждый реагирует на изменения по-своему
const badgeCount = ref(0);
const log = ref<string[]>([]);

const unsubscribers: Array<() => void> = [];

onMounted(() => {
  // Наблюдатель 1: бейдж с количеством товаров
  unsubscribers.push(
    cart.subscribe((list) => {
      badgeCount.value = list.length;
    }),
  );

  // Наблюдатель 2: журнал событий
  unsubscribers.push(
    cart.subscribe((list) => {
      log.value.push(`Корзина изменилась, товаров: ${list.length}`);
    }),
  );
});

// Отписываемся при уничтожении компонента, иначе подписчики останутся в памяти
onUnmounted(() => {
  unsubscribers.forEach((unsubscribe) => unsubscribe());
});

// 5. Vue уже использует Observer внутри (ref, computed, watch отслеживают зависимости).
// Здесь показан сам паттерн: явная подписка и явное оповещение.
</script>

<template>
  <div>
    <h3>Магазин</h3>

    <!-- Источник: кнопки меняют состояние корзины -->
    <button v-for="product in products" :key="product" @click="addItem(product)">
      Добавить: {{ product }}
    </button>

    <!-- Наблюдатели: обновляются без прямых вызовов из addItem -->
    <p>Бейдж корзины: <strong>{{ badgeCount }}</strong></p>
    <p>Товары: {{ items.join(', ') || '—' }}</p>

    <ul>
      <li v-for="(entry, index) in log" :key="index">{{ entry }}</li>
    </ul>
  </div>
</template>
