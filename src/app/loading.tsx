export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative flex items-center justify-center">
        <div className="absolute h-16 w-16 animate-ping rounded-full bg-primary/20" />
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
      </div>
      <p className="mt-4 text-sm font-medium text-muted-foreground animate-pulse font-display">
        Optimizing matches...
      </p>
    </div>
  );
}
