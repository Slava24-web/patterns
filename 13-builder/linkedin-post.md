Pattern #13: **Builder**.

The problem: a function builds an orders query from optional filters: status, minimum total, date, sorting, limit. Without the pattern, you get either a function with a dozen parameters, most of them `undefined`, or a chain of `if` blocks that add conditions to an object by hand. Both are hard to read, and a wrong field name is easy to miss.

The fix: a builder collects the parts one call at a time. Each method adds one condition and returns the builder, so the calls chain. The caller adds only what it needs, in any order. `build()` at the end returns the finished query, here built with mongoose.

An underrated detail: the builder doesn't run the query. It returns a mongoose `Query` object you can inspect with `getFilter()` and `getOptions()`, and you can test the result without connecting to a database.

When not to use it: if a query has two or three fields that are always required, a plain function is clearer. Builder pays off when the conditions are optional and their combinations vary.

Code and a step-by-step exercise in the comments 👇

#typescript #mongoose #backend #patterns
