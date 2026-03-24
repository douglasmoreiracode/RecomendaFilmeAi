const chipsRoot = document.querySelector("#member-chips");
const gridRoot = document.querySelector("#movies-grid");
const heroPoster = document.querySelector("#hero-poster");
const heroLabel = document.querySelector("#hero-label");
const heroName = document.querySelector("#hero-name");
const heroSummary = document.querySelector("#hero-summary");
const heroBy = document.querySelector("#hero-by");
const heroTags = document.querySelector("#hero-tags");
const heroTrailerBtn = document.querySelector("#hero-trailer-btn");
const openAddModalBtn = document.querySelector("#open-add-modal");
const exportDataBtn = document.querySelector("#export-data-btn");
const importDataBtn = document.querySelector("#import-data-btn");
const clearDataBtn = document.querySelector("#clear-data-btn");
const importDataInput = document.querySelector("#import-data-input");
const modalBackdrop = document.querySelector("#modal-backdrop");
const modalClose = document.querySelector("#modal-close");
const modalTitle = document.querySelector("#add-modal-title");
const addForm = document.querySelector("#add-form");
const deleteBtn = document.querySelector("#delete-btn");
const publishBtn = document.querySelector("#publish-btn");
const trailerModalBackdrop = document.querySelector("#trailer-modal-backdrop");
const trailerModalClose = document.querySelector("#trailer-modal-close");
const trailerModalTitle = document.querySelector("#trailer-modal-title");
const trailerFrameWrap = document.querySelector("#trailer-frame-wrap");
const importModalBackdrop = document.querySelector("#import-modal-backdrop");
const importModalClose = document.querySelector("#import-modal-close");
const importForm = document.querySelector("#import-form");
const importMemberInput = document.querySelector("#import-member-input");
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
const STORAGE_KEY = "recomenda-filmeai:recommendations:v1";

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
  members: [...new Set(initialRecommendations.map((item) => item.indicadoPor))],
  recommendations: [...initialRecommendations],
  selectedGenres: [],
  selectedCover: "assets/images/placeholder.jpg",
  editingId: null
};

let lastFocusedElement = null;
let lastTrailerFocusedElement = null;
let lastImportFocusedElement = null;
let toastTimer = null;
let pendingImportedRecommendations = [];

function loadStoredRecommendations() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [...initialRecommendations];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [...initialRecommendations];
    }

    const normalized = normalizeRecommendations(parsed);
    if (parsed.length === 0) {
      return [];
    }

    return normalized.length ? normalized : [...initialRecommendations];
  } catch {
    return [...initialRecommendations];
  }
}

function saveRecommendations() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.recommendations));
  } catch {
    showToast("Nao foi possivel salvar localmente neste navegador.");
  }
}

function clearStoredRecommendations() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    showToast("Nao foi possivel limpar os dados salvos neste navegador.");
  }
}

function getMembers() {
  return state.members;
}

function syncMembersFromRecommendations() {
  state.members = [...new Set(state.recommendations.map((item) => item.indicadoPor))];
}

function syncStateFromRecommendations() {
  syncMembersFromRecommendations();

  if (
    state.activeMember !== "Todos" &&
    !state.recommendations.some((item) => item.indicadoPor === state.activeMember)
  ) {
    state.activeMember = "Todos";
  }
}

