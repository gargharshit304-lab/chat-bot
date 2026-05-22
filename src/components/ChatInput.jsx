import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Cpu, Plus, Search, SendHorizontal } from 'lucide-react';

function formatSizeLabel(model) {
  return model.sizeLabel || 'Unknown size';
}

export default function ChatInput({ onSend, disabled, models, selectedModel, onSelectModel, ollamaConnected }) {
  const [value, setValue] = useState('');
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const selectorRef = useRef(null);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target)) {
        setSelectorOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  const selected = useMemo(
    () => models.find((model) => model.name === selectedModel),
    [models, selectedModel]
  );

  const filteredModels = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) {
      return models;
    }

    return models.filter((model) => model.name.toLowerCase().includes(query));
  }, [models, searchValue]);

  const submit = (event) => {
    event.preventDefault();
    if (disabled) {
      return;
    }
    const nextValue = value.trim();
    if (!nextValue) return;
    onSend(nextValue);
    setValue('');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit(event);
    }
  };

  return (
    <form onSubmit={submit} className="sticky bottom-0 z-20 border-t border-white/5 bg-black px-4 pb-4 pt-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl items-center gap-2 rounded-[1.4rem] border border-white/10 bg-black px-3 py-3 shadow-glow">
        <button
          type="button"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black text-white transition hover:border-white/20 hover:bg-white/5"
          aria-label="Attach"
        >
          <Plus className="h-4 w-4" />
        </button>

        <div ref={selectorRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setSelectorOpen((value) => !value)}
            className="inline-flex h-11 min-w-[180px] items-center gap-2 rounded-2xl border border-white/10 bg-black px-4 text-left text-sm text-white transition hover:border-white/20 hover:bg-white/5"
          >
            <Cpu className="h-4 w-4 text-white/65" />
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="truncate">{selected?.name || 'Select model'}</span>
              <span className="text-[11px] uppercase tracking-[0.22em] text-white/40">
                {selected?.running ? 'Running' : ollamaConnected ? 'Available' : 'Offline'}
              </span>
            </span>
            <span className={['h-2 w-2 rounded-full', selected?.running ? 'bg-emerald-400' : ollamaConnected ? 'bg-white/30' : 'bg-rose-400'].join(' ')} />
            <ChevronDown className={['h-4 w-4 text-white/45 transition-transform', selectorOpen ? 'rotate-180' : ''].join(' ')} />
          </button>

          <div className={['absolute bottom-full left-0 mb-3 w-[320px] origin-bottom-left rounded-3xl border border-white/10 bg-black p-3 shadow-glow transition duration-200', selectorOpen ? 'pointer-events-auto translate-y-0 scale-100 opacity-100' : 'pointer-events-none translate-y-2 scale-95 opacity-0'].join(' ')}>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">Local models</p>
                <p className="mt-1 text-xs text-white/55">{selected?.running ? 'Running' : ollamaConnected ? 'Available' : 'Offline'}</p>
              </div>

              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/55">
                <Cpu className="h-4 w-4" />
              </span>
            </div>

            <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black px-3 py-2 focus-within:border-white/20">
              <Search className="h-4 w-4 shrink-0 text-white/35" />
              <input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search models"
                className="w-full bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
              />
            </label>

            <div className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1">
              {filteredModels.length > 0 ? filteredModels.map((model) => {
                const isSelected = model.name === selectedModel;

                return (
                  <button
                    key={model.name}
                    type="button"
                    onClick={() => {
                      onSelectModel(model.name);
                      setSelectorOpen(false);
                    }}
                    className={['flex w-full items-center justify-between gap-3 rounded-2xl border px-3 py-3 text-left transition', isSelected ? 'border-white/20 bg-white/8 text-white' : 'border-white/5 bg-black text-white/75 hover:border-white/15 hover:bg-white/[0.04]'].join(' ')}
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{model.name}</div>
                      <div className="mt-1 text-xs text-white/45">{formatSizeLabel(model)}</div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/45">
                      <span className={['h-2 w-2 rounded-full', model.running ? 'bg-emerald-400' : 'bg-white/30'].join(' ')} />
                      <span>{model.running ? 'Running' : 'Available'}</span>
                    </div>
                  </button>
                );
              }) : (
                <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-white/45">
                  No local models found.
                </div>
              )}
            </div>
          </div>
        </div>

        <textarea
          rows={1}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message the assistant..."
          disabled={disabled}
          className="min-h-[44px] flex-1 resize-none bg-transparent px-2 py-3 text-sm leading-6 text-white placeholder:text-white/35 focus:outline-none sm:text-[15px]"
        />

        <button
          type="submit"
          disabled={disabled}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-black transition hover:scale-[1.02] hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Send message"
        >
          <SendHorizontal className="h-5 w-5" />
        </button>
      </div>
    </form>
  );
}
