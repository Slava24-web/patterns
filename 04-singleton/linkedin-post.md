Pattern #4: **Singleton**.

The problem: the app needs one source of truth for its state, but nothing stops a component from creating its own copy. Two copies means two states, and the header counter and the cart quietly disagree.

The fix: create the Redux store once, at module level. Every import gets the same object, and `Provider` passes it down the tree. Components never call `configureStore` themselves; they read and change state through `useSelector` and `useDispatch`.

An underrated detail: the singleton is not a global variable you mutate directly. The only way to change state is `dispatch(action)`, so every change goes through one place, and you can log or replay it.

When not to use it: a single-instance store is a constraint, not a goal. Local UI state, like an open dropdown, belongs in the component. Keep the shared store for data that several parts of the app really need.

Code and a step-by-step exercise in the comments 👇

#react #redux #typescript #frontend #patterns
