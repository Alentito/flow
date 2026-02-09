export default function ShowcasePage() {
  return (
    <main className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Showcase</h1>
      <p className="text-lg text-text-muted-light dark:text-text-muted-dark mb-8">
        Discover featured models and research highlights. Each project links to its paper.
      </p>
      {/* Showcase items will be listed here */}
      <div className="border rounded-lg p-6 text-center text-gray-400 dark:text-gray-500">
        No featured projects yet. Coming soon!
      </div>
    </main>
  );
}
