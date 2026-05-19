# Show/Hide Password Toggle

**Date:** 2026-05-19
**Status:** Approved
**Affected file:** [src/app/admin/page.tsx](../../../src/app/admin/page.tsx)

## Problem

The admin panel has three password inputs that mask the user's typing with `type="password"`. There is no way for the user to verify what they have typed before submitting. This causes mistyped passwords during login and silent mismatches when setting a new password in the change-password modal.

## Goal

Add a click-to-toggle eye icon to each password input so the user can show or hide their input.

## Scope

Three inputs in `src/app/admin/page.tsx`:

1. **Login screen** — main password field (lines 437–445)
2. **Change Password modal** — New Password (lines 538–545)
3. **Change Password modal** — Confirm Password (lines 549–555)

No other files are touched. No API changes. No new dependencies.

## Design

### State

Three independent boolean flags inside `AdminPage`:

```ts
const [showLoginPwd, setShowLoginPwd] = useState(false);
const [showNewPwd, setShowNewPwd] = useState(false);
const [showConfirmPwd, setShowConfirmPwd] = useState(false);
```

Independent state is intentional: revealing one field must not reveal the others. In particular, the "New Password" and "Confirm Password" toggles must be independent so the user can verify the confirmation actually matches what they typed.

### Markup pattern

Each password field becomes a `relative` wrapper containing the existing `<input>` (with extra right padding) and an absolutely positioned `<button type="button">` that swaps the icon and the input's `type` attribute.

```tsx
<div className="relative">
  <input
    type={showLoginPwd ? "text" : "password"}
    /* ...existing props, with pr-12 added to className... */
  />
  <button
    type="button"
    onClick={() => setShowLoginPwd((v) => !v)}
    aria-label={showLoginPwd ? "Hide password" : "Show password"}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#D4AF37] transition-colors"
  >
    {showLoginPwd ? <EyeOffIcon /> : <EyeIcon />}
  </button>
</div>
```

`type="button"` is **critical** on the login screen — the form has `onSubmit={handleLogin}`, and without it the toggle button would default to `type="submit"` and submit the form on every click.

### Icons

Two inline SVG icons defined locally in the file (consistent with the existing pattern — the file already uses many inline SVGs and does not import an icon library):

- **EyeIcon** — Heroicons outline "eye" path
- **EyeOffIcon** — Heroicons outline "eye-slash" path

Sized `w-5 h-5` to match the existing icon sizes used in the header.

### Styling

- Toggle button color: `text-gray-500` default, `hover:text-[#D4AF37]` to match the admin panel's gold accent.
- Input right padding: `pr-12` on the login input (which uses `px-4 py-3`) and `pr-10` on the modal inputs (which use `px-3 py-2`) so the icon does not overlap the typed text.
- Modal toggle button uses `right-2` to fit within the tighter padding; login toggle uses `right-3`.

## Non-Goals

- **No `PasswordInput` shared component.** Three call sites with slightly different sizing do not justify the abstraction. Inline implementations are easier to read than a wrapper component with sizing props.
- **No auto re-mask after N seconds.** Standard click-to-toggle is what users expect; a timeout would be surprising.
- **No persistence across page reloads or modal closes.** State resets to `false` (masked) when the component remounts or the modal opens, which is the safe default.
- **No keyboard shortcut.** Click-only is sufficient.

## Testing Plan

Manual verification only (the admin page has no existing test suite):

1. **Login toggle**
   - Type a password, click the eye icon → text becomes visible
   - Click again → text becomes masked
   - Click the eye icon → form does **not** submit (key regression to check)
   - Press Enter while focused on the input → form **does** submit
2. **Change-password modal**
   - Open modal, type in "New Password", click its eye → only that field unmasks
   - Type in "Confirm Password", click its eye → only that field unmasks; New Password stays in its current state
   - Close and reopen the modal → both toggles reset to masked
3. **Visual**
   - Eye icon is visible in both masked and unmasked states
   - Icon does not overlap typed text in any of the three inputs
   - Hover state shows the gold `#D4AF37` color

## Risks

- **Form submission bug** if `type="button"` is omitted on the login toggle. Mitigated by explicit attribute and a test-plan item.
- **Layout shift** if right padding is wrong. Mitigated by checking each input's existing size class and adding padding to match.
