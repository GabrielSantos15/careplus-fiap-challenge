// ─────────────────────────────────────────
// Utilitários
// ─────────────────────────────────────────

/**
 * Busca consultas futuras do localStorage, ordenadas por data
 */
function obterConsultasFuturas() {
  const consultas = JSON.parse(localStorage.getItem("careplus_consultas")) || [];
  return consultas
    .filter((c) => new Date(c.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

/**
 * Formata uma data para pt-BR
 * @param {string|Date} data
 * @param {object} options - { weekday, day, month }
 * @returns {string}
 */
function formatarData(data, options = {}) {
  const padrao = {
    weekday: "long",
    day: "2-digit",
    month: "short",
    ...options,
  };
  return new Date(data)
    .toLocaleDateString("pt-BR", padrao)
    .replace("-feira", "")
    .replace(".", "");
}

/**
 * Atualiza texto de um elemento se existir
 */
function definirTexto(elemento, texto) {
  if (elemento) elemento.textContent = texto;
}

/**
 * Atualiza atributo de um elemento se existir
 */
function definirAtributo(elemento, atributo, valor) {
  if (elemento) elemento.setAttribute(atributo, valor);
}

// ─────────────────────────────────────────
// Inicialização do Card Principal
// ─────────────────────────────────────────

function inicializarCardPrincipal() {
  const consultaCard = document.getElementById("consultaCard");
  const semConsultaCard = document.getElementById("semConsultaCard");
  const proximaConsulta = obterConsultasFuturas()[0];

  if (!proximaConsulta) {
    consultaCard?.classList.add("d-none");
    semConsultaCard?.classList.remove("d-none");
    return;
  }

  consultaCard?.classList.remove("d-none");
  semConsultaCard?.classList.add("d-none");
  definirTexto(document.getElementById("localizationOutput"), proximaConsulta.unidade);
  definirTexto(document.getElementById("especialidadeOutput"), proximaConsulta.especialidade);
  definirTexto(document.getElementById("timeOutput"), proximaConsulta.time);
  definirTexto(document.getElementById("dataOutput"), formatarData(proximaConsulta.date));
  definirAtributo(
    document.getElementById("reagendarLink"),
    "href",
    `pages/reagendar.html?id=${proximaConsulta.id}`
  );
}

// ─────────────────────────────────────────
// Painel de Consultas
// ─────────────────────────────────────────

function renderizarPainelConsultas() {
  const containerLista = document.getElementById("listaConsultasAcordeao");
  const acordeaoPrincipal = document.getElementById("accordionConsultas"); // Pegando a div inteira do acordeão

  if (!containerLista) return;

  const consultas = obterConsultasFuturas();
  const demaisConsultas = consultas.slice(1); // Pega todas MENOS a primeira (que já está no card azul)

  // Se não tem outras consultas além da principal, esconde o acordeão inteiro e para aqui
  if (demaisConsultas.length === 0) {
    if (acordeaoPrincipal) acordeaoPrincipal.classList.add("d-none");
    return;
  }

  // Se tem outras consultas, garante que o acordeão apareça
  if (acordeaoPrincipal) acordeaoPrincipal.classList.remove("d-none");

  const html = demaisConsultas
    .map((consulta) => {
      const dataFormatada = formatarData(consulta.date, {
        weekday: "short",
        day: "2-digit",
        month: "short",
      });

      return `
        <div class="list-group-item d-flex justify-content-between align-items-center p-3 border-bottom">
            <div>
                <h6 class="mb-1 fw-bold text-dark">${consulta.especialidade}</h6>
                <small class="text-muted d-block"><i class="bi bi-geo-alt me-1"></i>${consulta.unidade}</small>
                <span class="badge bg-light text-secondary mt-1 border">${consulta.status}</span>
            </div>
            <div class="text-end text-lg-end mt-2 mt-sm-0">
                <h5 class="mb-0 fw-bold" style="color: #0dcaf0;">${consulta.time}</h5>
                <small class="text-muted d-block mb-2 text-capitalize">${dataFormatada}</small>
                <a href="pages/reagendar.html?id=${consulta.id}" class="btn btn-sm btn-outline-info rounded-pill px-3" style="font-size: 0.75rem;">
                    Reagendar
                </a>
            </div>
        </div>`;
    })
    .join("");

  containerLista.innerHTML = `<div class="list-group list-group-flush">${html}</div>`;
}

// ─────────────────────────────────────────
// Inicialização
// ─────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  inicializarCardPrincipal();
  renderizarPainelConsultas();
});
