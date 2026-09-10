import { useState } from 'react'
import './App.css'

function App() {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
  const [authUser, setAuthUser] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('ccgb_session'))?.usuario || null
    } catch {
      return null
    }
  })
  const [authMenuOpen, setAuthMenuOpen] = useState(false)
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [loginMessage, setLoginMessage] = useState(null)
  const [registerData, setRegisterData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    idRol: '1',
    password: ''
  })
  const [registerMessage, setRegisterMessage] = useState(null)

  const roleLabels = { 1: 'Estudiante', 2: 'Docente', 3: 'Administrador' }

  const handleRegisterChange = (event) => {
    const { name, value } = event.target
    setRegisterData((current) => ({ ...current, [name]: value }))
  }

  const handleRegister = async (event) => {
    event.preventDefault()
    setRegisterMessage(null)

    try {
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...registerData, idRol: Number(registerData.idRol) })
      })
      const result = await response.json()

      if (!response.ok) throw new Error(result.message || 'No se pudo completar el registro')

      setRegisterData({ nombre: '', apellido: '', email: '', idRol: '1', password: '' })
      setRegisterMessage({ type: 'success', text: 'Registro completado. Ya puedes iniciar sesión.' })
    } catch (error) {
      setRegisterMessage({ type: 'error', text: error.message })
    }
  }

  const handleLoginChange = (event) => {
    const { name, value } = event.target
    setLoginData((current) => ({ ...current, [name]: value }))
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    setLoginMessage(null)

    try {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      })
      const result = await response.json()

      if (!response.ok) throw new Error(result.message || 'Credenciales inválidas')

      sessionStorage.setItem('ccgb_session', JSON.stringify(result))
      setAuthUser(result.usuario)
      setLoginData({ email: '', password: '' })
      window.location.hash = 'panel'
    } catch (error) {
      setLoginMessage({ type: 'error', text: error.message })
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('ccgb_session')
    setAuthUser(null)
    setAuthMenuOpen(false)
    window.location.hash = 'resumen'
  }

  const goToAuth = (section) => {
    setAuthMenuOpen(false)
    window.location.hash = section
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="CCGB inicio">
          <span className="brand-mark" aria-hidden="true">CCGB</span>
          <span>Gestion Academica</span>
        </a>
        <nav aria-label="Navegacion principal">
          <a className="active" href="#resumen">Resumen</a>
        </nav>
        <div className="profile-menu">
          <button className="profile-button" type="button" aria-label={authUser ? 'Cerrar sesión' : 'Abrir opciones de acceso'} aria-expanded={authUser ? undefined : authMenuOpen} onClick={authUser ? handleLogout : () => setAuthMenuOpen((open) => !open)}>
            {authUser ? <span className="logout-label">Salir</span> : <span className="person-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.7-3.7 3.1-5.5 7-5.5s6.3 1.8 7 5.5" /></svg></span>}
          </button>
          {!authUser && authMenuOpen && (
            <div className="auth-menu" role="menu">
              <button type="button" role="menuitem" onClick={() => goToAuth('login')}>Iniciar sesión</button>
              <button type="button" role="menuitem" onClick={() => goToAuth('registro')}>Registrarse</button>
            </div>
          )}
        </div>
      </header>

      <section className="intro" id="resumen">
        <div>
          <p className="eyebrow">GESTION ACADEMICA / 2026</p>
          <h1>Un lugar claro para que el aprendizaje avance.</h1>
          <p className="intro-copy">
            Cursos, cohortes y personas reunidos en un mismo espacio de trabajo.
          </p>
        </div>
      </section>

      {authUser ? (
        <section className="role-panel" id="panel">
          <div>
            <p className="eyebrow">PANEL PERSONAL</p>
            <h2>Hola, {authUser.nombre}</h2>
            <p className="intro-copy">Ingresaste como {roleLabels[authUser.idRol] || 'Usuario'}.</p>
          </div>
          <button className="register-button" type="button" onClick={handleLogout}>Cerrar sesión</button>
        </section>
      ) : (
        <section className="login-panel" id="login">
          <div className="section-heading">
            <div>
              <p className="eyebrow">ACCESO</p>
              <h2>Iniciar sesión</h2>
            </div>
          </div>
          <form className="login-form" onSubmit={handleLogin}>
            <label>Email<input name="email" type="email" value={loginData.email} onChange={handleLoginChange} required /></label>
            <label>Contraseña<input name="password" type="password" value={loginData.password} onChange={handleLoginChange} required /></label>
            <button className="register-button" type="submit">Ingresar</button>
          </form>
          {loginMessage && <p className={`form-message ${loginMessage.type}`} role="alert">{loginMessage.text}</p>}
        </section>
      )}

      {!authUser && <section className="register-panel" id="registro">
        <div className="section-heading">
          <div>
            <p className="eyebrow">NUEVA CUENTA</p>
            <h2>Registrate para comenzar</h2>
          </div>
        </div>
        <form className="register-form" onSubmit={handleRegister}>
          <label>Nombre<input name="nombre" value={registerData.nombre} onChange={handleRegisterChange} required /></label>
          <label>Apellido<input name="apellido" value={registerData.apellido} onChange={handleRegisterChange} required /></label>
          <label>Email<input name="email" type="email" value={registerData.email} onChange={handleRegisterChange} required /></label>
          <label>Rol<select name="idRol" value={registerData.idRol} onChange={handleRegisterChange}><option value="1">Estudiante</option><option value="2">Docente</option></select></label>
          <label>Contraseña<input name="password" type="password" minLength="8" pattern="(?=.*[A-Za-z])(?=.*\d).{8,}" title="Usa al menos 8 caracteres, una letra y un numero" value={registerData.password} onChange={handleRegisterChange} required /></label>
          <button className="register-button" type="submit">Crear cuenta</button>
        </form>
        {registerMessage && <p className={`form-message ${registerMessage.type}`} role="status">{registerMessage.text}</p>}
      </section>}

      <footer><span>CCGB</span><span>Plataforma de gestion academica</span><span>v0.1.0</span></footer>
    </main>
  )
}

export default App
