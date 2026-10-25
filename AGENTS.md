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
- Scan history persists in the `public.scans` table. Access goes through server functions in `src/lib/scans.functions.ts` (`requireSupabaseAuth`); ownership is enforced by RLS policies (`auth.uid() = user_id`) and the user ID is always taken from the authenticated session, never from client input. The in-memory draft store in `src/lib/scan-store.ts` still holds the active scan flow.
