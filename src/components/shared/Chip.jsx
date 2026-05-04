export default function Chip({ label, selected, onClick, className = '' }) {
  return (
    <button
      className={`chip${selected ? ' active' : ''}${className ? ' ' + className : ''}`}
      onClick={onClick}
    >
      {label}
    </button>
  )
}