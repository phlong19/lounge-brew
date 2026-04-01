type Props = {
  legend: string;
  vietnameseLabel: string;
  englishLabel: string;
  vietnameseValue?: string;
  englishValue?: string;
  vietnamesePlaceholder?: string;
  englishPlaceholder?: string;
  textarea?: boolean;
};

const fieldClassName =
  'w-full rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-accent/70';

export function BilingualFieldPair({
  legend,
  vietnameseLabel,
  englishLabel,
  vietnameseValue,
  englishValue,
  vietnamesePlaceholder,
  englishPlaceholder,
  textarea = false
}: Props) {
  const sharedProps = {
    className: fieldClassName,
    rows: 5
  };

  return (
    <fieldset className="space-y-3">
      <legend className="text-xs font-semibold uppercase tracking-[0.35em] text-white/45">{legend}</legend>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-white/70">
          <span>{vietnameseLabel}</span>
          {textarea ? (
            <textarea
              {...sharedProps}
              defaultValue={vietnameseValue}
              placeholder={vietnamesePlaceholder}
            />
          ) : (
            <input
              className={fieldClassName}
              defaultValue={vietnameseValue}
              placeholder={vietnamesePlaceholder}
            />
          )}
        </label>

        <label className="grid gap-2 text-sm text-white/70">
          <span>{englishLabel}</span>
          {textarea ? (
            <textarea
              {...sharedProps}
              defaultValue={englishValue}
              placeholder={englishPlaceholder}
            />
          ) : (
            <input
              className={fieldClassName}
              defaultValue={englishValue}
              placeholder={englishPlaceholder}
            />
          )}
        </label>
      </div>
    </fieldset>
  );
}

