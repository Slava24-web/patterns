Pattern #9: **Composite**.

The problem: a cart contains single products and bundles, and a bundle can contain products and other bundles. Without the pattern, the total is a function full of `if (item.type === 'bundle')` checks that recurse by hand. Every new item type means updating that function, and it's easy to miss a nested level.

The fix: products (leaves) and bundles (composites) implement the same interface with one method, `price()`. A bundle sums its children by calling `price()` on each one. It doesn't care whether a child is a product or another bundle, so nesting can go as deep as you need.

An underrated detail: the input is validated with zod before the tree is built. The schema is recursive (`z.lazy`), so a bundle can contain bundles in the input too, and a bad price or a discount outside 0–1 is rejected before it reaches the domain objects.

When not to use it: if your data has one level, like a flat list of products, a plain `reduce` is clearer. Composite pays off when the structure is a tree of unknown depth and you want all levels handled by the same code.

Code and a step-by-step exercise in the comments 👇

#typescript #zod #frontend #patterns
