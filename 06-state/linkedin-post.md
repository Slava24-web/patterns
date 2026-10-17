Pattern #6: **State**.

The problem: an order can be draft, pending, paid, or shipped, and each status accepts different actions. Without the pattern, every handler starts with `if (status === 'paid') ... else if (...)`. A new status means editing every handler, and it's easy to let an invalid transition slip through.

The fix: each status is its own class with two things: the events it accepts and the state it moves to on each event. The store keeps only the current state object and passes events to it. Adding a new status means adding a class, not touching the store or the component.

An underrated benefit: the UI gets its rules for free. The button is enabled when `state.allowed` includes the event, so the component never has to know which action is valid in which status.

When not to use it: with two statuses and one transition, a boolean is enough. The pattern pays off when the statuses multiply and each one changes what the user can do.

Code and a step-by-step exercise in the comments 👇

#react #zustand #typescript #frontend #patterns
