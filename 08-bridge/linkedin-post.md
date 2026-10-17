Pattern #8: **Bridge**.

The problem: the app needs several kinds of log records (plain, per-request, error with stack) and several places to write them (pino, the console, later maybe an error tracker). Without the pattern, every combination becomes its own class: `RequestPinoLogger`, `ErrorConsoleLogger`, and so on. Two dimensions multiply into a pile of classes.

The fix: split the two dimensions. The abstraction (`Logger`, `RequestLogger`, `ErrorLogger`) holds a reference to an implementation interface, `LogWriter`. The implementation (`PinoWriter`, `ConsoleWriter`) knows only how to write. The interface between them is the bridge.

An underrated benefit: the two sides grow independently. A new writer works with all loggers at once, and a new logger works with all writers. With 3 loggers and 3 writers you write 6 classes, not 9.

When not to use it: if you have one kind of logger and one destination, a single class is simpler. The bridge pays off when both dimensions can grow.

Code and a step-by-step exercise in the comments 👇

#nodejs #typescript #pino #frontend #patterns
