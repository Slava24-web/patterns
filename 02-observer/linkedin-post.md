Pattern #2: **Observer**.

The problem: a shopping cart is updated by a button, but a badge in the header, an event log, and a counter all need to react to the change. If the button calls each of them directly, it has to know about all of them. Add one more consumer and you edit the button again.

The fix: the cart (the subject) keeps a list of subscribers and calls `notify()` when its state changes. Each component subscribes on mount and unsubscribes on unmount. The button doesn't know who is listening.

An underrated detail: always return an unsubscribe function. Without it, unmounted components keep receiving updates, and that's a memory leak.

Vue is built on this idea itself: `ref`, `computed`, and `watch` track dependencies under the hood. Writing the subscription by hand shows what happens behind them.

When not to use it: if only one component needs the data, a plain `subscribe` is overkill. For shared app state, a store like Pinia already covers it.

Code and a step-by-step exercise in the comments 👇

#vue #javascript #frontend #patterns
