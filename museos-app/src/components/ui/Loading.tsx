export default function Loading({ text = 'Cargando museos...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-gray-700 border-t-purple-500 rounded-full animate-spin" />
        <span className="absolute inset-0 flex items-center justify-center text-2xl">🏛️</span>
      </div>
      <p className="text-gray-400 text-sm">{text}</p>
    </div>
  );
}
