export default function BrandMark({ centered = false, showSubtitle = true, className = '' }) {
  return (
    <div className={['flex gap-3', centered ? 'flex-col items-center text-center' : 'items-center', className].join(' ')}>
      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-fuchsia-500/10 shadow-glow">
        <div className="absolute inset-x-2 bottom-2 h-px bg-gradient-to-r from-transparent via-fuchsia-300/70 to-transparent" />
        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5" />
        <span className="relative text-sm font-black tracking-[0.28em] text-white">A</span>
      </div>

      <div className={centered ? 'flex flex-col items-center' : 'min-w-0'}>
        <div className="flex items-center gap-2">
          <p className="text-sm font-black tracking-[0.42em] text-white sm:text-base">ACE</p>
          <span className="h-px w-8 bg-gradient-to-r from-fuchsia-300/70 to-transparent" />
        </div>

        {showSubtitle ? (
          <p className="mt-1 text-[0.65rem] uppercase tracking-[0.34em] text-fuchsia-300/75">
            Local AI Workspace
          </p>
        ) : null}
      </div>
    </div>
  );
}