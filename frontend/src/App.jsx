import { useEffect, useState } from 'react'
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
  const [courses, setCourses] = useState([])
  const [courseData, setCourseData] = useState({ nombre: '', descripcion: '', area_conocimiento: '' })
  const [courseMessage, setCourseMessage] = useState(null)
  const [editingCourseId, setEditingCourseId] = useState(null)
  const [coursesLoading, setCoursesLoading] = useState(false)
  const [courseSearch, setCourseSearch] = useState('')
  const [courseStatus, setCourseStatus] = useState('all')

  const roleLabels = { 1: 'Estudiante', 2: 'Docente', 3: 'Administrador' }
  const visibleCourses = courses.filter((course) => {
    const search = courseSearch.trim().toLowerCase()
    const matchesSearch = !search
      || course.nombre.toLowerCase().includes(search)
      || course.area_conocimiento.toLowerCase().includes(search)
    const matchesStatus = courseStatus === 'all'
      || (courseStatus === 'active' && course.activo)
      || (courseStatus === 'inactive' && !course.activo)
    return matchesSearch && matchesStatus
  })

  useEffect(() => {
    if (authUser?.idRol !== 3) {
      return
    }

    const loadCourses = async () => {
      setCoursesLoading(true)
      try {
        const session = JSON.parse(sessionStorage.getItem('ccgb_session'))
        const response = await fetch(`${apiUrl}/api/cursos`, {
          headers: { Authorization: `Bearer ${session?.token}` }
        })
        const result = await response.json()
        if (!response.ok) throw new Error(result.message || 'No se pudieron cargar los cursos')
        setCourses(result)
      } catch (error) {
        setCourseMessage({ type: 'error', text: error.message })
      } finally {
        setCoursesLoading(false)
      }
    }

    loadCourses()
  }, [apiUrl, authUser?.idRol])

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

  const handleCourseChange = (event) => {
    const { name, value } = event.target
    setCourseData((current) => ({ ...current, [name]: value }))
  }

  const resetCourseForm = () => {
    setCourseData({ nombre: '', descripcion: '', area_conocimiento: '' })
    setEditingCourseId(null)
  }

  const handleCourseSubmit = async (event) => {
    event.preventDefault()
    setCourseMessage(null)

    try {
      const session = JSON.parse(sessionStorage.getItem('ccgb_session'))
      const editing = editingCourseId !== null
      const response = await fetch(`${apiUrl}/api/cursos${editing ? `/${editingCourseId}` : ''}`, {
        method: editing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.token}`
        },
        body: JSON.stringify(courseData)
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'No se pudo guardar el curso')

      setCourses((current) => editing
        ? current.map((course) => course.id === result.id ? result : course)
        : [...current, result])
      resetCourseForm()
      setCourseMessage({ type: 'success', text: editing ? 'Curso actualizado.' : 'Curso creado.' })
    } catch (error) {
      setCourseMessage({ type: 'error', text: error.message })
    }
  }

  const handleEditCourse = (course) => {
    setEditingCourseId(course.id)
    setCourseData({
      nombre: course.nombre,
      descripcion: course.descripcion,
      area_conocimiento: course.area_conocimiento
    })
    setCourseMessage(null)
  }

  const handleToggleCourse = async (course) => {
    try {
      const session = JSON.parse(sessionStorage.getItem('ccgb_session'))
      const response = await fetch(`${apiUrl}/api/cursos/${course.id}/activo`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.token}`
        },
        body: JSON.stringify({ activo: !course.activo })
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'No se pudo cambiar el estado')
      setCourses((current) => current.map((item) => item.id === result.id ? result : item))
      setCourseMessage({ type: 'success', text: result.activo ? 'Curso activado.' : 'Curso inactivado.' })
    } catch (error) {
      setCourseMessage({ type: 'error', text: error.message })
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="CCGB inicio">
          <span className="brand-mark" aria-hidden="true">CCGB</span>
          <span>Gestion Academica</span>
        </a>
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
        <>
          <section className="role-panel" id="panel">
          <div>
            <p className="eyebrow">PANEL PERSONAL</p>
            <h2>Hola, {authUser.nombre}</h2>
            <p className="intro-copy">Ingresaste como {roleLabels[authUser.idRol] || 'Usuario'}.</p>
          </div>
          <button className="register-button" type="button" onClick={handleLogout}>Cerrar sesión</button>
          </section>
          {authUser.idRol === 3 && (
            <section className="courses-panel" id="cursos">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">OFERTA EDUCATIVA</p>
                  <h2>Administración de cursos</h2>
                </div>
              </div>
              <form className="course-form" onSubmit={handleCourseSubmit}>
                <label>Nombre<input name="nombre" value={courseData.nombre} onChange={handleCourseChange} required /></label>
                <label>Área de conocimiento<input name="area_conocimiento" value={courseData.area_conocimiento} onChange={handleCourseChange} required /></label>
                <label className="course-description">Descripción<textarea name="descripcion" value={courseData.descripcion} onChange={handleCourseChange} required /></label>
                <div className="course-form-actions">
                  <button className="register-button" type="submit">{editingCourseId === null ? 'Crear curso' : 'Guardar cambios'}</button>
                  {editingCourseId !== null && <button className="secondary-button" type="button" onClick={resetCourseForm}>Cancelar</button>}
                </div>
              </form>
              {courseMessage && <p className={`form-message ${courseMessage.type}`} role="status">{courseMessage.text}</p>}
              <div className="course-filters">
                <label>Buscar curso o área<input value={courseSearch} onChange={(event) => setCourseSearch(event.target.value)} placeholder="Ej. Tecnología" /></label>
                <label>Estado<select value={courseStatus} onChange={(event) => setCourseStatus(event.target.value)}><option value="all">Todos</option><option value="active">Activos</option><option value="inactive">Inactivos</option></select></label>
              </div>
              <div className="course-table-wrap">
                {coursesLoading ? <p className="empty-state">Cargando cursos...</p> : courses.length === 0 ? <p className="empty-state">Todavía no hay cursos registrados.</p> : visibleCourses.length === 0 ? <p className="empty-state">No hay cursos que coincidan con el filtro.</p> : (
                  <table className="course-table">
                    <thead><tr><th>Curso</th><th>Descripción</th><th>Área</th><th>Estado</th><th>Acciones</th></tr></thead>
                    <tbody>{visibleCourses.map((course) => (
                      <tr key={course.id} className={!course.activo ? 'inactive-row' : ''}>
                        <td>{course.nombre}</td><td>{course.descripcion}</td><td>{course.area_conocimiento}</td>
                        <td><span className={`course-state ${course.activo ? 'active' : 'inactive'}`}>{course.activo ? 'Activo' : 'Inactivo'}</span></td>
                        <td className="course-actions"><button type="button" onClick={() => handleEditCourse(course)}>Editar</button><button type="button" onClick={() => handleToggleCourse(course)}>{course.activo ? 'Desactivar' : 'Activar'}</button></td>
                      </tr>
                    ))}</tbody>
                  </table>
                )}
              </div>
            </section>
          )}
        </>
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
