const chipsRoot = document.querySelector("#member-chips");
const gridRoot = document.querySelector("#movies-grid");
const openAddModalBtn = document.querySelector("#open-add-modal");
const modalBackdrop = document.querySelector("#modal-backdrop");
const modalClose = document.querySelector("#modal-close");
const addForm = document.querySelector("#add-form");
const publishBtn = document.querySelector("#publish-btn");
const indicadoSelect = document.querySelector("#indicado-select");
const indicadoNovoInput = document.querySelector("#indicado-novo");
const notaInput = document.querySelector("#nota-input");
const notaSlider = document.querySelector("#nota-slider");
const genreChipsRoot = document.querySelector("#genre-chips");
const toast = document.querySelector("#toast");
const coverUrlInput = document.querySelector("#capa-url-input");
const coverFileInput = document.querySelector("#capa-file-input");
const coverPreview = document.querySelector("#capa-preview");

const availableGenres = ["Suspense", "Drama", "Ação", "Comédia", "Ficção", "Terror"];

const initialRecommendations = [
  {
    id: "r1",
    tipo: "serie",
    titulo: "A Empregada",
    indicadoPor: "Lucas",
    nota: 8,
    plataforma: "Netflix",
    generos: ["Suspense"],
    capa: "assets/images/placeholder.jpg",
    trailer: "",
    criadoEm: Date.now() - 40000
  },
  {
    id: "r2",
    tipo: "filme",
    titulo: "A Empregada",
    indicadoPor: "Lucas",
    nota: 9.5,
    plataforma: "Netflix",
    generos: ["Suspense"],
    capa: "assets/images/placeholder.jpg",
    trailer: "",
    criadoEm: Date.now() - 30000
  },
  {
    id: "r3",
    tipo: "serie",
    titulo: "Ruptura",
    indicadoPor: "Fernanda",
    nota: 9.2,
    plataforma: "Apple TV+",
    generos: ["Drama"],
    capa: "assets/images/placeholder.jpg",
    trailer: "",
    criadoEm: Date.now() - 20000
  },
  {
    id: "r4",
    tipo: "filme",
    titulo: "Duna",
    indicadoPor: "Solange",
    nota: 8.9,
    plataforma: "Max",
    generos: ["Ficção"],
    capa: "assets/images/placeholder.jpg",
    trailer: "",
    criadoEm: Date.now() - 10000
  }
];

const state = {
  activeMember: "Todos",
  recommendations: [...initialRecommendations],
  selectedGenres: [],
  selectedCover: "assets/images/placeholder.jpg"
};

let lastFocusedElement = null;
let toastTimer = null;

function getMembers() {
  return [...new Set(state.recommendations.map((item) => item.indicadoPor))];
}

function capitalizeType(tipo) {
  return tipo === "serie" ? "Série" : "Filme";
}

function getFilteredRecommendations() {
  if (state.activeMember === "Todos") {
    return state.recommendations;
  }

  return state.recommendations.filter((item) => item.indicadoPor === state.activeMember);
}

function createChip(member) {
  const activeClass = member === state.activeMember ? "is-active" : "";
  return `<button type="button" class="chip ${activeClass}" data-member="${member}">${member}</button>`;
}

function renderChips() {
  if (!chipsRoot) {
    return;
  }

  const members = ["Todos", ...getMembers()];
  chipsRoot.innerHTML = members.map(createChip).join("");
}

function renderMemberSelect() {
  if (!indicadoSelect) {
    return;
  }

  const options = [
    '<option value="">Selecione</option>',
    ...getMembers().map((member) => `<option value="${member}">${member}</option>`),
    '<option value="__novo__">Adicionar novo</option>'
  ];

  indicadoSelect.innerHTML = options.join("");
}

function createMovieCard(item) {
  const ratingColor = item.nota >= 9 ? "purple" : "red";
  const generosMarkup = item.generos
    .slice(0, 2)
    .map((genero) => `<span class="card-tag">${genero}</span>`)
    .join("");

  return `
    <article class="movie-card" aria-label="${item.titulo}">
      <img class="movie-image" src="${item.capa || "assets/images/placeholder.jpg"}" alt="${item.titulo}" />
      <span class="movie-rating ${ratingColor}">${item.nota}</span>
      <div class="movie-body">
        <p class="movie-type">${capitalizeType(item.tipo)}</p>
        <h3 class="movie-title">${item.titulo}</h3>
        <p class="movie-by">
          <img src="assets/icons/icon-user.svg" alt="" aria-hidden="true" />
          Indicado por <strong>${item.indicadoPor}</strong>
        </p>
        <div class="movie-tags">
          <span class="card-tag">${item.plataforma}</span>
          ${generosMarkup}
        </div>
        <button class="trailer-btn" type="button" data-trailer="${item.trailer}">
          <img src="assets/icons/icon-play.svg" alt="" aria-hidden="true" />
          Assistir ao trailer
        </button>
      </div>
    </article>
  `;
}

