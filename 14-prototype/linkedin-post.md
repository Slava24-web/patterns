Pattern #14: **Prototype**.

The problem: a game spawns enemies. Each enemy needs a geometry, a material, and a set of settings, and building that from scratch for every spawn is slow and repetitive. Copy-pasting the setup code into every spawn point makes the configuration drift apart over time.

The fix: build one configured enemy, the prototype, and copy it for every new enemy with `clone()`. The copy gets its own position, and the prototype stays untouched. three.js does this for every object, so a scene can be filled from one template.

An underrated detail: `clone()` is shallow. The geometry and the material are shared by reference, which saves memory, but it also means that changing the material of one copy changes all of them. If a copy needs its own color, clone its material too.

When not to use it: if objects differ a lot from each other, or building one is cheap, a plain factory function is clearer. Prototype pays off when the template is expensive to set up and the copies are mostly the same.

Code and a step-by-step exercise in the comments 👇

#typescript #threejs #gamedev #patterns
