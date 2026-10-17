Pattern #11: **Cache**.

The problem: a product card fetches its data in a `useEffect`. Each time the card mounts, the same request goes to the server again. You also add a `loading` flag, an `error` flag, and a manual refresh after every update. The component ends up managing the cache by hand.

The fix: the data lives in a query cache under a key, like `['product', 'coffee']`. `useQuery` reads from the cache while the entry is fresh, and fetches only when it's stale or missing. After a change, `useMutation` calls `invalidateQueries` for that key, and the library refetches the data on its own.

An underrated detail: `staleTime` is the cache lifetime in the library's terms. Within that window, mounting the same component again doesn't touch the network. Outside it, the data is served from the cache and refreshed in the background.

When not to use it: if the data is local UI state, or the page loads once and never changes, a plain `useState` is enough. A query cache pays off when the same server data appears in several components.

Code and a step-by-step exercise in the comments 👇

#react #tanstackquery #typescript #frontend #patterns
