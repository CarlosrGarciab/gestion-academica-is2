import { useEffect, useState } from 'react'
import './App.css'

function Paginator({ page, pageSize, total, onPage, onPageSize }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1
  const last = Math.min(total, page * pageSize)
  return (
    <div className="paginator">
      <span className="paginator-info">Mostrando {first}–{last} de {total}</span>
      <div className="paginator-controls">
        <select
          className="paginator-size"
          value={pageSize}
          aria-label="Cantidad por página"
          onChange={(event) => onPageSize(Number(event.target.value))}
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
        </select>
        <button type="button" className="secondary-button paginator-button" disabled={page <= 1} onClick={() => onPage(page - 1)}>Anterior</button>
        <span className="paginator-current">Página {page} de {totalPages}</span>
        <button type="button" className="secondary-button paginator-button" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>Siguiente</button>
      </div>
    </div>
  )
}

function App() {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
  const fechaHoyInput = () => {
    const ahora = new Date()
    return `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`
  }
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
  const [userData, setUserData] = useState({ nombre: '', apellido: '', email: '', password: '', idRol: '' })
  const [courses, setCourses] = useState([])
  const [courseData, setCourseData] = useState({ nombre: '', descripcion: '', area_conocimiento: '', nivel: '' })
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
    fechaInicio: fechaHoyInput(),
    fechaFin: '',
    modalidad: 'presencial',
    cupoFisico: '',
    linkAcceso: ''
  })
  const [cohortMessage, setCohortMessage] = useState(null)
  const [cohortSearch, setCohortSearch] = useState('')
  const [cohortFechaDesde, setCohortFechaDesde] = useState('')
  const [cohortFechaHasta, setCohortFechaHasta] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [roleModal, setRoleModal] = useState(null)
  const [userRoleFilter, setUserRoleFilter] = useState('all')
  const [catalogCohorts, setCatalogCohorts] = useState([])
  const [catalogLoading, setCatalogLoading] = useState(false)
  const [catalogMessage, setCatalogMessage] = useState(null)
  const [catalogSearch, setCatalogSearch] = useState('')
  const [myInscripciones, setMyInscripciones] = useState([])
  const [enrollingId, setEnrollingId] = useState(null)
  const [docentesConCategoria, setDocentesConCategoria] = useState([])
  const [niveles, setNiveles] = useState([])
  const [categoriasDocente, setCategoriasDocente] = useState([])
  const [arancelMessage, setArancelMessage] = useState(null)
  const [nivelForm, setNivelForm] = useState({ nombre: '', precioInscripcion: '', costoCuotaMensual: '', vigenciaDesde: fechaHoyInput(), vigenciaHasta: '' })
  const [categoriaForm, setCategoriaForm] = useState({ nombre: '', tarifaHora: '', vigenciaDesde: fechaHoyInput(), vigenciaHasta: '' })
  const [asignacionForm, setAsignacionForm] = useState({ idDocente: '', idCategoria: '', desde: fechaHoyInput(), hasta: '' })
  const [historialDocente, setHistorialDocente] = useState(null)
  const [userPage, setUserPage] = useState(1)
  const [userPageSize, setUserPageSize] = useState(5)
  const [coursePage, setCoursePage] = useState(1)
  const [coursePageSize, setCoursePageSize] = useState(5)
  const [cohortPage, setCohortPage] = useState(1)
  const [cohortPageSize, setCohortPageSize] = useState(5)

  const roleLabels = { 1: 'Estudiante', 2: 'Docente', 3: 'Administrador' }
  const modalidadLabels = { presencial: 'Presencial', virtual: 'Virtual', hibrida: 'Híbrida' }
  const nivelLabels = { principiante: 'Principiante', intermedio: 'Intermedio', avanzado: 'Avanzado' }
  const nivelCursoSeleccionado = courses.find((course) => String(course.id) === String(cohortData.idCurso))
  const docenteSeleccionado = docentesConCategoria.find((docente) => String(docente.id) === String(cohortData.idDocente))
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
    const matchesSearch = !search || `${cohorte.cursoNombre} ${cohorte.docenteNombre} ${cohorte.docenteApellido} ${cohorte.nombre} ${modalidadLabels[cohorte.modalidad] || cohorte.modalidad}`.toLowerCase().includes(search)
    const matchesDesde = !cohortFechaDesde || (cohorte.fechaInicio && cohorte.fechaInicio >= cohortFechaDesde)
    const matchesHasta = !cohortFechaHasta || (cohorte.fechaInicio && cohorte.fechaInicio <= cohortFechaHasta)
    return matchesSearch && matchesDesde && matchesHasta
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
  const misIdsCohorteActivos = new Set(
    myInscripciones
      .filter((inscripcion) => inscripcion.estado === 'pendiente' || inscripcion.estado === 'confirmada')
      .map((inscripcion) => inscripcion.idCohorte)
  )
  const visibleCatalogCohorts = catalogCohorts.filter((cohorte) => {
    const search = catalogSearch.trim().toLowerCase()
    return !search || `${cohorte.cursoNombre} ${cohorte.docenteNombre} ${cohorte.docenteApellido} ${cohorte.nombre} ${modalidadLabels[cohorte.modalidad] || cohorte.modalidad}`.toLowerCase().includes(search)
  })
  const totalUserPages = Math.max(1, Math.ceil(visibleUsers.length / userPageSize))
  const currentUserPage = Math.min(userPage, totalUserPages)
  const pagedUsers = visibleUsers.slice((currentUserPage - 1) * userPageSize, currentUserPage * userPageSize)
  const totalCoursePages = Math.max(1, Math.ceil(visibleCourses.length / coursePageSize))
  const currentCoursePage = Math.min(coursePage, totalCoursePages)
  const pagedCourses = visibleCourses.slice((currentCoursePage - 1) * coursePageSize, currentCoursePage * coursePageSize)
  const totalCohortPages = Math.max(1, Math.ceil(visibleCohorts.length / cohortPageSize))
  const currentCohortPage = Math.min(cohortPage, totalCohortPages)
  const pagedCohorts = visibleCohorts.slice((currentCohortPage - 1) * cohortPageSize, currentCohortPage * cohortPageSize)

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
        const [coursesResponse, usersResponse, cohortsResponse, docentesCategoriaResponse, nivelesResponse, categoriasResponse] = await Promise.all([
          fetch(`${apiUrl}/api/cursos`, { headers: { Authorization: `Bearer ${session?.token}` } }),
          fetch(`${apiUrl}/api/usuarios/activos`, { headers: { Authorization: `Bearer ${session?.token}` } }),
          fetch(`${apiUrl}/api/cohortes`, { headers: { Authorization: `Bearer ${session?.token}` } }),
          fetch(`${apiUrl}/api/docentes/categorias`, { headers: { Authorization: `Bearer ${session?.token}` } }),
          fetch(`${apiUrl}/api/niveles`, { headers: { Authorization: `Bearer ${session?.token}` } }),
          fetch(`${apiUrl}/api/categorias-docente`, { headers: { Authorization: `Bearer ${session?.token}` } })
        ])
        const [coursesResult, usersResult, cohortsResult, docentesCategoriaResult, nivelesResult, categoriasResult] = await Promise.all([
          coursesResponse.json(),
          usersResponse.json(),
          cohortsResponse.json(),
          docentesCategoriaResponse.json(),
          nivelesResponse.json(),
          categoriasResponse.json()
        ])
        if (!coursesResponse.ok) throw new Error(coursesResult.message || 'No se pudieron cargar los cursos')
        if (!usersResponse.ok) throw new Error(usersResult.message || 'No se pudieron cargar los usuarios')
        if (!cohortsResponse.ok) throw new Error(cohortsResult.message || 'No se pudieron cargar las cohortes')
        if (!docentesCategoriaResponse.ok) throw new Error(docentesCategoriaResult.message || 'No se pudieron cargar las categorías de docentes')
        if (!nivelesResponse.ok) throw new Error(nivelesResult.message || 'No se pudieron cargar los niveles')
        if (!categoriasResponse.ok) throw new Error(categoriasResult.message || 'No se pudieron cargar las categorías')
        setCourses(coursesResult)
        setUsers(usersResult)
        setCohorts(cohortsResult)
        setDocentesConCategoria(docentesCategoriaResult)
        setNiveles(nivelesResult)
        setCategoriasDocente(categoriasResult)
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

  useEffect(() => {
    if (authUser?.idRol !== 1) {
      return
    }

    const loadCatalog = async () => {
      setCatalogLoading(true)
      try {
        const session = JSON.parse(sessionStorage.getItem('ccgb_session'))
        const [catalogResponse, mineResponse] = await Promise.all([
          fetch(`${apiUrl}/api/cohortes/disponibilidad`, { headers: { Authorization: `Bearer ${session?.token}` } }),
          fetch(`${apiUrl}/api/inscripciones/mias`, { headers: { Authorization: `Bearer ${session?.token}` } })
        ])
        const [catalogResult, mineResult] = await Promise.all([
          catalogResponse.json(),
          mineResponse.json()
        ])
        if (!catalogResponse.ok) throw new Error(catalogResult.message || 'No se pudo cargar el catálogo de cohortes')
        if (!mineResponse.ok) throw new Error(mineResult.message || 'No se pudieron cargar tus inscripciones')
        setCatalogCohorts(catalogResult)
        setMyInscripciones(mineResult)
      } catch (error) {
        setCatalogMessage({ type: 'error', text: error.message })
      } finally {
        setCatalogLoading(false)
      }
    }

    loadCatalog()
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

  const handleUserChange = (event) => {
    const { name, value } = event.target
    setUserData((current) => ({ ...current, [name]: value }))
  }

  const handleUserCreate = async (event) => {
    event.preventDefault()
    setUserMessage(null)
    const passwordCreada = userData.password

    try {
      const session = JSON.parse(sessionStorage.getItem('ccgb_session'))
      const response = await fetch(`${apiUrl}/api/usuarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.token}`
        },
        body: JSON.stringify(userData)
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'No se pudo crear el usuario')
      setUsers((current) => [...current, result])
      setUserData({ nombre: '', apellido: '', email: '', password: '', idRol: '' })
      setUserMessage({
        type: 'success',
        text: `Perfil ${roleLabels[result.idRol] || 'usuario'} creado para ${result.nombre} ${result.apellido}. Credenciales a entregar: ${result.email} / ${passwordCreada}`
      })
    } catch (error) {
      setUserMessage({ type: 'error', text: error.message })
    }
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
    setCourseData({ nombre: '', descripcion: '', area_conocimiento: '', nivel: '' })
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
      area_conocimiento: course.area_conocimiento,
      nivel: course.nivel
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
      fechaInicio: fechaHoyInput(),
      fechaFin: '',
      modalidad: 'presencial',
      cupoFisico: '',
      linkAcceso: ''
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

  const handleNivelChange = (event) => {
    const { name, value } = event.target
    setNivelForm((current) => ({ ...current, [name]: value }))
  }

  const handleNivelSubmit = async (event) => {
    event.preventDefault()
    setArancelMessage(null)

    try {
      const session = JSON.parse(sessionStorage.getItem('ccgb_session'))
      const response = await fetch(`${apiUrl}/api/niveles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.token}`
        },
        body: JSON.stringify(nivelForm)
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'No se pudo guardar el nivel')
      setNiveles((current) => [...current, result])
      setNivelForm({ nombre: '', precioInscripcion: '', costoCuotaMensual: '', vigenciaDesde: fechaHoyInput(), vigenciaHasta: '' })
      setArancelMessage({ type: 'success', text: 'Valores del nivel registrados.' })
    } catch (error) {
      setArancelMessage({ type: 'error', text: error.message })
    }
  }

  const handleCategoriaChange = (event) => {
    const { name, value } = event.target
    setCategoriaForm((current) => ({ ...current, [name]: value }))
  }

  const handleCategoriaSubmit = async (event) => {
    event.preventDefault()
    setArancelMessage(null)

    try {
      const session = JSON.parse(sessionStorage.getItem('ccgb_session'))
      const response = await fetch(`${apiUrl}/api/categorias-docente`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.token}`
        },
        body: JSON.stringify(categoriaForm)
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'No se pudo guardar la categoría')
      setCategoriasDocente((current) => [...current, result])
      setCategoriaForm({ nombre: '', tarifaHora: '', vigenciaDesde: fechaHoyInput(), vigenciaHasta: '' })
      setArancelMessage({ type: 'success', text: 'Tarifa por hora registrada.' })
    } catch (error) {
      setArancelMessage({ type: 'error', text: error.message })
    }
  }

  const handleAsignacionChange = (event) => {
    const { name, value } = event.target
    setAsignacionForm((current) => ({ ...current, [name]: value }))
  }

  const handleAsignacionSubmit = async (event) => {
    event.preventDefault()
    setArancelMessage(null)
    setHistorialDocente(null)

    try {
      const session = JSON.parse(sessionStorage.getItem('ccgb_session'))
      const response = await fetch(`${apiUrl}/api/docentes/${asignacionForm.idDocente}/categoria`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.token}`
        },
        body: JSON.stringify({ idCategoria: asignacionForm.idCategoria, desde: asignacionForm.desde, hasta: asignacionForm.hasta || null })
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'No se pudo asignar la categoría')
      setDocentesConCategoria((current) => current.map((docente) => String(docente.id) === String(asignacionForm.idDocente)
        ? { ...docente, idCategoria: result.idCategoria, categoriaNombre: result.categoriaNombre, tarifaHora: result.tarifaHora, desde: result.desde, hasta: result.hasta }
        : docente))
      setAsignacionForm({ idDocente: '', idCategoria: '', desde: fechaHoyInput(), hasta: '' })
      setArancelMessage({ type: 'success', text: `Categoría asignada a ${docenteSeleccionado?.nombre || 'docente'}.` })
    } catch (error) {
      setArancelMessage({ type: 'error', text: error.message })
    }
  }

  const verHistorialDocente = async (docente) => {
    setArancelMessage(null)
    try {
      const session = JSON.parse(sessionStorage.getItem('ccgb_session'))
      const response = await fetch(`${apiUrl}/api/docentes/${docente.id}/historial`, {
        headers: { Authorization: `Bearer ${session?.token}` }
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'No se pudo cargar el historial')
      setHistorialDocente({ ...result, docente })
    } catch (error) {
      setArancelMessage({ type: 'error', text: error.message })
    }
  }

  const handleEnroll = async (cohorte) => {
    setCatalogMessage(null)
    setEnrollingId(cohorte.id)

    try {
      const session = JSON.parse(sessionStorage.getItem('ccgb_session'))
      const response = await fetch(`${apiUrl}/api/inscripciones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.token}`
        },
        body: JSON.stringify({ idCohorte: cohorte.id })
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'No se pudo completar la inscripción')

      setMyInscripciones((current) => [...current, result])
      setCatalogCohorts((current) => current.map((item) => item.id === cohorte.id
        ? {
            ...item,
            cuposOcupados: item.cuposOcupados + 1,
            cuposDisponibles: item.cuposDisponibles === null ? null : item.cuposDisponibles - 1,
            estadoDisponibilidad: item.cuposDisponibles !== null && item.cuposDisponibles - 1 <= 0
              ? 'Cupo Agotado'
              : item.estadoDisponibilidad
          }
        : item))
      setCatalogMessage({ type: 'success', text: `Te inscribiste a "${cohorte.nombre || cohorte.cursoNombre}". Tu inscripción quedó pendiente de pago.` })
    } catch (error) {
      setCatalogMessage({ type: 'error', text: error.message })
    } finally {
      setEnrollingId(null)
    }
  }

  const formatMoney = (value) => {
    return new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 }).format(Number(value))
  }

  const formatFecha = (value) => {
  if (!value) return '—'
  const fecha = new Date(value)
  if (Number.isNaN(fecha.getTime())) return '—'
  return new Intl.DateTimeFormat('es-PY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(fecha)
}

  const esVigente = (fila) => {
    return !fila.vigenciaHasta && (!fila.vigenciaDesde || new Date(fila.vigenciaDesde) <= new Date())
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
        authUser.idRol === 3 && ['usuarios', 'cursos', 'cohortes', 'aranceles'].includes(route) ? (
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
                      <button type="button" className={userRoleFilter === 'all' ? 'active' : ''} onClick={() => { setUserRoleFilter('all'); setUserPage(1) }}>{users.length} activos</button>
                      <button type="button" className={userRoleFilter === '2' ? 'active' : ''} onClick={() => { setUserRoleFilter('2'); setUserPage(1) }}>{countByRole(2)} docentes</button>
                      <button type="button" className={userRoleFilter === '1' ? 'active' : ''} onClick={() => { setUserRoleFilter('1'); setUserPage(1) }}>{countByRole(1)} estudiantes</button>
                      <button type="button" className={userRoleFilter === '3' ? 'active' : ''} onClick={() => { setUserRoleFilter('3'); setUserPage(1) }}>{countByRole(3)} administradores</button>
                    </div>
                    <a className="secondary-button back-link" href="#panel">Volver al panel</a>
                  </div>
                </div>
                {userMessage && <p className={`form-message ${userMessage.type}`} role="status">{userMessage.text}</p>}
                <form className="course-form user-create-form" onSubmit={handleUserCreate}>
                  <label>Nombre<input name="nombre" value={userData.nombre} onChange={handleUserChange} required /></label>
                  <label>Apellido<input name="apellido" value={userData.apellido} onChange={handleUserChange} required /></label>
                  <label>Email<input name="email" type="email" value={userData.email} onChange={handleUserChange} required /></label>
                  <label>Contraseña<input name="password" type="password" minLength="8" pattern="(?=.*[A-Za-z])(?=.*\d).{8,}" title="Usa al menos 8 caracteres, una letra y un numero" value={userData.password} onChange={handleUserChange} required /></label>
                  <label>Rol<select name="idRol" value={userData.idRol} onChange={handleUserChange} required>
                    <option value="">Seleccionar</option>
                    <option value="2">Docente</option>
                    <option value="1">Estudiante</option>
                    <option value="3">Administrador</option>
                  </select></label>
                  <div className="course-form-actions"><button className="register-button" type="submit">Crear usuario</button></div>
                </form>
                <div className="course-filters user-filters">
                  <label>Buscar por nombre, apellido o email<input value={userSearch} onChange={(event) => { setUserSearch(event.target.value); setUserPage(1) }} placeholder="Ej. ana@mail.com" /></label>
                  <label>Rol<select value={userRoleFilter} onChange={(event) => { setUserRoleFilter(event.target.value); setUserPage(1) }}>
                    <option value="all">Todos</option>
                    <option value="1">Estudiantes</option>
                    <option value="2">Docentes</option>
                    <option value="3">Administradores</option>
                  </select></label>
                </div>
                <div className="course-table-wrap">
                  {usersLoading ? <p className="empty-state">Cargando usuarios...</p> : users.length === 0 ? <p className="empty-state">Todavía no hay usuarios activos.</p> : visibleUsers.length === 0 ? <p className="empty-state">No hay usuarios que coincidan con el filtro.</p> : (
                    <>
                    <table className="course-table user-table">
                      <thead><tr><th>Usuario</th><th>Email</th><th>Rol</th><th>Acciones</th></tr></thead>
                      <tbody>{pagedUsers.map((user) => (
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
                    <Paginator
                      page={currentUserPage}
                      pageSize={userPageSize}
                      total={visibleUsers.length}
                      onPage={setUserPage}
                      onPageSize={(size) => { setUserPageSize(size); setUserPage(1) }}
                    />
                    </>
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
                <label>Nivel<select name="nivel" value={courseData.nivel} onChange={handleCourseChange} required>
                  <option value="">Seleccionar nivel</option>
                  <option value="principiante">Principiante</option>
                  <option value="intermedio">Intermedio</option>
                  <option value="avanzado">Avanzado</option>
                </select></label>
                <label className="course-description">Descripción<textarea name="descripcion" value={courseData.descripcion} onChange={handleCourseChange} required /></label>
                <div className="course-form-actions">
                  <button className="register-button" type="submit">{editingCourseId === null ? 'Crear curso' : 'Guardar cambios'}</button>
                  {editingCourseId !== null && <button className="secondary-button" type="button" onClick={resetCourseForm}>Cancelar</button>}
                </div>
              </form>
              {courseMessage && <p className={`form-message ${courseMessage.type}`} role="status">{courseMessage.text}</p>}
              <div className="course-filters">
                <label>Buscar curso o área<input value={courseSearch} onChange={(event) => { setCourseSearch(event.target.value); setCoursePage(1) }} placeholder="Ej. Tecnología" /></label>
                <label>Estado<select value={courseStatus} onChange={(event) => { setCourseStatus(event.target.value); setCoursePage(1) }}><option value="all">Todos</option><option value="active">Activos</option><option value="inactive">Inactivos</option></select></label>
              </div>
              <div className="course-table-wrap">
                {coursesLoading ? <p className="empty-state">Cargando cursos...</p> : courses.length === 0 ? <p className="empty-state">Todavía no hay cursos registrados.</p> : visibleCourses.length === 0 ? <p className="empty-state">No hay cursos que coincidan con el filtro.</p> : (
                  <>
                  <table className="course-table">
                    <thead><tr><th>Curso</th><th>Nivel</th><th>Descripción</th><th>Área</th><th>Estado</th><th>Acciones</th></tr></thead>
                    <tbody>{pagedCourses.map((course) => (
                      <tr key={course.id} className={!course.activo ? 'inactive-row' : ''}>
                        <td>{course.nombre}</td><td>{nivelLabels[course.nivel] || course.nivel}</td><td>{course.descripcion}</td><td>{course.area_conocimiento}</td>
                        <td><span className={`course-state ${course.activo ? 'active' : 'inactive'}`}>{course.activo ? 'Activo' : 'Inactivo'}</span></td>
                        <td className="course-actions"><button type="button" onClick={() => handleEditCourse(course)}>Editar</button><button type="button" onClick={() => handleToggleCourse(course)}>{course.activo ? 'Desactivar' : 'Activar'}</button></td>
                      </tr>
                    ))}</tbody>
                  </table>
                  <Paginator
                    page={currentCoursePage}
                    pageSize={coursePageSize}
                    total={visibleCourses.length}
                    onPage={setCoursePage}
                    onPageSize={(size) => { setCoursePageSize(size); setCoursePage(1) }}
                  />
                  </>
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
                    {courses.map((course) => <option key={course.id} value={course.id}>{course.nombre} — {nivelLabels[course.nivel] || course.nivel}</option>)}
                  </select></label>
                  <label>Docente<select name="idDocente" value={cohortData.idDocente} onChange={handleCohortChange} required>
                    <option value="">Seleccionar docente</option>
                    {docentesConCategoria.map((docente) => <option key={docente.id} value={docente.id}>{docente.nombre} {docente.apellido}{docente.categoriaNombre ? ` — ${nivelLabels[docente.categoriaNombre] || docente.categoriaNombre}` : ''}</option>)}
                  </select></label>
                  <label>Nombre de la cohorte<input name="nombre" value={cohortData.nombre} onChange={handleCohortChange} placeholder="Ej. Cohorte 2026-A" /></label>
                  <label>Modalidad<select name="modalidad" value={cohortData.modalidad} onChange={handleCohortChange}>
                    <option value="presencial">Presencial</option>
                    <option value="virtual">Virtual</option>
                    <option value="hibrida">Híbrida</option>
                  </select></label>
                  <label className="form-field-full">Inicio<input name="fechaInicio" type="date" value={cohortData.fechaInicio} onChange={handleCohortChange} required /></label>
                  <label className="form-field-full">Fin<input name="fechaFin" type="date" value={cohortData.fechaFin} onChange={handleCohortChange} required /></label>
                  {(cohortData.modalidad === 'presencial' || cohortData.modalidad === 'hibrida') && (
                    <label className="form-field-full">Cupo físico<input name="cupoFisico" type="number" min="1" value={cohortData.cupoFisico} onChange={handleCohortChange} required /></label>
                  )}
                  {(cohortData.modalidad === 'virtual' || cohortData.modalidad === 'hibrida') && (
                    <label>Link de acceso (videoconferencia)<input name="linkAcceso" type="url" value={cohortData.linkAcceso} onChange={handleCohortChange} placeholder="https://..." required /></label>
                  )}
                  <div className="course-form-actions">
                    <button className="register-button" type="submit">Crear cohorte</button>
                  </div>
                </form>
                {nivelCursoSeleccionado && (
                  <div className="arancel-block">
                    <h3>Valores del curso</h3>
                    <p className="form-message derived-info">Nivel {nivelLabels[nivelCursoSeleccionado.nivel] || nivelCursoSeleccionado.nivel}</p>
                    <p className="form-message derived-info">Precio de inscripción: <strong>{nivelCursoSeleccionado.precioInscripcion != null ? formatMoney(nivelCursoSeleccionado.precioInscripcion) : '— sin precio vigente'}</strong></p>
                    <p className="form-message derived-info">Cuota mensual: <strong>{nivelCursoSeleccionado.costoCuotaMensual != null ? formatMoney(nivelCursoSeleccionado.costoCuotaMensual) : '— sin cuota vigente'}</strong></p>
                  </div>
                )}
                {docenteSeleccionado && (
                  <p className="form-message derived-info">Tarifa por hora del docente: <strong>{docenteSeleccionado.tarifaHora ? formatMoney(docenteSeleccionado.tarifaHora) : '— sin categoría asignada'}</strong>{docenteSeleccionado.categoriaNombre ? ` (categoría ${nivelLabels[docenteSeleccionado.categoriaNombre] || docenteSeleccionado.categoriaNombre})` : ''}</p>
                )}
                {cohortMessage && <p className={`form-message ${cohortMessage.type}`} role="status">{cohortMessage.text}</p>}
                <div className="course-filters cohort-filters">
                  <label>Buscar cohorte<input value={cohortSearch} onChange={(event) => { setCohortSearch(event.target.value); setCohortPage(1) }} placeholder="Curso, docente o nombre" /></label>
                  <label>Inicio desde<input type="date" value={cohortFechaDesde} onChange={(event) => { setCohortFechaDesde(event.target.value); setCohortPage(1) }} /></label>
                  <label>Inicio hasta<input type="date" value={cohortFechaHasta} onChange={(event) => { setCohortFechaHasta(event.target.value); setCohortPage(1) }} /></label>
                </div>
                <div className="course-table-wrap">
                  {cohortsLoading ? <p className="empty-state">Cargando cohortes...</p> : cohorts.length === 0 ? <p className="empty-state">Todavía no hay cohortes registradas.</p> : visibleCohorts.length === 0 ? <p className="empty-state">No hay cohortes que coincidan con el filtro.</p> : (
                    <>
                    <table className="course-table">
                      <thead><tr><th>Curso</th><th>Docente</th><th>Fechas</th><th>Modalidad</th><th>Cupo</th><th>Cuota mensual</th><th>Precio insc.</th><th>Tarifa/hora</th></tr></thead>
                      <tbody>{pagedCohorts.map((cohorte) => (
                        <tr key={cohorte.id}>
                          <td>{cohorte.cursoNombre}</td>
                          <td>{cohorte.docenteNombre} {cohorte.docenteApellido}</td>
                          <td>{cohorte.fechaInicio} → {cohorte.fechaFin}</td>
                          <td>{modalidadLabels[cohorte.modalidad] || cohorte.modalidad}</td>
                          <td>{cohorte.cupoFisico ?? '—'}</td>
                          <td>{formatMoney(cohorte.costoCuotaMensual)}</td>
                          <td>{cohorte.precioInscripcion != null ? formatMoney(cohorte.precioInscripcion) : '—'}</td>
                          <td>{cohorte.tarifaHora != null ? formatMoney(cohorte.tarifaHora) : '—'}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                    <Paginator
                      page={currentCohortPage}
                      pageSize={cohortPageSize}
                      total={visibleCohorts.length}
                      onPage={setCohortPage}
                      onPageSize={(size) => { setCohortPageSize(size); setCohortPage(1) }}
                    />
                    </>
                  )}
                </div>
              </section>
              )}
              {route === 'aranceles' && (
              <section className="courses-panel" id="aranceles">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">ARANCELES</p>
                    <h2>Niveles, categorías y tarifas</h2>
                  </div>
                  <a className="secondary-button back-link" href="#panel">Volver al panel</a>
                </div>
                {arancelMessage && <p className={`form-message ${arancelMessage.type}`} role="status">{arancelMessage.text}</p>}
                <div className="aranceles-grid">
                  <div className="arancel-block">
                    <h3>Precio de inscripción por nivel de curso</h3>
                    <form className="course-form" onSubmit={handleNivelSubmit}>
                      <label>Nivel<select name="nombre" value={nivelForm.nombre} onChange={handleNivelChange} required>
                        <option value="">Seleccionar</option>
                        <option value="principiante">Principiante</option>
                        <option value="intermedio">Intermedio</option>
                        <option value="avanzado">Avanzado</option>
                      </select></label>
                      <label>Precio de inscripción<input name="precioInscripcion" type="number" min="1" step="0.01" value={nivelForm.precioInscripcion} onChange={handleNivelChange} required /></label>
                      <label>Cuota mensual<input name="costoCuotaMensual" type="number" min="1" step="0.01" value={nivelForm.costoCuotaMensual} onChange={handleNivelChange} required /></label>
                      <label className="form-field-full">Vigencia desde<input name="vigenciaDesde" type="date" value={nivelForm.vigenciaDesde} onChange={handleNivelChange} required /></label>
                      <label className="form-field-full">Vigencia hasta (vacío = vigente)<input name="vigenciaHasta" type="date" value={nivelForm.vigenciaHasta} onChange={handleNivelChange} /></label>
                      <div className="course-form-actions"><button className="register-button" type="submit">Registrar valores</button></div>
                    </form>
                    <div className="course-table-wrap">
                      <table className="course-table">
                        <thead><tr><th>Nivel</th><th>Precio insc.</th><th>Cuota mensual</th><th>Vigencia</th></tr></thead>
                        <tbody>{niveles.map((nivel) => (
                          <tr key={nivel.id} className={esVigente(nivel) ? 'arancel-vigente' : 'inactive-row'}>
                            <td>{nivelLabels[nivel.nombre] || nivel.nombre}</td>
                            <td>{formatMoney(nivel.precioInscripcion)}</td>
                            <td>{formatMoney(nivel.costoCuotaMensual)}</td>
                            <td>{formatFecha(nivel.vigenciaDesde)} → {nivel.vigenciaHasta ? formatFecha(nivel.vigenciaHasta) : <span className="arancel-tag">vigente</span>}</td>
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>
                  </div>
                  <div className="arancel-block">
                    <h3>Tarifa por hora de categoría docente</h3>
                    <form className="course-form" onSubmit={handleCategoriaSubmit}>
                      <label>Categoría<select name="nombre" value={categoriaForm.nombre} onChange={handleCategoriaChange} required>
                        <option value="">Seleccionar</option>
                        <option value="principiante">Principiante</option>
                        <option value="intermedio">Intermedio</option>
                        <option value="avanzado">Avanzado</option>
                      </select></label>
                      <label>Tarifa por hora<input name="tarifaHora" type="number" min="1" step="0.01" value={categoriaForm.tarifaHora} onChange={handleCategoriaChange} required /></label>
                      <label className="form-field-full">Vigencia desde<input name="vigenciaDesde" type="date" value={categoriaForm.vigenciaDesde} onChange={handleCategoriaChange} required /></label>
                      <label className="form-field-full">Vigencia hasta (vacío = vigente)<input name="vigenciaHasta" type="date" value={categoriaForm.vigenciaHasta} onChange={handleCategoriaChange} /></label>
                      <div className="course-form-actions"><button className="register-button" type="submit">Registrar tarifa</button></div>
                    </form>
                    <div className="course-table-wrap">
                      <table className="course-table">
                        <thead><tr><th>Categoría</th><th>Tarifa/hora</th><th>Vigencia</th></tr></thead>
                        <tbody>{categoriasDocente.map((categoria) => (
                          <tr key={categoria.id} className={esVigente(categoria) ? 'arancel-vigente' : 'inactive-row'}>
                            <td>{nivelLabels[categoria.nombre] || categoria.nombre}</td>
                            <td>{formatMoney(categoria.tarifaHora)}</td>
                            <td>{formatFecha(categoria.vigenciaDesde)} → {categoria.vigenciaHasta ? formatFecha(categoria.vigenciaHasta) : <span className="arancel-tag">vigente</span>}</td>
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div className="arancel-block asignaciones">
                  <h3>Asignar categoría a docente</h3>
                  <form className="course-form" onSubmit={handleAsignacionSubmit}>
                    <label>Docente<select name="idDocente" value={asignacionForm.idDocente} onChange={handleAsignacionChange} required>
                      <option value="">Seleccionar docente</option>
                      {docentesConCategoria.map((docente) => <option key={docente.id} value={docente.id}>{docente.nombre} {docente.apellido}{docente.categoriaNombre ? ` (${nivelLabels[docente.categoriaNombre] || docente.categoriaNombre})` : ' — sin categoría'}</option>)}
                    </select></label>
                    <label>Categoría<select name="idCategoria" value={asignacionForm.idCategoria} onChange={handleAsignacionChange} required>
                      <option value="">Seleccionar</option>
                      <option value="1">Principiante</option>
                      <option value="2">Intermedio</option>
                      <option value="3">Avanzado</option>
                    </select></label>
                    <label className="form-field-full">Desde<input name="desde" type="date" value={asignacionForm.desde} onChange={handleAsignacionChange} required /></label>
                    <label className="form-field-full">Hasta (vacío = vigente)<input name="hasta" type="date" value={asignacionForm.hasta} onChange={handleAsignacionChange} /></label>
                    <div className="course-form-actions"><button className="register-button" type="submit">Asignar</button></div>
                  </form>
                  <div className="course-table-wrap">
                    <table className="course-table">
                      <thead><tr><th>Docente</th><th>Categoría actual</th><th>Tarifa/hora</th><th>Historial</th></tr></thead>
                      <tbody>{docentesConCategoria.map((docente) => (
                        <tr key={docente.id} className={docente.categoriaNombre ? 'arancel-vigente' : 'inactive-row'}>
                          <td>{docente.nombre} {docente.apellido}</td>
                          <td>{docente.categoriaNombre ? <>{nivelLabels[docente.categoriaNombre] || docente.categoriaNombre} (desde {formatFecha(docente.desde)}) <span className="arancel-tag">actual</span></> : 'Sin categoría'}</td>
                          <td>{docente.tarifaHora != null ? formatMoney(docente.tarifaHora) : '—'}</td>
                          <td className="course-actions"><button type="button" onClick={() => verHistorialDocente(docente)}>Ver historial</button></td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                  {historialDocente && (
                    <div className="historial-box">
                      <h3>Historial de {historialDocente.docente.nombre} {historialDocente.docente.apellido}{historialDocente.categoriaActual ? ` — actual: ${nivelLabels[historialDocente.categoriaActual.categoriaNombre] || historialDocente.categoriaActual.categoriaNombre} (desde ${formatFecha(historialDocente.categoriaActual.desde)})` : ''}</h3>
                      <table className="course-table">
                        <thead><tr><th>Categoría</th><th>Tarifa/hora</th><th>Desde</th><th>Hasta</th></tr></thead>
                        <tbody>{historialDocente.historial.map((item) => (
                          <tr key={item.id}>
                            <td>{nivelLabels[item.categoriaNombre] || item.categoriaNombre}</td>
                            <td>{formatMoney(item.tarifaHora)}</td>
                            <td>{formatFecha(item.desde)}</td>
                            <td>{item.hasta ? formatFecha(item.hasta) : 'vigente'}</td>
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>
                  )}
                </div>
              </section>
              )}
            </>
          ) : authUser.idRol === 1 && route === 'catalogo' ? (
            <section className="courses-panel" id="catalogo">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">CATÁLOGO</p>
                  <h2>Cohortes disponibles</h2>
                </div>
                <a className="secondary-button back-link" href="#panel">Volver al panel</a>
              </div>
              {catalogMessage && <p className={`form-message ${catalogMessage.type}`} role="status">{catalogMessage.text}</p>}
              <div className="course-filters cohort-filters">
                <label>Buscar cohorte<input value={catalogSearch} onChange={(event) => setCatalogSearch(event.target.value)} placeholder="Curso, docente o nombre" /></label>
              </div>
              <div className="course-table-wrap">
                {catalogLoading ? <p className="empty-state">Cargando cohortes...</p> : catalogCohorts.length === 0 ? <p className="empty-state">Todavía no hay cohortes disponibles.</p> : visibleCatalogCohorts.length === 0 ? <p className="empty-state">No hay cohortes que coincidan con el filtro.</p> : (
                  <table className="course-table">
                    <thead><tr><th>Curso</th><th>Docente</th><th>Fechas</th><th>Modalidad</th><th>Cupo</th><th>Precio inscripción</th><th>Estado</th><th>Acción</th></tr></thead>
                    <tbody>{visibleCatalogCohorts.map((cohorte) => {
                      const agotado = cohorte.estadoDisponibilidad === 'Cupo Agotado'
                      const yaInscrito = misIdsCohorteActivos.has(cohorte.id)
                      return (
                        <tr key={cohorte.id}>
                          <td>{cohorte.cursoNombre}</td>
                          <td>{cohorte.docenteNombre} {cohorte.docenteApellido}</td>
                          <td>{formatFecha(cohorte.fechaInicio)} → {formatFecha(cohorte.fechaFin)}</td>
                          <td>{modalidadLabels[cohorte.modalidad] || cohorte.modalidad}</td>
                          <td>{cohorte.cuposDisponibles === null ? 'Sin límite' : cohorte.cuposDisponibles}</td>
                          <td>{formatMoney(cohorte.precioInscripcion)}</td>
                          <td><span className={`course-state ${agotado ? 'inactive' : 'active'}`}>{cohorte.estadoDisponibilidad}</span></td>
                          <td className="course-actions">
                            {yaInscrito ? (
                              <span className="empty-state">Ya inscripto</span>
                            ) : (
                              <button
                                type="button"
                                className="register-button"
                                disabled={agotado || enrollingId === cohorte.id}
                                onClick={() => handleEnroll(cohorte)}
                              >
                                {enrollingId === cohorte.id ? 'Inscribiendo...' : agotado ? 'Cupo Agotado' : 'Inscribirme'}
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}</tbody>
                  </table>
                )}
              </div>
            </section>
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
                    <span className="admin-card-desc">Modalidades, cupos y fechas.</span>
                  </a>
                  <a className="admin-card" href="#aranceles">
                    <span className="eyebrow">ARANCELES</span>
                    <strong>Niveles y categorías</strong>
                    <span className="admin-card-desc">Precios de inscripción y tarifas por hora, con vigencia.</span>
                  </a>
                </section>
              )}
              {authUser.idRol === 1 && (
                <section className="admin-nav" aria-label="Secciones de estudiante">
                  <a className="admin-card" href="#catalogo">
                    <span className="eyebrow">CATÁLOGO</span>
                    <strong>Ver cohortes disponibles</strong>
                    <span className="admin-card-desc">Elegí tu modalidad y reservá tu lugar.</span>
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
