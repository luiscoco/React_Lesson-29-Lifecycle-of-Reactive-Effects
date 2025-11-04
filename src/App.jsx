import React, { useEffect, useRef, useState } from 'react'

// A tiny in-app logger so you can see effect lifecycle without opening DevTools
function useUILogger() {
  const [entries, setEntries] = useState([])
  const add = (msg) => setEntries((e) => [new Date().toLocaleTimeString() + '  ' + msg, ...e].slice(0, 200))
  return { entries, add, clear: () => setEntries([]) }
}

export default function App() {
  const [serverUrl, setServerUrl] = useState('wss://server-1')
  const [user, setUser] = useState({ id: 1, name: 'Alice', role: 'admin' })
  const [pageTitle, setPageTitle] = useState('Home')
  const [theme, setTheme] = useState('light')
  const stableRef = useRef('StableValue')
  const { entries, add, clear } = useUILogger()

  // 1. Start/Stop on every render (no deps) -> shows cleanup & re-run cycles
  useEffect(() => {
    add('Effect 1 ▶ start syncing (no deps)')
    return () => add('Effect 1 ⏹ stop syncing (cleanup)')
  })

  // 2. Sync to serverUrl with cleanup
  useEffect(() => {
    add('Effect 2 ▶ connect → ' + serverUrl)
    return () => add('Effect 2 ⏹ disconnect ← ' + serverUrl)
  }, [serverUrl])

  // 3. Subscribe to user.id with cleanup
  useEffect(() => {
    add(`Effect 3 ▶ subscribe user ${user.id}`)
    return () => add(`Effect 3 ⏹ unsubscribe user ${user.id}`)
  }, [user.id])

  // 4. Update document title when pageTitle changes
  useEffect(() => {
    document.title = pageTitle
    add('Effect 4 ✏️  set document.title → ' + pageTitle)
  }, [pageTitle])

  // 5. Separate synchronization processes
  useEffect(() => { add('Effect 5a 🧭 log page view (mount only)') }, [])
  useEffect(() => { add('Effect 5b 🎨 theme changed → ' + theme) }, [theme])

  // 6. Reactive variable from render scope
  useEffect(() => { add('Effect 6 🔐 audit role → ' + user.role) }, [user.role])

  // 7. Stable value that avoids re-sync
  useEffect(() => { add('Effect 7 ♾️  stableRef used → ' + stableRef.current) }, [])

  // Bonus: interval to demonstrate cleanup
  useEffect(() => {
    const id = setInterval(() => add('⏱️  interval tick (cleared on unmount)'), 4000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="app">
      <h1 className="title">Reactive Effects Playground</h1>
      <p className="subtitle">
        Explore how <code>useEffect</code> starts, cleans up, and re-synchronizes based on dependencies.
      </p>

      <div className="grid">
        <div className="card">
          <h3>Server Synchronization</h3>
          <p className="hint">Switch servers to trigger cleanup + re-run.</p>
          <div className="controls">
            <button onClick={() => setServerUrl('wss://server-1')}>Server 1</button>
            <button onClick={() => setServerUrl('wss://server-2')}>Server 2</button>
            <span className="badge">current: {serverUrl}</span>
          </div>
        </div>

        <div className="card">
          <h3>User Subscription</h3>
          <p className="hint">Changing <code>user.id</code> triggers unsubscribe/subscribe.</p>
          <div className="controls">
            <button onClick={() => setUser({ id: 1, name: 'Alice', role: 'admin' })}>User 1</button>
            <button onClick={() => setUser({ id: 2, name: 'Bob', role: 'editor' })}>User 2</button>
            <span className="badge">id: {user.id}</span>
          </div>
        </div>

        <div className="card">
          <h3>Page Title</h3>
          <p className="hint">Updates <code>document.title</code> whenever it changes.</p>
          <div className="controls">
            <button onClick={() => setPageTitle('Dashboard')}>Dashboard</button>
            <button onClick={() => setPageTitle('Profile')}>Profile</button>
            <span className="badge">{pageTitle}</span>
          </div>
        </div>

        <div className="card">
          <h3>Theme</h3>
          <p className="hint">Separate effect reacts only to <code>theme</code>.</p>
          <div className="controls">
            <button onClick={() => setTheme('light')}>Light</button>
            <button onClick={() => setTheme('dark')}>Dark</button>
            <span className="badge">{theme}</span>
          </div>
        </div>

        <div className="card">
          <h3>Role Change</h3>
          <p className="hint">Effect reads a derived reactive value from render scope.</p>
          <div className="controls">
            <button onClick={() => setUser(u => ({ ...u, role: 'viewer' }))}>Viewer</button>
            <button onClick={() => setUser(u => ({ ...u, role: 'editor' }))}>Editor</button>
            <span className="badge">role: {user.role}</span>
          </div>
        </div>

        <div className="card">
          <h3>Logs</h3>
          <div className="row">
            <button onClick={clear}>Clear</button>
            <span className="hint">Mount/unmount or change values to see lifecycle events.</span>
          </div>
          <div className="log" role="log" aria-live="polite">
            {entries.map((e, i) => <p key={i} className="log-entry">{e}</p>)}
          </div>
        </div>
      </div>
    </div>
  )
}
