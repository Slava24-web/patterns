Pattern #16: **Command**.

The problem: a note editor handles `append`, `delete`, and `undo` as separate functions. Undo has to know how each action changed the text, so every new action means another `if` in the undo code, and the history of changes is just a copy of the text, which is wasteful and hard to reason about.

The fix: each action becomes an object with two methods, `execute()` and `undo()`. The object remembers what it needs to reverse itself, for example the deleted character. The history stores these objects in a stack. Undo pops the last one and calls its `undo()`, with no knowledge of what that action did.

An underrated detail: the command objects are data you can keep, queue, log, or replay. In this example the CLI creates a command for each `note` subcommand and hands it to the history, so the same mechanism works for keyboard shortcuts, a remote API, or a batch file.

When not to use it: if the app has one action and no undo, a plain function is enough. The pattern pays off when actions need undo, a history, or deferred execution.

Code and a step-by-step exercise in the comments 👇

#typescript #commander #cli #patterns
