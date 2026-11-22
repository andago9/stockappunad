<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Auth and product data are mock, persisted in localStorage (src/lib/auth.ts, src/lib/products.ts); protected pages live under src/routes/_authenticated (ssr:false) — prototype stage, swap for Lovable Cloud later.
- Sales use the existing browser-only prototype store; capture immutable line prices, revalidate stock at confirmation, and record one inventory movement per product so reports use historical revenue, not current catalog prices.
- Report calculations and CSV encoding live in browser-safe shared helpers so on-screen totals and filtered downloads use the same data; inventory valuation is selling-price value, not cost or profit.
