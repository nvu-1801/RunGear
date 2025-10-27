export default function Loading() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8 animate-pulse">
        <div className="md:w-1/2 bg-gray-200 rounded-2xl h-80" />
        <div className="md:w-1/2 space-y-4">
          <div className="h-8 bg-gray-200 rounded w-2/3" />
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-20 bg-gray-100 rounded" />
          <div className="h-10 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    </main>
  );
}
