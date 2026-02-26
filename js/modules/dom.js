export function renderFeatured(container, movie) {
  if (!movie) {
    container.innerHTML = "<p class=\"grid-empty\">Sem destaque disponivel.</p>";
    return;
  }

  container.innerHTML = `
    <div class="featured-poster" style="--tone-a:${movie.toneA};--tone-b:${movie.toneB};background:linear-gradient(160deg,var(--tone-a),var(--tone-b));"></div>
    <div class="featured-info">
      <p class="eyebrow">Novo</p>
      <p class="movie-type">${movie.type}</p>
      <h3 class="featured-title">${movie.title}</h3>
      <p class="featured-meta">Indicado por <strong>${movie.suggestedBy}</strong></p>
      <div class="tag-list">${movie.tags.map((tag) => `<span>${tag}</span>`).join("")}</div>
      <button class="trailer-button" type="button">Assistir ao trailer</button>
    </div>
  `;
}

export function renderMemberFilters(container, members, activeMember) {
  const options = ["Todos", ...members];
  container.innerHTML = options
    .map((member) => {
      const activeClass = member === activeMember ? "is-active" : "";
      return `<button class="filter-chip ${activeClass}" type="button" data-member="${member}">${member}</button>`;
    })
    .join("");
}

export function renderMovieGrid(container, movies) {
  if (!movies.length) {
    container.innerHTML = `<p class="grid-empty">Nenhuma indicacao para este membro.</p>`;
    return;
  }

  container.innerHTML = movies
    .map(
      (movie) => `
        <article class="movie-card" role="listitem" aria-label="Indicacao: ${movie.title}">
          <div class="movie-poster" style="--tone-a:${movie.toneA};--tone-b:${movie.toneB};"></div>
          <span class="movie-score">${movie.score}</span>
          <div class="movie-body">
            <p class="movie-type">${movie.type}</p>
            <h3 class="movie-title">${movie.title}</h3>
            <p class="movie-by">Indicado por <strong>${movie.suggestedBy}</strong></p>
            <div class="tag-list">${movie.tags.map((tag) => `<span>${tag}</span>`).join("")}</div>
            <button class="trailer-button" type="button">Assistir ao trailer</button>
          </div>
        </article>
      `
    )
    .join("");
}
