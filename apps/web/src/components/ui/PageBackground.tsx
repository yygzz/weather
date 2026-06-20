export function PageBackground({ weatherType = 'default' }: { weatherType?: string }) {
  const gradients: Record<string, string> = {
    default: 'from-slate-900 via-purple-900 to-slate-900',
    sunny: 'from-orange-900 via-amber-800 to-blue-900',
    cloudy: 'from-slate-800 via-gray-700 to-blue-900',
    rainy: 'from-slate-900 via-blue-900 to-cyan-900',
    snowy: 'from-slate-800 via-blue-100 to-slate-300',
    night: 'from-indigo-950 via-purple-950 to-slate-900',
  };

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradients[weatherType] || gradients.default} animate-gradient-flow bg-[length:400%_400%]`}
      />
      <div className="absolute inset-0 bg-black/20" />
    </div>
  );
}
