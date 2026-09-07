import './App.css'

function App() {
  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="CCGB inicio">
          <span className="brand-mark">C</span>
          <span>CCGB</span>
        </a>
        <nav aria-label="Navegacion principal">
          <a className="active" href="#resumen">Resumen</a>
          <a href="#cursos">Cursos</a>
          <a href="#usuarios">Usuarios</a>
        </nav>
        <button className="profile-button" type="button" aria-label="Abrir perfil">
          <span>CG</span>
        </button>
      </header>

      <section className="intro" id="resumen">
        <div>
          <p className="eyebrow">GESTION ACADEMICA / 2026</p>
          <h1>Un lugar claro para que el aprendizaje avance.</h1>
          <p className="intro-copy">
            Cursos, cohortes y personas reunidos en un mismo espacio de trabajo.
          </p>
        </div>
        <div className="intro-note">
          <span className="status-dot" />
          <span>API conectada</span>
          <strong>PostgreSQL</strong>
        </div>
      </section>

      <section className="stats" aria-label="Indicadores principales">
        <article><span>Cursos activos</span><strong>08</strong><small>+2 este mes</small></article>
        <article><span>Estudiantes</span><strong>124</strong><small>12 registros nuevos</small></article>
        <article><span>Cupos ocupados</span><strong>76%</strong><small>En todas las cohortes</small></article>
      </section>

      <section className="workspace" id="cursos">
        <div className="section-heading">
          <div>
            <p className="eyebrow">ACTIVIDAD RECIENTE</p>
            <h2>Cursos que estan tomando forma</h2>
          </div>
          <button className="text-button" type="button">Ver todos <span aria-hidden="true">-&gt;</span></button>
        </div>
        <div className="course-list">
          <article className="course-row"><span className="course-number">01</span><div><h3>Analisis de datos para decisiones</h3><p>Presencial / 24 horas</p></div><span className="course-state">Activo</span></article>
          <article className="course-row"><span className="course-number">02</span><div><h3>Gestion de proyectos agiles</h3><p>Hibrido / 32 horas</p></div><span className="course-state">Activo</span></article>
          <article className="course-row"><span className="course-number">03</span><div><h3>Introduccion al desarrollo web</h3><p>Virtual / 40 horas</p></div><span className="course-state">Proximo</span></article>
        </div>
      </section>

      <footer id="usuarios"><span>CCGB</span><span>Plataforma de gestion academica</span><span>v0.1.0</span></footer>
    </main>
  )
}

export default App
