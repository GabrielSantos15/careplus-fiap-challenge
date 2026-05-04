const consultaCard = document.getElementById("consultaCard");
const localizationOutput = document.getElementById("localizationOutput");
const especialidadeOutput = document.getElementById("especialidadeOutput");
const timeOutput = document.getElementById("timeOutput");
const dataOutput = document.getElementById("dataOutput");
const reagendarLink = document.getElementById("reagendarLink");

const proximaConsulta = (JSON.parse(localStorage.getItem("careplus_consultas")) || [])
  .filter((consulta) => new Date(consulta.date) > new Date())
  .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

consultaCard?.classList.toggle("d-none", !proximaConsulta);

if (proximaConsulta) {
  localizationOutput && (localizationOutput.textContent = proximaConsulta.unidade);
  especialidadeOutput && (especialidadeOutput.textContent = proximaConsulta.especialidade);
  timeOutput && (timeOutput.textContent = proximaConsulta.time);
  dataOutput &&
    (dataOutput.textContent = new Date(proximaConsulta.date)
      .toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "short" })
      .replace("-feira", "")
      .replace(".", ""));
  reagendarLink && (reagendarLink.href = `pages/reagendar.html?id=${proximaConsulta.id}`);
}
