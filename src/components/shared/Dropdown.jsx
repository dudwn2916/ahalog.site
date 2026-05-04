import { useState, useRef, useEffect } from 'react'

export default function Dropdown({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelect(option) {
    onChange(option)
    setOpen(false)
  }

  return (
    <div className="dropdown-wrap" ref={wrapRef}>
      <button className="chip" onClick={() => setOpen(o => !o)}>
        {value || label} ▾
      </button>
      <div className={`dropdown-menu${open ? ' open' : ''}`}>
        {options.map(opt => (
          <div
            key={opt}
            className={`dropdown-item${value === opt ? ' active' : ''}`}
            onClick={() => handleSelect(opt)}
          >
            {opt}
          </div>
        ))}
      </div>
    </div>
  )
}