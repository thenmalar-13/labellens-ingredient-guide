import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState, type DragEvent } from "react";
import { Camera, ImageUp, X } from "lucide-react";
import { CategoryToggle, Page, Steps, btnGhost, btnPrimary } from "@/components/site";
import { cn } from "@/lib/utils";
import { setDraft, useDraft } from "@/lib/scan-store";
import { recognizeIngredientLabel } from "@/lib/ocr";

export const Route = createFileRoute("/scan")({
  head: () => ({
    meta: [
      { title: "Scan a label — LabelLens" },
      { name: "description", content: "Upload or take a photo of an ingredient label." },
      { property: "og:title", content: "Scan a label — LabelLens" },
      { property: "og:description", content: "Upload or take a photo of an ingredient label." },
    ],
  }),
  component: ScanPage,
});

const MAX_MB = 10;

function ScanPage() {
  const draft = useDraft();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const requestRef = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recognizing, setRecognizing] = useState(false);
  const [progress, setProgress] = useState(0);

  function handleFile(file?: File) {
    setError(null);
    if (!file) return;
    const clearExisting = () => {
      requestRef.current += 1;
      setRecognizing(false);
      if (draft.imagePreview) URL.revokeObjectURL(draft.imagePreview);
    };
    if (!file.type.startsWith("image/")) {
      const message = "Please choose a valid image file, such as a JPEG or PNG. You can enter the ingredients manually instead.";
      clearExisting();
      setError(message);
      setDraft({ source: "photo", imageName: null, imagePreview: null, imageFile: null, ocrText: "", ocrConfidence: null, ocrError: message, ingredients: [] });
      return;
    }
    if (file.size === 0) {
      const message = "This image file is empty or invalid. Choose another image or enter the ingredients manually.";
      clearExisting();
      setError(message);
      setDraft({ source: "photo", imageName: null, imagePreview: null, imageFile: null, ocrText: "", ocrConfidence: null, ocrError: message, ingredients: [] });
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      const message = `Image must be under ${MAX_MB} MB. Choose a smaller image or enter the ingredients manually.`;
      clearExisting();
      setError(message);
      setDraft({ source: "photo", imageName: null, imagePreview: null, imageFile: null, ocrText: "", ocrConfidence: null, ocrError: message, ingredients: [] });
      return;
    }
    if (draft.imagePreview) URL.revokeObjectURL(draft.imagePreview);
    const requestId = ++requestRef.current;
    setRecognizing(true);
    setProgress(0);
    setDraft({
      source: "photo",
      imageName: file.name,
      imagePreview: URL.createObjectURL(file),
      imageFile: file,
      ocrText: null,
      ocrConfidence: null,
      ocrError: null,
      ingredients: [],
    });
    void recognizeIngredientLabel(file, (value) => {
      if (requestId === requestRef.current) setProgress(value);
    }).then((result) => {
      if (requestId !== requestRef.current) return;
      setDraft({ ocrText: result.text, ingredients: result.ingredients, ocrConfidence: result.confidence, ocrError: null });
    }).catch((cause: unknown) => {
      if (requestId !== requestRef.current) return;
      const message = cause instanceof Error ? cause.message : "The photo could not be read. Enter the ingredients manually.";
      setError(message);
      setDraft({ ocrText: "", ocrConfidence: null, ocrError: message, ingredients: [] });
    }).finally(() => {
      if (requestId === requestRef.current) setRecognizing(false);
    });
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  }

  return (
    <Page eyebrow="Scan a label" title="Upload a photo of the ingredient list" intro="Make sure the ingredient panel is in focus, well lit, and fills most of the frame.">
      <Steps current={1} />
      <div className="mb-6">
        <p className="mb-2 text-sm font-medium text-foreground">Product type</p>
        <CategoryToggle value={draft.category} onChange={(category) => setDraft({ category })} />
      </div>

      {draft.imagePreview ? (
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <img src={draft.imagePreview} alt="Selected label" className="max-h-[420px] w-full object-contain bg-secondary" />
          <div className="flex items-center justify-between gap-3 p-4">
            <p className="truncate text-sm text-muted-foreground">{draft.imageName}</p>
            <button type="button" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground" onClick={() => {
              requestRef.current += 1;
              setRecognizing(false);
              setError(null);
              if (draft.imagePreview) URL.revokeObjectURL(draft.imagePreview);
              setDraft({ imagePreview: null, imageName: null, imageFile: null, ocrText: null, ocrConfidence: null, ocrError: null, ingredients: [] });
            }}>
              <X className="h-4 w-4" aria-hidden /> Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-colors",
            dragging ? "border-primary bg-accent" : "border-border bg-card",
          )}
        >
          <ImageUp className="h-10 w-10 text-primary" aria-hidden />
          <p className="mt-4 font-medium text-foreground">Drag and drop a photo here</p>
          <p className="mt-1 text-sm text-muted-foreground">JPG, PNG or HEIC, up to {MAX_MB} MB</p>
          <div className="mt-6 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <button type="button" className={cn(btnPrimary, "sm:hidden")} onClick={() => cameraRef.current?.click()}>
              <Camera className="h-4 w-4" aria-hidden /> Take a photo
            </button>
            <button type="button" className={btnGhost} onClick={() => inputRef.current?.click()}>
              Choose from device
            </button>
          </div>
          <input ref={inputRef} type="file" accept="image/*" className="sr-only" aria-label="Choose label photo" onChange={(e) => handleFile(e.target.files?.[0])} />
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="sr-only" aria-label="Take label photo" onChange={(e) => handleFile(e.target.files?.[0])} />
        </div>
      )}
      {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
      {recognizing && (
        <div className="mt-4" aria-live="polite" aria-label="Reading label text">
          <div className="mb-2 flex justify-between text-sm text-muted-foreground">
            <span>Reading label on this device…</span><span>{Math.round(progress * 100)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
        </div>
      )}
      {!recognizing && draft.ocrText !== null && !error && (
        <p className="mt-4 text-sm text-muted-foreground" role="status">Text read locally. You can review and correct every ingredient before analysis.</p>
      )}

      <div className="mt-8 flex justify-end">
        <button type="button" disabled={recognizing || (!draft.imagePreview && !draft.ocrError)} className={btnPrimary} onClick={() => {
          if (!draft.imageFile && !draft.ocrError) return;
          if (!draft.imageFile) setDraft({ source: "photo", ocrText: "", ingredients: [] });
          navigate({ to: "/review" });
        }}>
          {recognizing ? "Reading label…" : draft.ocrError ? "Enter ingredients manually" : "Continue to review"}
        </button>
      </div>
    </Page>
  );
}
