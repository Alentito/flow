export default function AboutPage() {
  return (
    <main className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">About</h1>
      <p className="text-lg text-text-muted-light dark:text-text-muted-dark mb-8">
        This platform enables researchers to share, collaborate, and showcase their work in a modern, community-driven environment.
      </p>
      <ul className="list-disc pl-6 text-text-muted-light dark:text-text-muted-dark">
        <li>Blog for research articles and updates</li>
        <li>Project/model showcase with paper links</li>
        <li>Member authentication and permissions</li>
        <li>Draft mode for unpublished work</li>
        <li>Drag-and-drop editor for project pages</li>
      </ul>
    </main>
  );
}
