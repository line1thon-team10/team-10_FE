export default function Chip({ pressed, ...props }) {
  return <button type="button" className="chip" aria-pressed={pressed} {...props} />;
}
