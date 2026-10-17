Pattern #7: **Template Method**.

The problem: three data loaders each fetch from an API, parse the response, and handle errors. Each one copies the same try/catch and the same sequence of calls. Then someone changes the error handling in one loader and forgets the other two.

The fix: a base class owns the skeleton of the algorithm in one method, `load()`. It calls `endpoint()`, then `parse()`, and falls back to `onError()` when something throws. Subclasses implement only the steps that differ. They can't reorder the steps, because the order lives in the base class.

An underrated detail: `onError()` is a hook with a default behavior. The users loader rethrows, while the posts loader returns an empty list. You override only the step that needs to change, and everything else stays the same.

When not to use it: if two functions share one or two lines, extract a helper. Template Method pays off when the steps stay in the same order across many variants, and you want that order enforced in one place.

Code and a step-by-step exercise in the comments 👇

#typescript #axios #frontend #patterns
