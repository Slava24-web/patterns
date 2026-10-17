// Паттерн: Prototype (Прототип), пример на three.js
// Идея: вместо создания нового объекта с нуля копируем готовый образец (прототип) и меняем в копии только нужное.
// У three.js у каждого объекта есть метод clone(). Он создаёт новый объект той же структуры,
// но геометрию и материал копирует по ссылке, поэтому копии экономят память.

import * as THREE from 'three';

// 1. ПРОТОТИП: один настроенный образец врага. Сборка сложная, поэтому делаем её один раз.
const enemyPrototype = new THREE.Mesh(
  new THREE.BoxGeometry(1, 2, 1),
  new THREE.MeshStandardMaterial({ color: 0x3a7d44 }),
);
enemyPrototype.name = 'enemy';

// 2. КОПИИ: clone() даёт новый объект с теми же свойствами. Позицию меняем уже у копии.
export function spawnEnemy(x: number, z: number): THREE.Mesh {
  const enemy = enemyPrototype.clone();
  enemy.position.set(x, 0, z);
  return enemy;
}

// 3. ОСОБЕННОСТЬ: геометрия и материал общие. Меняем материал одной копии - меняются все.
// Если копии должны различаться цветом, у копии клонируем материал отдельно.
export function spawnRedEnemy(x: number, z: number): THREE.Mesh {
  const enemy = spawnEnemy(x, z);
  enemy.material = (enemy.material as THREE.Material).clone();
  (enemy.material as THREE.MeshStandardMaterial).color.set(0xd94040);
  return enemy;
}

// 4. Использование: из одного прототипа получаем сцену из нескольких врагов.
const scene = new THREE.Scene();
scene.add(spawnEnemy(0, 0), spawnEnemy(3, 0), spawnRedEnemy(6, 0));

console.log('enemies in scene:', scene.children.length);
console.log('prototype still at origin:', enemyPrototype.position.x === 0);

// 5. Чтобы добавить новый тип врага, создаём новый прототип с другой геометрией.
// spawnEnemy и сцена при этом не меняются.