function renderGrid() {
  if (!gridRoot) {
    return;
  }

  const filtered = getFilteredRecommendations();

  if (!filtered.length) {
    gridRoot.innerHTML = "<p>Nenhuma indicação para este membro.</p>";
    return;
  }

  gridRoot.innerHTML = filtered.map(createMovieCard).join("");
}

function renderGenreChips() {
  if (!genreChipsRoot) {
    return;
  }

  genreChipsRoot.innerHTML = availableGenres
    .map((genre) => {
      const active = state.selectedGenres.includes(genre) ? "is-active" : "";
      return `<button type="button" class="genre-chip ${active}" data-genre="${genre}">${genre}</button>`;
    })
    .join("");
}

function showToast(message) {
  if (!toast) {
    return;
  }

  if (toastTimer) {
    clearTimeout(toastTimer);
  }

  toast.textContent = message;
  toast.hidden = false;
  toastTimer = setTimeout(() => {
    toast.hidden = true;
  }, 2800);
}

function openModal() {
  if (!modalBackdrop || !addForm) {
    return;
  }

  lastFocusedElement = document.activeElement;
  modalBackdrop.hidden = false;
  requestAnimationFrame(() => {
    modalBackdrop.classList.add("is-open");
  });

  addForm.reset();
  state.selectedGenres = [];
  state.selectedCover = "assets/images/placeholder.jpg";
  if (coverPreview) {
    coverPreview.src = state.selectedCover;
  }
  renderGenreChips();
  clearErrors();
  toggleCustomMemberField();
  syncRatingInputs("5");
  updatePublishButtonState();

  const firstField = document.querySelector("#titulo-input");
  if (firstField instanceof HTMLElement) {
    firstField.focus();
  }
}

function closeModal() {
  if (!modalBackdrop) {
    return;
  }

  modalBackdrop.classList.remove("is-open");
  setTimeout(() => {
    modalBackdrop.hidden = true;
  }, 200);

  if (lastFocusedElement instanceof HTMLElement) {
    lastFocusedElement.focus();
  }
}

function syncRatingInputs(value) {
  if (notaInput) {
    notaInput.value = value;
  }
  if (notaSlider) {
    notaSlider.value = value;
  }
}

function getFieldElement(fieldName) {
  return document.querySelector(`[data-field="${fieldName}"]`);
}

function setFieldError(fieldName, message) {
  const fieldElement = getFieldElement(fieldName);
  const errorElement = document.querySelector(`#error-${fieldName}`);

  if (fieldElement) {
    fieldElement.classList.toggle("has-error", Boolean(message));
  }

  if (errorElement) {
    errorElement.textContent = message;
  }
}

function clearErrors() {
  ["titulo", "indicadoPor", "nota", "plataforma"].forEach((fieldName) => {
    setFieldError(fieldName, "");
  });
}

function normalizeName(name) {
  const trimmed = name.trim().replace(/\s+/g, " ");
  if (!trimmed) {
    return "";
  }

  return trimmed
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function getSelectedMember() {
  if (!indicadoSelect) {
    return "";
  }

  if (indicadoSelect.value === "__novo__") {
    return normalizeName(indicadoNovoInput?.value ?? "");
  }

  return indicadoSelect.value;
}

function validateForm() {
  const errors = {};
  const formData = addForm ? new FormData(addForm) : new FormData();

  const titulo = String(formData.get("titulo") ?? "").trim();
  const indicadoPor = getSelectedMember();
  const nota = Number(formData.get("nota") ?? "");
  const plataforma = String(formData.get("plataforma") ?? "").trim();

  if (!titulo) {
    errors.titulo = "Campo obrigatório";
  }

  if (!indicadoPor) {
    errors.indicadoPor = "Campo obrigatório";
  }

  if (Number.isNaN(nota) || String(formData.get("nota") ?? "").trim() === "") {
    errors.nota = "Campo obrigatório";
  } else if (nota < 0 || nota > 10) {
    errors.nota = "Campo obrigatório";
  }

  if (!plataforma) {
    errors.plataforma = "Campo obrigatório";
  }

  return errors;
}

function updatePublishButtonState() {
  if (!publishBtn) {
    return;
  }

  const hasErrors = Object.keys(validateForm()).length > 0;
  publishBtn.disabled = hasErrors;
}

function toggleCustomMemberField() {
  if (!indicadoSelect || !indicadoNovoInput) {
    return;
  }

  const isCustom = indicadoSelect.value === "__novo__";
  indicadoNovoInput.hidden = !isCustom;
  indicadoNovoInput.required = isCustom;

  if (!isCustom) {
    indicadoNovoInput.value = "";
  }
}

function buildPayload() {
  const formData = new FormData(addForm);
  const nota = Number(formData.get("nota"));

  return {
    id: `r${Date.now()}`,
    tipo: String(formData.get("tipo") ?? "filme"),
    titulo: String(formData.get("titulo") ?? "").trim(),
    indicadoPor: getSelectedMember(),
    nota: Number(nota.toFixed(1)),
    plataforma: String(formData.get("plataforma") ?? "").trim(),
    generos: [...state.selectedGenres],
    capa: state.selectedCover,
    trailer: String(formData.get("trailer") ?? "").trim(),
    criadoEm: Date.now()
  };
}

function updateCoverFromUrl() {
  const url = String(coverUrlInput?.value ?? "").trim();
  if (!url) {
    state.selectedCover = "assets/images/placeholder.jpg";
  } else {
    state.selectedCover = url;
  }

  if (coverPreview) {
    coverPreview.src = state.selectedCover;
  }
}

function updateCoverFromFile(file) {
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const result = typeof reader.result === "string" ? reader.result : "";
    if (!result) {
      return;
    }

    state.selectedCover = result;
    if (coverPreview) {
      coverPreview.src = state.selectedCover;
    }
  };
  reader.readAsDataURL(file);
}

