import { Leaf } from 'lucide-react';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
            <Leaf className="h-6 w-6 text-primary" />
          </div>
          <h1 className="font-headline text-2xl font-bold">
            AgriSage
          </h1>
        </div>
      </header>
      <main className="flex flex-1 justify-center p-4 md:p-6">
        <div className="w-full max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
}
