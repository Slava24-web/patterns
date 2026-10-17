Pattern #17: **Dependency Injection**.

The problem: `OrderService` creates its own `RealPaymentGateway` inside the constructor. Its tests then send real charges, and switching to another payment provider means editing the service. The class decides how its dependencies are built, so it's hard to test and hard to change.

The fix: the class declares what it needs in the constructor, `payments: PaymentGateway`, and the container decides what to pass. In production the container registers the real gateway. In a test, you register a fake, and `OrderService` doesn't change.

An underrated detail: an interface doesn't exist at runtime, so the container needs a token to find the registration. Here it's a string, `PAYMENT_GATEWAY`. Registering a new implementation under the same token is enough to swap it, and every class that injects the token gets the new one.

When not to use it: for a small script with one implementation and no tests, passing the object directly is simpler. A container adds configuration, and it pays off when there are several implementations or the dependencies need to be swapped.

Code and a step-by-step exercise in the comments 👇

#typescript #dependencyinjection #testing #patterns