function setLoadingState(isLoading) {
  if (!publishBtn) {
    return;
  }

  publishBtn.classList.toggle("is-loading", isLoading);
  publishBtn.textContent = isLoading ? "Publicando..." : "Publicar recomendação";
  publishBtn.disabled = isLoading || Object.keys(validateForm()).length > 0;
}

function handleSubmit(event) {
  event.preventDefault();

  clearErrors();
  const errors = validateForm();

  if (Object.keys(errors).length > 0) {
    Object.entries(errors).forEach(([field, message]) => {
      setFieldError(field, message);
    });
    updatePublishButtonState();
    return;
  }

  const payload = buildPayload();
  setLoadingState(true);

  setTimeout(() => {
    state.recommendations = [payload, ...state.recommendations];

    if (state.activeMember !== "Todos" && state.activeMember !== payload.indicadoPor) {
      state.activeMember = "Todos";
    }

    renderChips();
    renderMemberSelect();
    renderGrid();
    setLoadingState(false);
    closeModal();
    showToast("Recomendação adicionada com sucesso 🎬");
  }, 700);
}

function setupEvents() {
  chipsRoot?.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) {
      return;
    }

    const member = target.dataset.member;
    if (!member) {
      return;
    }

    state.activeMember = member;
    renderChips();
    renderGrid();
  });

  gridRoot?.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const trailerBtn = target.closest(".trailer-btn");
    if (!(trailerBtn instanceof HTMLButtonElement)) {
      return;
    }

    const trailer = trailerBtn.dataset.trailer;
    if (trailer) {
      window.open(trailer, "_blank", "noopener,noreferrer");
      return;
    }

    showToast("Trailer não informado para esta recomendação.");
  });

  openAddModalBtn?.addEventListener("click", openModal);
  modalClose?.addEventListener("click", closeModal);

  modalBackdrop?.addEventListener("click", (event) => {
    if (event.target === modalBackdrop) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modalBackdrop && !modalBackdrop.hidden) {
      closeModal();
    }
  });

  addForm?.addEventListener("submit", handleSubmit);

  addForm?.addEventListener("input", () => {
    clearErrors();
    updatePublishButtonState();
  });

  addForm?.addEventListener("blur", () => {
    const errors = validateForm();
    ["titulo", "indicadoPor", "nota", "plataforma"].forEach((fieldName) => {
      setFieldError(fieldName, errors[fieldName] ?? "");
    });
  }, true);

  indicadoSelect?.addEventListener("change", () => {
    toggleCustomMemberField();
    updatePublishButtonState();
  });

  notaInput?.addEventListener("input", () => {
    syncRatingInputs(notaInput.value);
    updatePublishButtonState();
  });

  notaSlider?.addEventListener("input", () => {
    syncRatingInputs(notaSlider.value);
    updatePublishButtonState();
  });

  coverUrlInput?.addEventListener("input", updateCoverFromUrl);

  coverFileInput?.addEventListener("change", () => {
    const file = coverFileInput.files?.[0];
    if (!file) {
      return;
    }

    updateCoverFromFile(file);
  });

  genreChipsRoot?.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) {
      return;
    }

    const genre = target.dataset.genre;
    if (!genre) {
      return;
    }

    if (state.selectedGenres.includes(genre)) {
      state.selectedGenres = state.selectedGenres.filter((item) => item !== genre);
    } else {
      state.selectedGenres = [...state.selectedGenres, genre];
    }

    renderGenreChips();
  });
}

renderChips();
renderMemberSelect();
renderGrid();
renderGenreChips();
syncRatingInputs("5");
updatePublishButtonState();
setupEvents();
