Pattern #5: **Adapter**.

The problem: a dashboard component calls Chart.js directly. It builds the `datasets`, `labels`, and `options` objects by hand, and it calls `chart.destroy()` itself. Now the component depends on the library. Switching to another chart library means rewriting every component that draws a chart.

The fix: define the interface your app needs, here `ChartRenderer.render(canvas, points)`. Then write an adapter that translates your data into the library's config and returns a cleanup function. The component only knows `Point[]` and the renderer, not Chart.js.

An underrated benefit: the adapter owns the library's lifecycle. The component just returns the cleanup from `useEffect`, and the chart is destroyed on unmount, the same as any other resource.

When not to use it: if you use a library in one place and don't plan to replace it, a direct call is fine. An adapter adds a layer, and that layer pays off when the library is used in many places or might be swapped out.

Code and a step-by-step exercise in the comments 👇

#react #typescript #chartjs #frontend #patterns
