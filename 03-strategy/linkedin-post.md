Pattern #3: **Strategy**.

The problem: a checkout component picks a shipping method with `if (method === 'express') ... else if (...)`. Every new delivery option means editing the component, and its logic grows with each branch.

The fix: each shipping method is an object with the same `calculate()` method. The component holds the chosen strategy and delegates the calculation to it. Switching the method is one `signal.set()`, and `computed` recalculates the price by itself.

An underrated benefit: each strategy is a pure function of its inputs, so you can unit-test every formula on its own, without rendering the component.

When not to use it: if there are two fixed variants that never change, a ternary is enough. Strategy pays off when the list of algorithms grows or changes.

Code and a step-by-step exercise in the comments 👇

#angular #typescript #frontend #patterns
