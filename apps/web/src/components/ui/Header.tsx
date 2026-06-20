import { CitySearch } from './CitySearch';

export function Header() {
  return (
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-white/10 bg-black/20 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
        <h1 className="text-lg font-medium tracking-tight text-white">Weather Glass</h1>
        <CitySearch />
      </div>
    </header>
  );
}
