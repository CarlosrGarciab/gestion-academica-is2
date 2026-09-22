import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
  const getRoute = () => window.location.hash.replace(/^#\/?/, '') || 'home'
  const [route, setRoute] = useState(() => getRoute())
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
    password: ''
  })
  const [registerMessage, setRegisterMessage] = useState(null)
  const [users, setUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [userMessage, setUserMessage] = useState(null)
  const [courses, setCourses] = useState([])
  const [courseData, setCourseData] = useState({ nombre: '', descripcion: '', area_conocimiento: '' })
  const [courseMessage, setCourseMessage] = useState(null)
  const [editingCourseId, setEditingCourseId] = useState(null)
  const [coursesLoading, setCoursesLoading] = useState(false)
  const [courseSearch, setCourseSearch] = useState('')
  const [courseStatus, setCourseStatus] = useState('all')
  const [cohorts, setCohorts] = useState([])
  const [cohortsLoading, setCohortsLoading] = useState(false)
  const [cohortData, setCohortData] = useState({
    idCurso: '',
    idDocente: '',
    nombre: '',
    fechaInicio: '',
    fechaFin: '',
    modalidad: 'presencial',
    cupoFisico: '',
    linkAcceso: '',
    costoInscripcion: '',
    costoCuotaMensual: '',
    tarifaHoraDocente: ''
  })
  const [cohortMessage, setCohortMessage] = useState(null)
  const [cohortSearch, setCohortSearch] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [roleModal, setRoleModal] = useState(null)
  const [userRoleFilter, setUserRoleFilter] = useState('all')

  const roleLabels = { 1: 'Estudiante', 2: 'Docente', 3: 'Administrador' }
  const modalidadLabels = { presencial: 'Presencial', virtual: 'Virtual', hibrida: 'Híbrida' }
  const docentes = users.filter((user) => user.idRol === 2)
  const visibleUsers = users.filter((user) => {
    const search = userSearch.trim().toLowerCase()
    const matchesSearch = !search
      || `${user.nombre} ${user.apellido} ${user.email}`.toLowerCase().includes(search)
    const role = userRoleFilter === 'all' ? null : Number(userRoleFilter)
    const matchesRole = role === null || user.idRol === role
    return matchesSearch && matchesRole
  })
  const countByRole = (idRol) => users.filter((user) => user.idRol === idRol).length
  const initialsOf = (user) => `${user.nombre?.[0] || ''}${user.apellido?.[0] || ''}`.toUpperCase()
  const visibleCohorts = cohorts.filter((cohorte) => {
    const search = cohortSearch.trim().toLowerCase()
    return !search || `${cohorte.cursoNombre} ${cohorte.docenteNombre} ${cohorte.docenteApellido} ${cohorte.nombre} ${modalidadLabels[cohorte.modalidad] || cohorte.modalidad}`.toLowerCase().includes(search)
  })
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
    const session = JSON.parse(sessionStorage.getItem('ccgb_session'))
    if (!session?.token) {
      return
    }

    const refreshUser = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/usuarios/${session.usuario.id}`, {
          headers: { Authorization: `Bearer ${session.token}` }
        })
        if (!response.ok) return
        const fresh = await response.json()
        const updated = { token: session.token, usuario: { ...session.usuario, ...fresh } }
        sessionStorage.setItem('ccgb_session', JSON.stringify(updated))
        setAuthUser(updated.usuario)
      } catch {
        // refresco silencioso: se conserva la sesion actual
      }
    }

    refreshUser()
  }, [apiUrl])

  useEffect(() => {
    const onHashChange = () => {
      setRoute(getRoute())
      window.scrollTo({ top: 0 })
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    if (!roleModal) {
      return
    }
    const onKey = (event) => {
      if (event.key === 'Escape') setRoleModal(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [roleModal])

  useEffect(() => {
    if (authUser?.idRol !== 3) {
      return
    }

    const loadAdminData = async () => {
      setCoursesLoading(true)
      setUsersLoading(true)
      setCohortsLoading(true)
      try {
        const session = JSON.parse(sessionStorage.getItem('ccgb_session'))
        const [coursesResponse, usersResponse, cohortsResponse] = await Promise.all([
          fetch(`${apiUrl}/api/cursos`, { headers: { Authorization: `Bearer ${session?.token}` } }),
          fetch(`${apiUrl}/api/usuarios/activos`, { headers: { Authorization: `Bearer ${session?.token}` } }),
          fetch(`${apiUrl}/api/cohortes`, { headers: { Authorization: `Bearer ${session?.token}` } })
        ])
        const [coursesResult, usersResult, cohortsResult] = await Promise.all([
          coursesResponse.json(),
          usersResponse.json(),
          cohortsResponse.json()
        ])
        if (!coursesResponse.ok) throw new Error(coursesResult.message || 'No se pudieron cargar los cursos')
        if (!usersResponse.ok) throw new Error(usersResult.message || 'No se pudieron cargar los usuarios')
        if (!cohortsResponse.ok) throw new Error(cohortsResult.message || 'No se pudieron cargar las cohortes')
        setCourses(coursesResult)
        setUsers(usersResult)
        setCohorts(cohortsResult)
      } catch (error) {
        setCourseMessage({ type: 'error', text: error.message })
        setUserMessage({ type: 'error', text: error.message })
        setCohortMessage({ type: 'error', text: error.message })
      } finally {
        setCoursesLoading(false)
        setUsersLoading(false)
        setCohortsLoading(false)
      }
    }

    loadAdminData()
  }, [apiUrl, authUser?.idRol])


  const confirmRoleChange = async (user, idRol) => {
    setRoleModal(null)

    try {
      const session = JSON.parse(sessionStorage.getItem('ccgb_session'))
      const response = await fetch(`${apiUrl}/api/usuarios/${user.id}/rol`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.token}`
        },
        body: JSON.stringify({ idRol })
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'No se pudo cambiar el rol')
      setUsers((current) => current.map((item) => item.id === result.id ? result : item))
      setUserMessage({ type: 'success', text: `Rol actualizado a ${roleLabels[result.idRol] || 'Usuario'}.` })
    } catch (error) {
      setUserMessage({ type: 'error', text: error.message })
    }
  }

  const openRoleSelect = (user, idRol) => {
    if (idRol === user.idRol) {
      return
    }
    setRoleModal({ user, idRol })
  }

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
        body: JSON.stringify(registerData)
      })
      const result = await response.json()

      if (!response.ok) throw new Error(result.message || 'No se pudo completar el registro')

      setRegisterData({ nombre: '', apellido: '', email: '', password: '' })
      setRegisterMessage({ type: 'success', text: 'Registro completado. Ya puedes iniciar sesión.' })
      window.location.hash = 'login'
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
    window.location.hash = 'home'
  }

  const navigate = (path) => {
    setAuthMenuOpen(false)
    window.location.hash = path
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
    if (course.activo && !window.confirm(`¿Desactivar el curso "${course.nombre}"?`)) {
      return
    }

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

  const handleCohortChange = (event) => {
    const { name, value } = event.target
    setCohortData((current) => ({ ...current, [name]: value }))
  }

  const resetCohortForm = () => {
    setCohortData({
      idCurso: '',
      idDocente: '',
      nombre: '',
      fechaInicio: '',
      fechaFin: '',
      modalidad: 'presencial',
      cupoFisico: '',
      linkAcceso: '',
      costoInscripcion: '',
      costoCuotaMensual: '',
      tarifaHoraDocente: ''
    })
    setCohortMessage(null)
  }

  const handleCohortSubmit = async (event) => {
    event.preventDefault()
    setCohortMessage(null)

    try {
      const session = JSON.parse(sessionStorage.getItem('ccgb_session'))
      const response = await fetch(`${apiUrl}/api/cohortes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.token}`
        },
        body: JSON.stringify(cohortData)
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'No se pudo crear la cohorte')

      setCohorts((current) => [...current, result])
      resetCohortForm()
      setCohortMessage({ type: 'success', text: 'Cohorte creada.' })
    } catch (error) {
      setCohortMessage({ type: 'error', text: error.message })
    }
  }

  const formatMoney = (value) => {
    return new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 }).format(Number(value))
  }

  const roleModalData = roleModal && (() => {
    const { user, idRol } = roleModal
    const esAsignacion = idRol > user.idRol
    const rolDestino = roleLabels[idRol] || 'Usuario'
    const rolActual = roleLabels[user.idRol] || 'Usuario'
    return {
      esRemocion: !esAsignacion,
      titulo: esAsignacion ? `Otorgar rol de ${rolDestino}` : `Quitar rol de ${rolActual}`,
      mensaje: esAsignacion
        ? `¿Confirmás otorgar el rol de ${rolDestino} a ${user.nombre} ${user.apellido}?`
        : `¿Confirmás quitar el rol de ${rolActual} a ${user.nombre} ${user.apellido}? La persona se convertirá en ${rolDestino}.`
    }
  })()

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="CCGB inicio">
          <span className="brand-mark" aria-hidden="true">CCGB</span>
          <span>Gestión Académica</span>
        </a>
        <div className="profile-menu">
          <button className="profile-button" type="button" aria-label={authUser ? 'Cerrar sesión' : 'Abrir opciones de acceso'} aria-expanded={authUser ? undefined : authMenuOpen} onClick={authUser ? handleLogout : () => setAuthMenuOpen((open) => !open)}>
            {authUser ? <span className="logout-label">Salir</span> : <span className="person-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.7-3.7 3.1-5.5 7-5.5s6.3 1.8 7 5.5" /></svg></span>}
          </button>
          {!authUser && authMenuOpen && (
            <div className="auth-menu" role="menu">
              <button type="button" role="menuitem" onClick={() => navigate('login')}>Iniciar sesión</button>
              <button type="button" role="menuitem" onClick={() => navigate('registro')}>Registrarse</button>
            </div>
          )}
        </div>
      </header>

      <section className="intro" id="resumen">
        <div>
          <p className="eyebrow">GESTIÓN ACADÉMICA / 2026</p>
          <h1>Un lugar claro para que el aprendizaje avance.</h1>
          <p className="intro-copy">
            Cursos, cohortes y personas reunidos en un mismo espacio de trabajo.
          </p>
        </div>
      </section>

      {authUser ? (
        authUser.idRol === 3 && ['usuarios', 'cursos', 'cohortes'].includes(route) ? (
          <>
              {route === 'usuarios' && (
              <section className="courses-panel" id="usuarios">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">USUARIOS</p>
                    <h2>Administración de usuarios</h2>
                  </div>
                  <div className="section-heading-side">
                    <div className="user-summary" role="group" aria-label="Filtrar usuarios por rol">
                      <button type="button" className={userRoleFilter === 'all' ? 'active' : ''} onClick={() => setUserRoleFilter('all')}>{users.length} activos</button>
                      <button type="button" className={userRoleFilter === '2' ? 'active' : ''} onClick={() => setUserRoleFilter('2')}>{countByRole(2)} docentes</button>
                      <button type="button" className={userRoleFilter === '1' ? 'active' : ''} onClick={() => setUserRoleFilter('1')}>{countByRole(1)} estudiantes</button>
                      <button type="button" className={userRoleFilter === '3' ? 'active' : ''} onClick={() => setUserRoleFilter('3')}>{countByRole(3)} administradores</button>
                    </div>
                    <a className="secondary-button back-link" href="#panel">Volver al panel</a>
                  </div>
                </div>
                {userMessage && <p className={`form-message ${userMessage.type}`} role="status">{userMessage.text}</p>}
                <div className="course-filters user-filters">
                  <label>Buscar por nombre, apellido o email<input value={userSearch} onChange={(event) => setUserSearch(event.target.value)} placeholder="Ej. ana@mail.com" /></label>
                  <label>Rol<select value={userRoleFilter} onChange={(event) => setUserRoleFilter(event.target.value)}>
                    <option value="all">Todos</option>
                    <option value="1">Estudiantes</option>
                    <option value="2">Docentes</option>
                    <option value="3">Administradores</option>
                  </select></label>
                </div>
                <div className="course-table-wrap">
                  {usersLoading ? <p className="empty-state">Cargando usuarios...</p> : users.length === 0 ? <p className="empty-state">Todavía no hay usuarios activos.</p> : visibleUsers.length === 0 ? <p className="empty-state">No hay usuarios que coincidan con el filtro.</p> : (
                    <table className="course-table user-table">
                      <thead><tr><th>Usuario</th><th>Email</th><th>Rol</th><th>Acciones</th></tr></thead>
                      <tbody>{visibleUsers.map((user) => (
                        <tr key={user.id}>
                          <td><div className="user-cell"><span className="user-avatar" aria-hidden="true">{initialsOf(user) || '·'}</span><span className="user-name">{user.nombre} {user.apellido}</span></div></td>
                          <td>{user.email}</td>
                          <td><span className={`role-badge badge-${user.idRol}`}>{roleLabels[user.idRol] || 'Usuario'}</span></td>
                          <td className="user-actions">
                            {user.id === authUser?.id
                              ? <span className="empty-state">—</span>
                              : <select className="role-select" value={user.idRol} aria-label={`Cambiar rol de ${user.nombre} ${user.apellido}`} onChange={(event) => openRoleSelect(user, Number(event.target.value))}>
                                  <option value="1">Estudiante</option>
                                  <option value="2">Docente</option>
                                  <option value="3">Administrador</option>
                                </select>}
                          </td>
                        </tr>
                      ))}</tbody>
                    </table>
                  )}
                </div>
              </section>
              )}
              {route === 'cursos' && (
              <section className="courses-panel" id="cursos">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">OFERTA EDUCATIVA</p>
                  <h2>Administración de cursos</h2>
                </div>
                <a className="secondary-button back-link" href="#panel">Volver al panel</a>
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
              {route === 'cohortes' && (
              <section className="courses-panel" id="cohortes">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">COHORTES</p>
                    <h2>Crear cohorte</h2>
                  </div>
                  <a className="secondary-button back-link" href="#panel">Volver al panel</a>
                </div>
                <form className="course-form" onSubmit={handleCohortSubmit}>
                  <label>Curso<select name="idCurso" value={cohortData.idCurso} onChange={handleCohortChange} required>
                    <option value="">Seleccionar curso</option>
                    {courses.map((course) => <option key={course.id} value={course.id}>{course.nombre}</option>)}
                  </select></label>
                  <label>Docente<select name="idDocente" value={cohortData.idDocente} onChange={handleCohortChange} required>
                    <option value="">Seleccionar docente</option>
                    {docentes.map((user) => <option key={user.id} value={user.id}>{user.nombre} {user.apellido}</option>)}
                  </select></label>
                  <label>Nombre de la cohorte<input name="nombre" value={cohortData.nombre} onChange={handleCohortChange} placeholder="Ej. Cohorte 2026-A" /></label>
                  <label>Modalidad<select name="modalidad" value={cohortData.modalidad} onChange={handleCohortChange}>
                    <option value="presencial">Presencial</option>
                    <option value="virtual">Virtual</option>
                    <option value="hibrida">Híbrida</option>
                  </select></label>
                  <label>Inicio<input name="fechaInicio" type="date" value={cohortData.fechaInicio} onChange={handleCohortChange} required /></label>
                  <label>Fin<input name="fechaFin" type="date" value={cohortData.fechaFin} onChange={handleCohortChange} required /></label>
                  {(cohortData.modalidad === 'presencial' || cohortData.modalidad === 'hibrida') && (
                    <label>Cupo físico<input name="cupoFisico" type="number" min="1" value={cohortData.cupoFisico} onChange={handleCohortChange} required /></label>
                  )}
                  {(cohortData.modalidad === 'virtual' || cohortData.modalidad === 'hibrida') && (
                    <label>Link de acceso (videoconferencia)<input name="linkAcceso" type="url" value={cohortData.linkAcceso} onChange={handleCohortChange} placeholder="https://..." required /></label>
                  )}
                  <label>Costo de inscripción<input name="costoInscripcion" type="number" min="1" step="0.01" value={cohortData.costoInscripcion} onChange={handleCohortChange} required /></label>
                  <label>Cuota mensual<input name="costoCuotaMensual" type="number" min="1" step="0.01" value={cohortData.costoCuotaMensual} onChange={handleCohortChange} required /></label>
                  <label>Tarifa por hora del docente<input name="tarifaHoraDocente" type="number" min="1" step="0.01" value={cohortData.tarifaHoraDocente} onChange={handleCohortChange} required /></label>
                  <div className="course-form-actions">
                    <button className="register-button" type="submit">Crear cohorte</button>
                  </div>
                </form>
                {cohortMessage && <p className={`form-message ${cohortMessage.type}`} role="status">{cohortMessage.text}</p>}
                <div className="course-filters cohort-filters">
                  <label>Buscar cohorte<input value={cohortSearch} onChange={(event) => setCohortSearch(event.target.value)} placeholder="Curso, docente o nombre" /></label>
                </div>
                <div className="course-table-wrap">
                  {cohortsLoading ? <p className="empty-state">Cargando cohortes...</p> : cohorts.length === 0 ? <p className="empty-state">Todavía no hay cohortes registradas.</p> : visibleCohorts.length === 0 ? <p className="empty-state">No hay cohortes que coincidan con el filtro.</p> : (
                    <table className="course-table">
                      <thead><tr><th>Curso</th><th>Docente</th><th>Fechas</th><th>Modalidad</th><th>Cupo</th><th>Costos (insc./cuota/hora)</th></tr></thead>
                      <tbody>{visibleCohorts.map((cohorte) => (
                        <tr key={cohorte.id}>
                          <td>{cohorte.cursoNombre}</td>
                          <td>{cohorte.docenteNombre} {cohorte.docenteApellido}</td>
                          <td>{cohorte.fechaInicio} → {cohorte.fechaFin}</td>
                          <td>{modalidadLabels[cohorte.modalidad] || cohorte.modalidad}</td>
                          <td>{cohorte.cupoFisico ?? '—'}</td>
                          <td>{formatMoney(cohorte.costoInscripcion)} / {formatMoney(cohorte.costoCuotaMensual)} / {formatMoney(cohorte.tarifaHoraDocente)}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  )}
                </div>
              </section>
              )}
            </>
          ) : (
            <>
              <section className="role-panel" id="panel">
                <div>
                  <p className="eyebrow">PANEL PERSONAL</p>
                  <h2>Hola, {authUser.nombre} {authUser.apellido || ''}</h2>
                  <p className="intro-copy">Ingresaste como {roleLabels[authUser.idRol] || 'Usuario'}.</p>
                </div>
                <button className="register-button" type="button" onClick={handleLogout}>Cerrar sesión</button>
              </section>
              {authUser.idRol === 3 && (
                <section className="admin-nav" aria-label="Secciones de administración">
                  <a className="admin-card" href="#usuarios">
                    <span className="eyebrow">USUARIOS</span>
                    <strong>Administrar usuarios</strong>
                    <span className="admin-card-desc">Roles, permisos y estados de la comunidad.</span>
                  </a>
                  <a className="admin-card" href="#cursos">
                    <span className="eyebrow">OFERTA EDUCATIVA</span>
                    <strong>Administrar cursos</strong>
                    <span className="admin-card-desc">Alta, edición y estados de los cursos.</span>
                  </a>
                  <a className="admin-card" href="#cohortes">
                    <span className="eyebrow">COHORTES</span>
                    <strong>Crear cohorte</strong>
                    <span className="admin-card-desc">Modalidades, cupos, fechas y costos.</span>
                  </a>
                </section>
              )}
            </>
          )
        ) : (
        <>
          {route === 'home' && (
            <section className="login-panel">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">PLATAFORMA</p>
                  <h2>Ingresa o crea tu cuenta</h2>
                  <p className="intro-copy">Todo en un mismo espacio: cursos, cohortes y personas.</p>
                </div>
                <div className="home-cta">
                  <button className="register-button" type="button" onClick={() => navigate('login')}>Iniciar sesión</button>
                  <button className="secondary-button" type="button" onClick={() => navigate('registro')}>Crear cuenta</button>
                </div>
              </div>
            </section>
          )}
          {route === 'login' && (
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
              <p className="auth-switch">¿No tenés cuenta? <a href="#registro" onClick={() => navigate('registro')}>Registrate</a></p>
            </section>
          )}
          {route === 'registro' && (
            <section className="register-panel" id="registro">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">NUEVA CUENTA</p>
                  <h2>Regístrate para comenzar</h2>
                </div>
              </div>
              <form className="register-form" onSubmit={handleRegister}>
                <label>Nombre<input name="nombre" value={registerData.nombre} onChange={handleRegisterChange} required /></label>
                <label>Apellido<input name="apellido" value={registerData.apellido} onChange={handleRegisterChange} required /></label>
                <label>Email<input name="email" type="email" value={registerData.email} onChange={handleRegisterChange} required /></label>
                <label>Contraseña<input name="password" type="password" minLength="8" pattern="(?=.*[A-Za-z])(?=.*\d).{8,}" title="Usa al menos 8 caracteres, una letra y un numero" value={registerData.password} onChange={handleRegisterChange} required /></label>
                <button className="register-button" type="submit">Crear cuenta</button>
              </form>
              {registerMessage && <p className={`form-message ${registerMessage.type}`} role="status">{registerMessage.text}</p>}
              <p className="auth-switch">¿Ya tenés cuenta? <a href="#login" onClick={() => navigate('login')}>Iniciá sesión</a></p>
            </section>
          )}
        </>
      )}

      {roleModal && roleModalData && (
        <div className="role-modal-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setRoleModal(null) }}>
          <div className="role-modal" role="dialog" aria-modal="true" aria-label={roleModalData.titulo}>
            <p className="eyebrow">CAMBIAR ROL</p>
            <h3>{roleModalData.titulo}</h3>
            <p>{roleModalData.mensaje}</p>
            <div className="role-modal-actions">
              <button className="secondary-button" type="button" onClick={() => setRoleModal(null)}>Cancelar</button>
              <button className={`register-button ${roleModalData.esRemocion ? 'confirm-remove' : ''}`} type="button" onClick={() => confirmRoleChange(roleModal.user, roleModal.idRol)}>Confirmar</button>
            </div>
          </div>
        </div>
      )}

      <footer><span>CCGB</span><span>Plataforma de gestión académica</span><span>v0.1.0</span></footer>
    </main>
  )
}

export default App
