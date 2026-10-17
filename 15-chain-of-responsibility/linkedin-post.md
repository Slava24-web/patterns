Pattern #15: **Chain of Responsibility**.

The problem: an order endpoint checks the auth token, validates the body, and then creates the order. Without the pattern, all three checks sit at the top of one handler, with nested `if`s and early returns. Adding a rate limit or a logger means editing that handler, and the checks can't be reused by other endpoints.

The fix: each check is a separate link with the same shape: it either answers the request, or calls `next()` to pass it on. The route lists the links in order, `authenticate`, then `validateOrder`, then `createOrder`. A bad token stops the chain at the first link, and the later links never run.

An underrated detail: the links don't know about each other. Change the order in the route and the behavior changes, without touching the links. Add a rate limiter by inserting it before the others, and no existing link needs to change.

When not to use it: if an endpoint has one check, an `if` at the top of the handler is clearer. The chain pays off when several checks are shared across endpoints and their order matters.

Code and a step-by-step exercise in the comments 👇

#typescript #express #backend #patterns
