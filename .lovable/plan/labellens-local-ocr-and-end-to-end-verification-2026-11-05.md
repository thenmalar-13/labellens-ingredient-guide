# LabelLens: local OCR and end-to-end verification

## Goal
Add real ingredient-label text extraction to the existing photo scan flow, then verify the complete workflow without changing the visual design, analysis safeguards, authentication, scans table, or RLS.

## User-facing behavior
- Run OCR locally in the browser using a free open-source OCR engine; do not upload label photos or add a paid service.
- Accept browser-decodable JPEG/PNG photos, show recognition progress and extracted text, and require users to review/edit the ingredient list before analysis.
- Keep photo selection and camera capture. Clearly explain unsupported HEIC or undecodable files, blurry/unreadable images, and provide a manual-paste path.
- Never infer or fill missing text. Empty/low-confidence OCR must stop for manual entry.

## Implementation
- Add the smallest necessary OCR dependency and isolate its worker/runtime from server rendering.
- Pass recognized text through the existing ingredient parser and editable review screen; preserve the current personal-care analysis, food unsupported state, save/reopen flow, auth, and database protections.
- Add focused tests for OCR result parsing/error behavior where the implementation permits deterministic tests.
- Record the browser-local OCR constraint in project guidance; do not alter migrations or authentication.

## Verification
- Check the existing suite/typecheck/build before editing, then run the complete Vitest suite, typecheck, and production build after edits.
- Use a clear synthetic product-label image and invalid, unreadable, and unsupported-image cases in the preview.
- Verify edits reach analysis, unknown ingredients remain insufficient-evidence, and food remains unsupported.
- Verify signed-out history is gated. If an authenticated test session is available, save/reopen and clean up only the test scan; otherwise report the blocker.
- Inspect existing deployed database policies without changing them. Do not claim cross-user RLS verification based only on UI behavior; report any unavailable independent check.

## Limitations to report
OCR quality depends on focus, lighting, text size, and browser/device resources. Local worker and English language data require a one-time download; photos remain on-device. HEIC support depends on browser decoding and should be rejected clearly when unsupported. No paid OCR or service is enabled.
