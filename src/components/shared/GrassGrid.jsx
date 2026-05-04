import { useMemo } from 'react'
import { GRASS_LEVELS } from '../../data/constants.js'

const COLS = 26

export default function GrassGrid() {
  const cells = useMemo(() => {
    const total = COLS * 7
    return Array.from({ length: total }, (_, i) => ({
      id: i,
      level: GRASS_LEVELS[i % GRASS_LEVELS.length] || 0,
    }))
  }, [])

  return (
    <div className="grass-grid">
      {cells.map(cell => (
        <div
          key={cell.id}
          className={`grass-cell${cell.level > 0 ? ` l${cell.level}` : ''}`}
        />
      ))}
    </div>
  )
}