function refreshApp() {
  syncStateFromRecommendations();
  renderChips();
  renderMemberSelect();
  renderHero();
  renderGrid();
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

function getLatestRecommendation(items = state.recommendations) {
  return [...items].sort((first, second) => second.criadoEm - first.criadoEm)[0] ?? null;
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

function renderMemberSelect(selectedValue = "") {
  if (!indicadoSelect) {
    return;
  }

  const nextSelectedValue = selectedValue || indicadoSelect.value || "";
  const options = [
    '<option value="">Selecione</option>',
    ...getMembers().map((member) => `<option value="${member}">${member}</option>`),
    '<option value="__novo__">Adicionar novo</option>'
  ];

  indicadoSelect.innerHTML = options.join("");

  if (
    nextSelectedValue &&
    [...indicadoSelect.options].some((option) => option.value === nextSelectedValue)
  ) {
    indicadoSelect.value = nextSelectedValue;
  }
}

function ensureMemberExists(name) {
  const normalizedName = normalizeName(name);
  if (!normalizedName || state.members.includes(normalizedName)) {
    return normalizedName;
  }

  state.members = [...state.members, normalizedName];
  return normalizedName;
}

function getExportPayload() {
  return {
    exportedAt: new Date().toISOString(),
    version: 1,
    recommendations: state.recommendations
  };
}

function downloadJson(filename, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function normalizeRecommendations(list) {
  if (!Array.isArray(list)) {
    return [];
  }

  return list
    .filter((item) => item && typeof item === "object")
    .map((item) => ({
      id: String(item.id ?? `r${Date.now()}-${Math.random().toString(16).slice(2, 8)}`),
      tipo: item.tipo === "serie" ? "serie" : "filme",
      titulo: String(item.titulo ?? "").trim(),
      indicadoPor: normalizeName(String(item.indicadoPor ?? "")),
      nota: Number.isFinite(Number(item.nota)) ? Number(item.nota) : 0,
      plataforma: String(item.plataforma ?? "").trim(),
      generos: Array.isArray(item.generos) ? item.generos.map((genre) => String(genre)) : [],
      capa: String(item.capa ?? "assets/images/placeholder.jpg"),
      trailer: String(item.trailer ?? "").trim(),
      criadoEm: Number.isFinite(Number(item.criadoEm)) ? Number(item.criadoEm) : Date.now()
    }))
    .filter((item) => item.titulo && item.indicadoPor && item.plataforma);
}

function buildTagMarkup(tags) {
  return tags.map((tag) => `<span class="platform-tag">${tag}</span>`).join("");
}

function buildHeroSummary(item) {
  const tipo = capitalizeType(item.tipo).toLowerCase();
  const generos = item.generos.length ? item.generos.join(", ").toLowerCase() : "novas descobertas";
  return `${item.indicadoPor} colocou este ${tipo} no radar do grupo com clima de ${generos} em ${item.plataforma}.`;
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function getTrailerEmbedUrl(url) {
  if (!url) {
    return "";
  }

  try {
    const parsedUrl = new URL(url);
    const host = parsedUrl.hostname.replace(/^www\./, "");

    if (host === "youtube.com" || host === "m.youtube.com") {
      const videoId = parsedUrl.searchParams.get("v");
      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : "";
    }

    if (host === "youtu.be") {
      const videoId = parsedUrl.pathname.slice(1);
      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : "";
    }

    if (host === "vimeo.com") {
      const videoId = parsedUrl.pathname.split("/").filter(Boolean)[0];
      return videoId ? `https://player.vimeo.com/video/${videoId}?autoplay=1` : "";
    }

    return "";
  } catch {
    return "";
  }
}

function closeTrailerModal() {
  if (!trailerModalBackdrop || !trailerFrameWrap) {
    return;
  }

  trailerModalBackdrop.hidden = true;
  trailerFrameWrap.innerHTML = "";

  if (lastTrailerFocusedElement instanceof HTMLElement) {
    lastTrailerFocusedElement.focus();
  }
}

function setImportMemberError(message) {
  const fieldElement = document.querySelector('[data-field="import-member"]');
  const errorElement = document.querySelector("#error-import-member");

  fieldElement?.classList.toggle("has-error", Boolean(message));
  if (errorElement) {
    errorElement.textContent = message;
  }
}

function openImportModal() {
  if (!importModalBackdrop || !importMemberInput) {
    return;
  }

  lastImportFocusedElement = document.activeElement;
  setImportMemberError("");
  importMemberInput.value = "";
  importModalBackdrop.hidden = false;
  requestAnimationFrame(() => {
    importMemberInput.focus();
  });
}

function closeImportModal() {
  if (!importModalBackdrop) {
    return;
  }

  importModalBackdrop.hidden = true;
  pendingImportedRecommendations = [];
  setImportMemberError("");

  if (importDataInput) {
    importDataInput.value = "";
  }

  if (lastImportFocusedElement instanceof HTMLElement) {
    lastImportFocusedElement.focus();
  }
}

function openTrailerModal({ title, trailer }) {
  if (!trailerModalBackdrop || !trailerFrameWrap) {
    return;
  }

  if (!trailer) {
    showToast("Trailer não informado para esta recomendação.");
    return;
  }

  lastTrailerFocusedElement = document.activeElement;
  const embedUrl = getTrailerEmbedUrl(trailer);

  if (trailerModalTitle) {
    trailerModalTitle.textContent = `Trailer de ${title}`;
  }

  if (embedUrl) {
    trailerFrameWrap.innerHTML = `<iframe class="trailer-embed" src="${embedUrl}" title="Trailer de ${escapeHtml(title)}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
  } else {
    trailerFrameWrap.innerHTML = `
      <div class="trailer-fallback">
        <strong>Este trailer nao pode ser incorporado diretamente.</strong>
        <p>Abra o link original para assistir ao video completo em uma nova aba.</p>
        <a href="${trailer}" target="_blank" rel="noopener noreferrer">Abrir trailer</a>
      </div>
    `;
  }

  trailerModalBackdrop.hidden = false;
  trailerModalClose?.focus();
}

function renderHero() {
  const filtered = getFilteredRecommendations();
  const featured = getLatestRecommendation(filtered) ?? getLatestRecommendation();

  if (!featured) {
    if (heroPoster instanceof HTMLImageElement) {
      heroPoster.src = "assets/images/placeholder.jpg";
      heroPoster.alt = "Nenhuma recomendação";
    }

    if (heroLabel) {
      heroLabel.textContent = "Filme ou série";
    }

    if (heroName) {
      heroName.textContent = "Adicione a primeira recomendação";
    }

    if (heroSummary) {
      heroSummary.textContent = "Publique uma sugestão para abrir a lista de recomendações.";
    }

    if (heroBy) {
      heroBy.innerHTML =
        '<img src="assets/icons/icon-user.svg" alt="" aria-hidden="true" /> Indicado por <strong>ninguém ainda</strong>';
    }

    if (heroTags) {
      heroTags.innerHTML = "";
    }

    if (heroTrailerBtn instanceof HTMLButtonElement) {
      heroTrailerBtn.dataset.trailer = "";
      heroTrailerBtn.disabled = false;
    }
    return;
  }

  if (heroPoster instanceof HTMLImageElement) {
    heroPoster.src = featured.capa || "assets/images/placeholder.jpg";
    heroPoster.alt = featured.titulo;
  }

  if (heroLabel) {
    heroLabel.textContent = capitalizeType(featured.tipo);
  }

  if (heroName) {
    heroName.textContent = featured.titulo;
  }

  if (heroSummary) {
    heroSummary.textContent = buildHeroSummary(featured);
  }

  if (heroBy) {
    heroBy.innerHTML = `<img src="assets/icons/icon-user.svg" alt="" aria-hidden="true" /> Indicado por <strong>${featured.indicadoPor}</strong>`;
  }

  if (heroTags) {
    heroTags.innerHTML = buildTagMarkup([featured.plataforma, ...featured.generos.slice(0, 2)]);
  }

  if (heroTrailerBtn instanceof HTMLButtonElement) {
    heroTrailerBtn.dataset.trailer = featured.trailer;
    heroTrailerBtn.setAttribute("aria-label", `Assistir ao trailer de ${featured.titulo}`);
  }
}

function createMovieCard(item) {
  const ratingColor = item.nota >= 9 ? "purple" : "red";
  const highlightedClass = item.nota >= 9 ? "is-highlighted" : "";
  const generosMarkup = item.generos
    .slice(0, 2)
    .map((genero) => `<span class="card-tag">${genero}</span>`)
    .join("");

  return `
    <article class="movie-card ${highlightedClass}" aria-label="${item.titulo}" data-trailer="${item.trailer}" data-title="${item.titulo}" tabindex="0" role="button">
      <div class="card-image-wrap">
        <img class="movie-image" src="${item.capa || "assets/images/placeholder.jpg"}" alt="${item.titulo}" />
        <button class="edit-card-btn" type="button" data-edit-id="${item.id}" aria-label="Editar recomendação">
          ✎
        </button>
        <span class="movie-rating ${ratingColor}">${item.nota}</span>
      </div>
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
    gridRoot.innerHTML = '<p class="empty-state">Nenhuma indicação para este membro no momento.</p>';
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

function openModal(recommendation = null) {
  if (!modalBackdrop || !addForm) {
    return;
  }

  lastFocusedElement = document.activeElement;
  modalBackdrop.hidden = false;
  requestAnimationFrame(() => {
    modalBackdrop.classList.add("is-open");
  });

  renderMemberSelect(recommendation?.indicadoPor ?? "");
  addForm.reset();
  state.selectedGenres = [];
  state.editingId = recommendation?.id ?? null;
  state.selectedCover = "assets/images/placeholder.jpg";
  if (coverPreview) {
    coverPreview.src = state.selectedCover;
  }
  renderGenreChips();
  clearErrors();
  toggleCustomMemberField();
  syncRatingInputs("5");

  if (publishBtn) {
    publishBtn.textContent = state.editingId ? "Salvar alterações" : "Publicar recomendação";
  }

  if (modalTitle) {
    modalTitle.textContent = state.editingId ? "Editar recomendação" : "Adicionar recomendação";
  }

  if (deleteBtn) {
    deleteBtn.hidden = !state.editingId;
  }

  if (recommendation) {
    const tipoInput = addForm.querySelector(`input[name="tipo"][value="${recommendation.tipo}"]`);
    if (tipoInput instanceof HTMLInputElement) {
      tipoInput.checked = true;
    }

    const tituloInput = addForm.querySelector("#titulo-input");
    if (tituloInput instanceof HTMLInputElement) {
      tituloInput.value = recommendation.titulo;
    }

    if (indicadoSelect) {
      indicadoSelect.value = recommendation.indicadoPor;
      if (!indicadoSelect.value) {
        indicadoSelect.value = "__novo__";
      }
    }

    if (indicadoSelect?.value === "__novo__" && indicadoNovoInput) {
      indicadoNovoInput.value = recommendation.indicadoPor;
    }

    syncRatingInputs(String(recommendation.nota));

    const plataformaInput = addForm.querySelector("#plataforma-select");
    if (plataformaInput instanceof HTMLSelectElement) {
      plataformaInput.value = recommendation.plataforma;
    }

    const trailerInput = addForm.querySelector("#trailer-input");
    if (trailerInput instanceof HTMLInputElement) {
      trailerInput.value = recommendation.trailer || "";
    }

    state.selectedGenres = [...recommendation.generos];
    state.selectedCover = recommendation.capa || "assets/images/placeholder.jpg";
    if (coverPreview) {
      coverPreview.src = state.selectedCover;
    }

    if (coverUrlInput instanceof HTMLInputElement) {
      coverUrlInput.value = recommendation.capa?.startsWith("http") ? recommendation.capa : "";
    }

    renderGenreChips();
    toggleCustomMemberField();
  }

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

  state.editingId = null;
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
  const indicadoPor = ensureMemberExists(getSelectedMember());

  return {
    id: state.editingId ?? `r${Date.now()}`,
    tipo: String(formData.get("tipo") ?? "filme"),
    titulo: String(formData.get("titulo") ?? "").trim(),
    indicadoPor,
    nota: Number(nota.toFixed(1)),
    plataforma: String(formData.get("plataforma") ?? "").trim(),
    generos: [...state.selectedGenres],
    capa: state.selectedCover,
    trailer: String(formData.get("trailer") ?? "").trim(),
    criadoEm:
      state.recommendations.find((item) => item.id === state.editingId)?.criadoEm ?? Date.now()
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
  const idleText = state.editingId ? "Salvar alterações" : "Publicar recomendação";
  publishBtn.textContent = isLoading ? (state.editingId ? "Salvando..." : "Publicando...") : idleText;
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
  const isEditing = Boolean(state.editingId);
  setLoadingState(true);

  setTimeout(() => {
    if (state.editingId) {
      state.recommendations = state.recommendations.map((item) =>
        item.id === state.editingId ? payload : item
      );
    } else {
      state.recommendations = [payload, ...state.recommendations];
    }

    if (state.activeMember !== "Todos" && state.activeMember !== payload.indicadoPor) {
      state.activeMember = "Todos";
    }

    saveRecommendations();
    syncStateFromRecommendations();
    renderChips();
    renderMemberSelect();
    renderHero();
    renderGrid();
    setLoadingState(false);
    closeModal();
    showToast(isEditing ? "Recomendação alterada com sucesso ✨" : "Recomendação adicionada com sucesso 🎬");
  }, 700);
}

function handleDeleteRecommendation() {
  if (!state.editingId) {
    return;
  }

  const deletedId = state.editingId;
  const deletedRecommendation = state.recommendations.find((item) => item.id === deletedId);
  if (!deletedRecommendation) {
    return;
  }

  state.recommendations = state.recommendations.filter((item) => item.id !== deletedId);
  saveRecommendations();
  syncStateFromRecommendations();

  renderChips();
  renderMemberSelect();
  renderHero();
  renderGrid();
  closeModal();
  showToast("Recomendação removida com sucesso.");
}

function handleExportData() {
  const dateSuffix = new Date().toISOString().slice(0, 10);
  downloadJson(`recomenda-filmeai-backup-${dateSuffix}.json`, getExportPayload());
  showToast("Backup exportado com sucesso.");
}

function handleImportedFile(file) {
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const raw = typeof reader.result === "string" ? reader.result : "";
      const parsed = JSON.parse(raw);
      const incoming = Array.isArray(parsed) ? parsed : parsed.recommendations;
      const normalized = normalizeRecommendations(incoming);

      if (!normalized.length) {
        showToast("Arquivo sem recomendacoes validas para importar.");
        return;
      }

      pendingImportedRecommendations = normalized;
      openImportModal();
    } catch {
      showToast("Nao foi possivel importar este arquivo.");
    } finally {
      if (importDataInput && importModalBackdrop?.hidden !== false) {
        importDataInput.value = "";
      }
    }
  };

  reader.readAsText(file);
}

function handleImportSubmit(event) {
  event.preventDefault();

  const memberName = normalizeName(importMemberInput?.value ?? "");
  if (!memberName) {
    setImportMemberError("Informe o nome do membro.");
    return;
  }

  ensureMemberExists(memberName);
  state.recommendations = pendingImportedRecommendations.map((item) => ({
    ...item,
    indicadoPor: memberName
  }));
  saveRecommendations();
  refreshApp();
  closeImportModal();
  showToast("Dados importados com sucesso.");
}

function handleClearData() {
  const shouldClear = window.confirm(
    "Deseja criar uma nova galeria vazia neste navegador? Esta acao nao pode ser desfeita."
  );

  if (!shouldClear) {
    return;
  }

  state.recommendations = [];
  saveRecommendations();
  refreshApp();
  showToast("Nova galeria criada com sucesso.");
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
    renderHero();
    renderGrid();
  });

  gridRoot?.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const editBtn = target.closest(".edit-card-btn");
    if (editBtn instanceof HTMLButtonElement) {
      const editId = editBtn.dataset.editId;
      const recommendation = state.recommendations.find((item) => item.id === editId);
      if (recommendation) {
        openModal(recommendation);
      }
      return;
    }

    const movieCard = target.closest(".movie-card");
    if (!(movieCard instanceof HTMLElement)) {
      return;
    }

    openTrailerModal({
      title: movieCard.dataset.title || "Trailer",
      trailer: movieCard.dataset.trailer || ""
    });
  });

  gridRoot?.addEventListener("keydown", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement) || !target.classList.contains("movie-card")) {
      return;
    }

    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    openTrailerModal({
      title: target.dataset.title || "Trailer",
      trailer: target.dataset.trailer || ""
    });
  });

  heroTrailerBtn?.addEventListener("click", () => {
    openTrailerModal({
      title: heroName?.textContent || "Trailer",
      trailer: heroTrailerBtn.dataset.trailer || ""
    });
  });

  openAddModalBtn?.addEventListener("click", () => openModal());
  exportDataBtn?.addEventListener("click", handleExportData);
  importDataBtn?.addEventListener("click", () => importDataInput?.click());
  clearDataBtn?.addEventListener("click", handleClearData);
  modalClose?.addEventListener("click", closeModal);
  deleteBtn?.addEventListener("click", handleDeleteRecommendation);
  importDataInput?.addEventListener("change", () => {
    handleImportedFile(importDataInput.files?.[0]);
  });

  modalBackdrop?.addEventListener("click", (event) => {
    if (event.target === modalBackdrop) {
      closeModal();
    }
  });

  trailerModalClose?.addEventListener("click", closeTrailerModal);

  trailerModalBackdrop?.addEventListener("click", (event) => {
    if (event.target === trailerModalBackdrop) {
      closeTrailerModal();
    }
  });

  importModalClose?.addEventListener("click", closeImportModal);

  importModalBackdrop?.addEventListener("click", (event) => {
    if (event.target === importModalBackdrop) {
      closeImportModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modalBackdrop && !modalBackdrop.hidden) {
      closeModal();
    }

    if (event.key === "Escape" && trailerModalBackdrop && !trailerModalBackdrop.hidden) {
      closeTrailerModal();
    }

    if (event.key === "Escape" && importModalBackdrop && !importModalBackdrop.hidden) {
      closeImportModal();
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

  importForm?.addEventListener("submit", handleImportSubmit);
  importMemberInput?.addEventListener("input", () => setImportMemberError(""));

  indicadoSelect?.addEventListener("change", () => {
    toggleCustomMemberField();
    updatePublishButtonState();
  });

  indicadoNovoInput?.addEventListener("blur", () => {
    const normalizedName = normalizeName(indicadoNovoInput.value);
    if (!normalizedName) {
      return;
    }

    ensureMemberExists(normalizedName);
    renderMemberSelect("__novo__");
    indicadoNovoInput.value = normalizedName;
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

state.recommendations = loadStoredRecommendations();
syncStateFromRecommendations();
renderChips();
renderMemberSelect();
renderHero();
renderGrid();
renderGenreChips();
syncRatingInputs("5");
updatePublishButtonState();
setupEvents();
