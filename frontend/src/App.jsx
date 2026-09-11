import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [cursos, setCursos] = useState([]);

  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  const [usuario, setUsuario] = useState(
    JSON.parse(localStorage.getItem("usuario"))
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [areaConocimiento, setAreaConocimiento] = useState("");

  const [cursoEditando, setCursoEditando] = useState(null);

  const iniciarSesion = async () => {
    try {
      setError("");

      const respuesta = await fetch(
        "http://localhost:3000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setError(datos.message);
        return;
      }

      localStorage.setItem("token", datos.token);

      localStorage.setItem(
        "usuario",
        JSON.stringify(datos.usuario)
      );

      setToken(datos.token);
      setUsuario(datos.usuario);
    } catch (error) {
      console.error(error);
      setError("No se pudo conectar con el servidor");
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");

    setToken(null);
    setUsuario(null);
    setCursos([]);
  };

  const obtenerCursos = async () => {
    try {
      const respuesta = await fetch(
        "http://localhost:3000/api/cursos",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        console.error(datos.message);
        return;
      }

      setCursos(datos);
    } catch (error) {
      console.error(
        "Error al obtener los cursos:",
        error
      );
    }
  };

  const limpiarFormulario = () => {
    setNombre("");
    setDescripcion("");
    setAreaConocimiento("");
    setCursoEditando(null);
    setMostrarFormulario(false);
  };

  const guardarCurso = async () => {
    if (nombre.trim() === "") {
      alert("El nombre del curso es obligatorio");
      return;
    }

    if (descripcion.trim() === "") {
      alert(
        "La descripción del curso es obligatoria"
      );
      return;
    }

    if (areaConocimiento.trim() === "") {
      alert(
        "El área de conocimiento es obligatoria"
      );
      return;
    }

    try {
      let respuesta;

      if (cursoEditando) {
        respuesta = await fetch(
          `http://localhost:3000/api/cursos/${cursoEditando.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              nombre: nombre,
              descripcion: descripcion,
              area_conocimiento: areaConocimiento,
            }),
          }
        );
      } else {
        respuesta = await fetch(
          "http://localhost:3000/api/cursos",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              id_usuario: usuario.id,
              nombre: nombre,
              descripcion: descripcion,
              area_conocimiento: areaConocimiento,
            }),
          }
        );
      }

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        alert(datos.message);
        return;
      }

      limpiarFormulario();
      obtenerCursos();

    } catch (error) {
      console.error(
        "Error al guardar el curso:",
        error
      );

      alert("No se pudo guardar el curso");
    }
  };

  const editarCurso = (curso) => {
    setNombre(curso.nombre);
    setDescripcion(curso.descripcion);
    setAreaConocimiento(
      curso.area_conocimiento
    );

    setCursoEditando(curso);
    setMostrarFormulario(true);
  };

  const cambiarEstadoCurso = async (curso) => {
    try {
      const respuesta = await fetch(
        `http://localhost:3000/api/cursos/${curso.id}/estado`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            activo: !curso.activo,
          }),
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        alert(datos.message);
        return;
      }

      obtenerCursos();

    } catch (error) {
      console.error(
        "Error al cambiar el estado:",
        error
      );

      alert(
        "No se pudo cambiar el estado del curso"
      );
    }
  };

  useEffect(() => {
    if (token) {
      obtenerCursos();
    }
  }, [token]);

  if (!token) {
    return (
      <main className="app-shell">
        <section className="intro">
          <div>
            <p className="eyebrow">
              GESTION ACADEMICA / 2026
            </p>

            <h1>
              Un lugar claro para que el aprendizaje avance.
            </h1>

            <p className="intro-copy">
              Ingresá para administrar los cursos de CCGB.
            </p>
          </div>

          <div className="intro-note">
            <span className="status-dot" />
            <span>API conectada</span>
            <strong>PostgreSQL</strong>
          </div>
        </section>

        <section className="workspace">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                ACCESO
              </p>

              <h2>
                Iniciar sesión
              </h2>
            </div>
          </div>

          <div className="formulario">
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />

            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />

            {error && (
              <p>{error}</p>
            )}

            <button
              type="button"
              onClick={iniciarSesion}
            >
              Iniciar sesión
            </button>
          </div>
        </section>

        <footer>
          <span>CCGB</span>

          <span>
            Plataforma de gestion academica
          </span>

          <span>v0.1.0</span>
        </footer>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a
          className="brand"
          href="/"
          aria-label="CCGB inicio"
        >
          <span className="brand-mark">C</span>
          <span>CCGB</span>
        </a>

        <nav aria-label="Navegacion principal">
          <a
            className="active"
            href="#resumen"
          >
            Resumen
          </a>

          <a href="#cursos">
            Cursos
          </a>

          <a href="#usuarios">
            Usuarios
          </a>
        </nav>

        <button
          className="profile-button"
          type="button"
          onClick={cerrarSesion}
          aria-label="Cerrar sesión"
        >
          <span>CG</span>
        </button>
      </header>

      <section
        className="intro"
        id="resumen"
      >
        <div>
          <p className="eyebrow">
            GESTION ACADEMICA / 2026
          </p>

          <h1>
            Un lugar claro para que el aprendizaje avance.
          </h1>

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

      <section
        className="stats"
        aria-label="Indicadores principales"
      >
        <article>
          <span>Cursos activos</span>

          <strong>
            {
              cursos.filter(
                (curso) => curso.activo
              ).length
            }
          </strong>

          <small>
            Cursos registrados
          </small>
        </article>

        <article>
          <span>Estudiantes</span>

          <strong>124</strong>

          <small>
            12 registros nuevos
          </small>
        </article>

        <article>
          <span>Cupos ocupados</span>

          <strong>76%</strong>

          <small>
            En todas las cohortes
          </small>
        </article>
      </section>

      <section
        className="workspace"
        id="cursos"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              ADMINISTRACION
            </p>

            <h2>
              Cursos
            </h2>
          </div>

          <button
            className="text-button"
            type="button"
            onClick={() => {
              limpiarFormulario();
              setMostrarFormulario(true);
            }}
          >
            Nuevo curso
          </button>
        </div>

        {mostrarFormulario && (
          <div className="formulario">
            <h3>
              {cursoEditando
                ? "Editar curso"
                : "Nuevo curso"}
            </h3>

            <input
              type="text"
              placeholder="Nombre del curso"
              value={nombre}
              onChange={(e) =>
                setNombre(e.target.value)
              }
            />

            <input
              type="text"
              placeholder="Descripción"
              value={descripcion}
              onChange={(e) =>
                setDescripcion(e.target.value)
              }
            />

            <input
              type="text"
              placeholder="Área de conocimiento"
              value={areaConocimiento}
              onChange={(e) =>
                setAreaConocimiento(e.target.value)
              }
            />

            <button
              type="button"
              onClick={guardarCurso}
            >
              Guardar
            </button>

            <button
              type="button"
              onClick={limpiarFormulario}
            >
              Cancelar
            </button>
          </div>
        )}

        <div className="course-list">
          {cursos.map((curso, index) => (
            <article
              className="course-row"
              key={curso.id}
            >
              <span className="course-number">
                {String(index + 1).padStart(
                  2,
                  "0"
                )}
              </span>

              <div>
                <h3>
                  {curso.nombre}
                </h3>

                <p>
                  {curso.descripcion} /{" "}
                  {curso.area_conocimiento}
                </p>
              </div>

              <span className="course-state">
                {curso.activo
                  ? "Activo"
                  : "Inactivo"}
              </span>

              <div>
                <button
                  type="button"
                  onClick={() =>
                    editarCurso(curso)
                  }
                >
                  Editar
                </button>

                <button
                  type="button"
                  onClick={() =>
                    cambiarEstadoCurso(curso)
                  }
                >
                  {curso.activo
                    ? "Inactivar"
                    : "Activar"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer id="usuarios">
        <span>CCGB</span>

        <span>
          Plataforma de gestion academica
        </span>

        <span>
          v0.1.0
        </span>
      </footer>
    </main>
  );
}

export default App;