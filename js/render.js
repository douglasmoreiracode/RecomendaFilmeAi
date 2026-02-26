import { heroMovie, members, movies } from "./data.js";

const heroCard = document.querySelector("#hero-card");
const memberChips = document.querySelector("#member-chips");
const movieGrid = document.querySelector("#movie-grid");

let selectedMember = "Lucas";

function renderHero() {
  if (!heroCard) {
    return;
  }

  heroCard.innerHTML = `
    <div class="hero-poster" aria-hidden="true"></div>
    <div class="hero-content">
      <p class="hero-kicker">🔥 ${heroMovie.label}</p>
      <p class="hero-label">${heroMovie.type}</p>
      <h3 class="hero-title">${heroMovie.title}</h3>
      <p class="hero-meta">Indicado por: <strong>${heroMovie.suggestedBy}</strong></p>
      <div class="tag-list">${heroMovie.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
      <button class="trailer-btn" type="button">▶ Assistir ao trailer</button>
    </div>
  `;
}

function renderChips() {
  if (!memberChips) {
    return;
  }

  memberChips.innerHTML = members
    .map((member) => {
      const isActive = member === selectedMember ? "is-active" : "";
      return `<button type="button" class="chip ${isActive}" data-member="${member}">${member}</button>`;
    })
    .join("");
}

function getFilteredMovies() {
  if (selectedMember === "Todos") {
    return movies;
  }

  return movies.filter((movie) => movie.suggestedBy === selectedMember);
}

function renderGrid() {
  if (!movieGrid) {
    return;
  }

  const filtered = getFilteredMovies();

  if (!filtered.length) {
    movieGrid.innerHTML = '<p class="empty-state">Nenhum filme para este membro.</p>';
    return;
  }

  movieGrid.innerHTML = filtered
    .map((movie) => {
      const scoreClass = movie.scoreTone === "purple" ? "is-purple" : "";

      return `
        <article class="movie-card" role="listitem" aria-label="Filme ${movie.title}">
          <div class="movie-cover" style="--tone-a:${movie.toneA}; --tone-b:${movie.toneB};"></div>
          <span class="movie-score ${scoreClass}">${movie.score}</span>
          <div class="movie-overlay">
            <p class="movie-type">${movie.type}</p>
            <h3 class="movie-title">${movie.title}</h3>
            <p class="movie-by">Indicado por: <strong>${movie.suggestedBy}</strong></p>
            <div class="tag-list">${movie.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
            <button class="trailer-btn" type="button">▶ Assistir ao trailer</button>
          </div>
        </article>
      `;
    })
    .join("");
}

if (memberChips) {
  memberChips.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) {
      return;
    }

    const nextMember = target.dataset.member;
    if (!nextMember) {
      return;
    }

    selectedMember = nextMember;
    renderChips();
    renderGrid();
  });
}

renderHero();
renderChips();
renderGrid();
