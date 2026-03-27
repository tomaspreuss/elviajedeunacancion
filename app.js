;(function () {
  const form = document.getElementById("postulacion-form")
  const statusEl = document.getElementById("form-status")
  const submitBtn = document.getElementById("submit")
  const nextBtn = document.getElementById("next")
  const backBtn = document.getElementById("back")
  const progressBar = document.getElementById("progress-bar")
  const noteEl = document.getElementById("form-note")
  const cta = document.getElementById("cta-postular")
  const formSection = document.getElementById("postula")
  const heroVideo = document.getElementById("hero-video")
  const heroVideoBox = document.querySelector(".hero-video")
  const infoBtn = document.getElementById("cta-info")
  const heroNote = document.getElementById("hero-note")
  const noteLoop = document.getElementById("note-loop")
  const sunEl = document.getElementById("progress-sun")
  const sceneryEl = document.getElementById("progress-scenery")
  const successBanner = document.getElementById("success-banner")
  let infoMode = false

  const hasConfig =
    typeof window !== "undefined" &&
    window.SUPABASE_URL &&
    window.SUPABASE_ANON_KEY &&
    !String(window.SUPABASE_URL).includes("TU_SUPABASE") &&
    !String(window.SUPABASE_ANON_KEY).includes("TU_SUPABASE")

  let supabaseClient = null
  if (hasConfig && window.supabase && window.supabase.createClient) {
    supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY)
  } else {
    if (statusEl) {
      statusEl.textContent = "Configura tus credenciales de Supabase en config.js para activar el formulario."
      statusEl.className = "form-status error"
    }
    if (submitBtn) submitBtn.disabled = true
  }

  const steps = ["nombre", "musica_presente", "cancion", "interes_taller", "ciudad", "email", "haciendo_canciones", "parte_dificil", "modalidad", "expectativas", "link_musica"]
  let current = 0

  function setStatus(message, type) {
    if (!statusEl) return
    statusEl.textContent = message || ""
    statusEl.className = "form-status" + (type ? " " + type : "")
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  function fields() {
    return steps.map((name) => {
      let el = document.getElementById(name)
      if (!el) el = form?.querySelector(`[name="${name}"]`)
      return el ? el.closest(".field") : null
    }).filter(Boolean)
  }

  function focusInput(i) {
    const el = document.querySelector(`.field[data-step="${i}"] input, .field[data-step="${i}"] textarea, .field[data-step="${i}"] select`)
    if (el) el.focus()
  }

  function updateProgress() {
    const total = steps.length - 1
    const ratio = total > 0 ? current / total : 1
    const percent = Math.max(0, Math.min(100, Math.round(ratio * 100)))
    if (progressBar) progressBar.style.width = percent + "%"
    if (sunEl) {
      const left = percent
      const bottom = 12 + Math.sin(ratio * Math.PI) * 14
      sunEl.style.left = `calc(${left}% - 11px)`
      sunEl.style.bottom = `${bottom}px`
    }
    if (sceneryEl) {
      let phase = "day"
      if (ratio >= 0.57) phase = "night"
      else if (ratio >= 0.28) phase = "dusk"
      sceneryEl.dataset.phase = phase
    }
  }

  function showStep(i) {
    const list = fields()
    list.forEach((f) => f.classList.remove("active"))
    const stepEl = document.querySelector(`.field[data-step="${i}"]`)
    if (stepEl) stepEl.classList.add("active")
    if (backBtn) backBtn.style.display = i === 0 ? "none" : ""
    if (nextBtn) {
      const hideNext = i >= steps.length - 1
      nextBtn.hidden = hideNext
      nextBtn.style.display = hideNext ? "none" : ""
    }
    if (submitBtn) {
      const showSubmit = i >= steps.length - 1
      submitBtn.hidden = !showSubmit
      submitBtn.style.display = showSubmit ? "" : "none"
    }
    updateProgress()
    setTimeout(() => focusInput(i), 50)
  }

  function validateStep(i) {
    const name = steps[i]
    const control = form[name]
    const value = (control && control.value !== undefined) ? String(control.value).trim() : ""
    if (name === "nombre" && !value) {
      setStatus("Ingresa tu nombre.", "error")
      return false
    }
    if (name === "email") {
      if (!value) {
        setStatus("Ingresa tu email.", "error")
        return false
      }
      if (!validateEmail(value)) {
        setStatus("Ingresa un email válido.", "error")
        return false
      }
    }
    if (name === "ciudad" && !value) {
      setStatus("Cuéntanos desde qué ciudad nos escribes.", "error")
      return false
    }
    if (["musica_presente","cancion","interes_taller","haciendo_canciones","parte_dificil","modalidad"].includes(name)) {
      const selected = form[name]?.value
      if (!selected) {
        setStatus("Selecciona una opción.", "error")
        return false
      }
    }
    setStatus("")
    return true
  }

  function next() {
    if (!validateStep(current)) return
    current = Math.min(current + 1, steps.length - 1)
    showStep(current)
  }

  function back() {
    current = Math.max(0, current - 1)
    setStatus("")
    showStep(current)
  }

  function revealForm() {
    if (!formSection) return
    formSection.classList.remove("collapsed")
    formSection.setAttribute("aria-hidden", "false")
    if (document && document.body) {
      document.body.classList.add("form-mode")
    }
    current = 0
    showStep(current)
    formSection.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!supabaseClient) return
    const nombre = (form.nombre?.value || "").trim()
    const musica_presente = form.musica_presente?.value || ""
    const cancion = form.cancion?.value || ""
    const interes_taller = form.interes_taller?.value || ""
    const ciudad = (form.ciudad?.value || "").trim()
    const email = (form.email?.value || "").trim()
    const haciendo_canciones = form.haciendo_canciones?.value || ""
    const parte_dificil = form.parte_dificil?.value || ""
    const modalidad = form.modalidad?.value || ""
    const expectativas = (form.expectativas?.value || "").trim()
    const link_musica = (form.link_musica?.value || "").trim()

    if (!nombre || !email || !ciudad) {
      setStatus("Completa nombre, ciudad y email.", "error")
      return
    }
    if (!validateEmail(email)) {
      setStatus("Ingresa un email válido.", "error")
      return
    }
    for (const group of ["musica_presente","cancion","interes_taller","haciendo_canciones","parte_dificil","modalidad"]) {
      if (!form[group]?.value) {
        setStatus("Responde todas las preguntas requeridas.", "error")
        return
      }
    }

    submitBtn.disabled = true
    setStatus("Enviando…")

    const payload = {
      nombre,
      musica_presente,
      cancion,
      interes_taller,
      ciudad,
      email,
      haciendo_canciones,
      parte_dificil,
      modalidad,
      expectativas: expectativas || null,
      link_musica: link_musica || null,
      created_at: new Date().toISOString(),
    }

    const table = window.SUPABASE_TABLE || "postulaciones"
    const { error } = await supabaseClient.from(table).insert(payload)

    if (error) {
      setStatus("No se pudo enviar. Intenta nuevamente.", "error")
      submitBtn.disabled = false
      return
    }

    if (successBanner) {
      successBanner.hidden = false
      successBanner.textContent = "¡Gracias! Recibimos tu postulación."
      formSection.scrollIntoView({ behavior: "smooth", block: "start" })
    }
    setStatus("")
    if (noteEl) noteEl.style.display = "none"
    form.reset()
    current = 0
    showStep(current)
    setTimeout(() => {
      submitBtn.disabled = false
      if (noteEl) noteEl.style.display = ""
      if (successBanner) successBanner.hidden = true
    }, 7000)
  }

  if (form) {
    if (cta) {
      cta.addEventListener("click", function (e) {
        e.preventDefault()
        revealForm()
      })
    }
    if (nextBtn) nextBtn.addEventListener("click", next)
    if (backBtn) backBtn.addEventListener("click", back)
    form.addEventListener("submit", handleSubmit)
    form.addEventListener("keydown", function (e) {
      const isEnter = e.key === "Enter"
      const active = document.activeElement
      if (!isEnter) return
      if (active && active.tagName === "TEXTAREA") return
      if (current < steps.length - 1) {
        e.preventDefault()
        next()
      }
    })
    const radios = form.querySelectorAll('input[type="radio"]')
    radios.forEach((r) => r.addEventListener("change", () => {
      if (current < steps.length - 1) next()
    }))
  }


  if (heroVideo) {
    heroVideo.muted = true
    const tryPlay = () => heroVideo.play().catch(() => {})
    if (heroVideo.readyState >= 2) tryPlay()
    else heroVideo.addEventListener("canplay", tryPlay, { once: true })
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) tryPlay()
    })
    window.addEventListener("focus", tryPlay)
    document.addEventListener("touchstart", tryPlay, { once: true })
    document.addEventListener("click", tryPlay, { once: true })
  }

  function toggleInfo() {
    infoMode = !infoMode
    if (infoMode) {
      if (heroVideoBox) heroVideoBox.hidden = true
      if (heroNote) heroNote.hidden = false
      if (infoBtn) {
        infoBtn.textContent = "Quiero participar"
        infoBtn.classList.add("primary")
      }
      if (noteLoop) {
        noteLoop.muted = true
        noteLoop.play().catch(() => {})
      }
    } else {
      if (heroNote) heroNote.hidden = true
      if (heroVideoBox) heroVideoBox.hidden = false
      if (infoBtn) {
        infoBtn.textContent = "De qué se trata?"
        infoBtn.classList.remove("primary")
      }
      if (noteLoop) {
        noteLoop.pause()
      }
      if (heroVideo) {
        heroVideo.currentTime = heroVideo.currentTime
        heroVideo.play().catch(() => {})
      }
    }
  }

  if (infoBtn) {
    infoBtn.addEventListener("click", function (e) {
      e.preventDefault()
      if (infoMode) {
        revealForm()
      } else {
        toggleInfo()
      }
    })
  }

  if (noteLoop) {
    const tryPlayNote = () => noteLoop.play().catch(() => {})
    if (noteLoop.readyState >= 2) tryPlayNote()
    else noteLoop.addEventListener("canplay", tryPlayNote, { once: true })
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && infoMode) tryPlayNote()
    })
  }
})()
