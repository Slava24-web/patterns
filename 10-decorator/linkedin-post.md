Pattern #10: **Decorator**.

The problem: a signup endpoint sends a welcome email. Now you need logging, then retries when the mail server is flaky. Without the pattern, each concern goes inside the service class, so the class grows, and the retry loop gets mixed with the sending logic.

The fix: every layer implements the same `Notifier` interface and wraps the one below it. The core `EmailNotifier` only sends. `RetryNotifier` adds up to three attempts on top of it, and `LoggingNotifier` wraps that. In NestJS, the chain is built once in a provider factory, so the controller injects `NOTIFIER` and never sees the layers.

An underrated detail: retries and logging don't need to know about each other. You can swap their order, or add a timeout layer, without touching `EmailNotifier` or the controller.

When not to use it: for a single extra behavior, a plain `try/catch` in the service is simpler. Decorators pay off when several cross-cutting concerns need to be combined in different orders.

Code and a step-by-step exercise in the comments 👇

#nestjs #typescript #backend #patterns
