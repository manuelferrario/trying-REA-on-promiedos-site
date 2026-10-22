import { useState } from 'react'
import { getMenu } from '../api/client.js'

const menu = getMenu()

export default function Sidebar({ currentPath, onNavigate }) {
  const [open, setOpen] = useState(() => menu.categories.map((c) => c.is_open))

  return (
    <nav className="sidebar" aria-label="Competencias">
      {menu.categories.map((cat, i) => (
        <div key={cat.name} className="menu-block">
          <button
            type="button"
            className={`menu-title ${i === 0 ? 'featured' : ''}`}
            aria-expanded={open[i]}
            onClick={() => setOpen((o) => o.map((v, k) => (k === i ? !v : v)))}
          >
            <span>
              {cat.flag && <span className="flag">{cat.flag}</span>}
              {cat.name}
            </span>
            <span className={`chevron ${open[i] ? 'up' : ''}`} aria-hidden="true" />
          </button>
          {open[i] && (
            <ul>
              {cat.items.map((item) => (
                <li key={item.link}>
                  <a
                    href={`#${item.link}`}
                    className={currentPath.startsWith(item.link) ? 'active' : ''}
                    onClick={onNavigate}
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </nav>
  )
}
