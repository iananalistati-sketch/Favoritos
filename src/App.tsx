import { FormEvent, useMemo, useState } from 'react'
import { ExternalLink, Plus, Search, Star, X } from 'lucide-react'

type LinkItem = {
  id: string
  name: string
  url: string
  category: string
  favorite: boolean
}

const initialLinks: LinkItem[] = [
  {
    id: 'mercos',
    name: 'Mercos',
    url: 'https://app.mercos.com/industria/258409/produtos/',
    category: 'Sistemas',
    favorite: true,
  },
  {
    id: 'partners',
    name: 'Partners RL',
    url: 'https://suporte.partnersrl.com.br/saas/suporte/admin',
    category: 'Suporte',
    favorite: true,
  },
]

function loadLinks() {
  try {
    const saved = localStorage.getItem('favoritos.links')
    return saved ? (JSON.parse(saved) as LinkItem[]) : initialLinks
  } catch {
    return initialLinks
  }
}

function favicon(url: string) {
  try {
    const domain = new URL(url).hostname
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
  } catch {
    return ''
  }
}

export default function App() {
  const [links, setLinks] = useState<LinkItem[]>(loadLinks)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Todos')
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [newCategory, setNewCategory] = useState('Sistemas')

  const save = (next: LinkItem[]) => {
    setLinks(next)
    localStorage.setItem('favoritos.links', JSON.stringify(next))
  }

  const categories = useMemo(
    () => ['Todos', 'Favoritos', ...Array.from(new Set(links.map((item) => item.category)))],
    [links],
  )

  const filtered = links.filter((item) => {
    const text = `${item.name} ${item.url} ${item.category}`.toLowerCase()
    const matchesSearch = text.includes(search.toLowerCase())
    const matchesCategory =
      category === 'Todos' ||
      (category === 'Favoritos' ? item.favorite : item.category === category)
    return matchesSearch && matchesCategory
  })

  const addLink = (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim() || !url.trim()) return
    const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`
    save([
      ...links,
      {
        id: crypto.randomUUID(),
        name: name.trim(),
        url: normalized,
        category: newCategory.trim() || 'Outros',
        favorite: false,
      },
    ])
    setName('')
    setUrl('')
    setNewCategory('Sistemas')
    setOpen(false)
  }

  const toggleFavorite = (id: string) =>
    save(links.map((item) => (item.id === id ? { ...item, favorite: !item.favorite } : item)))

  return (
    <main className="shell">
      <header className="header">
        <div>
          <div className="eyebrow">WORKSPACE</div>
          <h1>Favoritos</h1>
          <p>Seus sistemas de trabalho em um só lugar.</p>
        </div>
        <button className="primary" onClick={() => setOpen(true)}>
          <Plus size={18} /> Adicionar link
        </button>
      </header>

      <section className="toolbar">
        <label className="search">
          <Search size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Pesquisar sistemas, links ou categorias..."
          />
        </label>
        <nav className="filters">
          {categories.map((item) => (
            <button
              key={item}
              className={category === item ? 'active' : ''}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </nav>
      </section>

      <section className="grid">
        {filtered.map((item) => (
          <article className="card" key={item.id}>
            <div className="cardTop">
              <div className="iconWrap">
                <img src={favicon(item.url)} alt="" />
              </div>
              <button className="iconButton" onClick={() => toggleFavorite(item.id)} title="Favoritar">
                <Star size={18} fill={item.favorite ? 'currentColor' : 'none'} />
              </button>
            </div>
            <div className="category">{item.category}</div>
            <h2>{item.name}</h2>
            <p className="domain">{new URL(item.url).hostname}</p>
            <a className="openLink" href={item.url} target="_blank" rel="noreferrer">
              Abrir sistema <ExternalLink size={16} />
            </a>
          </article>
        ))}
      </section>

      {filtered.length === 0 && <div className="empty">Nenhum link encontrado.</div>}

      {open && (
        <div className="overlay" onMouseDown={() => setOpen(false)}>
          <form className="modal" onSubmit={addLink} onMouseDown={(event) => event.stopPropagation()}>
            <div className="modalHeader">
              <div>
                <span className="eyebrow">NOVO ATALHO</span>
                <h2>Adicionar link</h2>
              </div>
              <button type="button" className="iconButton" onClick={() => setOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <label>Nome<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Power BI" autoFocus /></label>
            <label>URL<input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." /></label>
            <label>Categoria<input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Sistemas" /></label>
            <p className="hint">O ícone do site será identificado automaticamente.</p>
            <div className="actions">
              <button type="button" className="secondary" onClick={() => setOpen(false)}>Cancelar</button>
              <button className="primary" type="submit">Adicionar</button>
            </div>
          </form>
        </div>
      )}
    </main>
  )
}
