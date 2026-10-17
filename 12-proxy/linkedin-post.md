Pattern #12: **Proxy**.

The problem: a shopping cart lives in a MobX store, and several parts of the app read and change it. A read-only viewer must not add items, but any component holding the store can call `add()`. The rule "viewers can't change the cart" then depends on every caller remembering it.

The fix: a proxy implements the same `CartApi` interface and sits in front of the store. Reads pass through to the live MobX data. Writes are checked against the caller's role, and a viewer gets an error. The client uses the proxy like the store itself.

An underrated detail: the proxy doesn't copy data. It returns the store's observables, so `autorun` and `observer` components still react to every change. Guarding writes doesn't cost you reactivity.

When not to use it: if every caller has the same rights, the proxy only adds a layer. It also doesn't replace MobX's `enforceActions`, which protects against changes outside actions, not against wrong roles.

Code and a step-by-step exercise in the comments 👇

#typescript #mobx #frontend #patterns
