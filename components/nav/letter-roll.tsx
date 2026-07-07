export function LetterRoll({ text }: { text: string }) {
  return (
    <span className="lr-group inline-flex">
      {text.split("").map((ch, i) => {
        const c = ch === " " ? " " : ch;
        return (
          <span key={i} className="lr-char" style={{ transitionDelay: `${i * 22}ms` }}>
            <span className="lr-top">{c}</span>
            <span className="lr-bottom">{c}</span>
          </span>
        );
      })}
    </span>
  );
}
