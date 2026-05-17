const confirmBtn = document.getElementById("confirmBtn");
const desistirBtn = document.getElementById("desistirBtn");
const displayConsultaAntiga = document.getElementById("displayConsultaAntiga");
const modalSummary = document.getElementById("modalSummary");
const modalAlert = document.getElementById("modalAlert");
const finalizeAppointmentBtn = document.getElementById(
  "finalizeAppointmentBtn",
);
const confirmarRemocaoBtn = document.getElementById("confirmarRemocaoBtn");
const msgReagendamento = document.getElementById("msgReagendamento");

// Flag para prevenir múltiplos cliques
let reagendamentoEmProcesso = false;
let remocaoEmProcesso = false;

const params = new URLSearchParams(window.location.search);
const consultaId = params.get("id");

const consultas = JSON.parse(localStorage.getItem("careplus_consultas")) || [];
const consultaIndex = consultas.findIndex(
  (consulta) => String(consulta.id) === String(consultaId),
);

function calcularHorasRestantes(dateIso, timeLabel) {
  if (!dateIso || !timeLabel) return 0;

  const [hora, minuto] = timeLabel.split(":").map(Number);
  const dataConsulta = new Date(dateIso);
  dataConsulta.setHours(hora, minuto, 0, 0);

  const agora = new Date();
  const diffMs = dataConsulta - agora;
  const diffHoras = diffMs / (1000 * 60 * 60);

  return diffHoras;
}

/**
 * Verifica se a consulta pode ser reagendada sem penalidade
 */
function podeReagendarSemPenalidade(dateIso, timeLabel) {
  const horas = calcularHorasRestantes(dateIso, timeLabel);
  return horas >= 24;
}

function formatarConsulta(dateIso, timeLabel) {
  if (!dateIso) return "Data não disponível";

  let dataFormatada = new Date(dateIso)
    .toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "short",
    })
    .replace("-feira", "")
    .replace(".", "");

  dataFormatada =
    dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1);
  return `${dataFormatada} às ${timeLabel || "--:--"}`;
}

if (consultaIndex === -1) {
  window.alert("Consulta não encontrada para reagendamento.");
  window.location.href = "../index.html";
} else {
  const consultaAtual = consultas[consultaIndex];

  if (consultaAtual.date) {
    updateOriginalConsultaDate(consultaAtual.date);
  }

  if (consultaAtual.time) {
    updateOriginalConsultaTime(consultaAtual.time);
  }

  if (displayConsultaAntiga) {
    displayConsultaAntiga.textContent = formatarConsulta(
      consultaAtual.date,
      consultaAtual.time,
    );
  }

  // Atualiza mensagens baseado no tempo restante
  function atualizarMensagensDeTempos() {
    const temSemPenalidade = podeReagendarSemPenalidade(
      consultaAtual.date,
      consultaAtual.time,
    );

    if (msgReagendamento) {
      msgReagendamento.textContent = temSemPenalidade
        ? "Você pode reagendar sem perder pontos."
        : "Menos de 24h: reagendar/cancelar reduz sua pontuação.";
    }
  }

  // Atualiza mensagem do modal de cancelamento
  function atualizarMensagemModalCancelamento() {
    const temSemPenalidade = podeReagendarSemPenalidade(
      consultaAtual.date,
      consultaAtual.time,
    );
    const containerAlerta = document.getElementById("modalAlertaContainer");

    if (containerAlerta) {
      if (temSemPenalidade) {
        containerAlerta.innerHTML = `
          <div class="alert alert-success mb-4" style="border-radius: 10px; border: none;">
            <small>
              Ainda falta tempo! Você pode reagendar sem impacto na sua pontuação.
            </small>
          </div>
        `;
      } else {
        containerAlerta.innerHTML = `
          <div class="alert alert-danger mb-4" style="border-radius: 10px; border: none;">
            <small>
              Cancelar agora resultará na perda de <strong>-100 pontos</strong>.
            </small>
          </div>
        `;
      }
    }
  }
  atualizarMensagensDeTempos();

  function abrirModalReagendamento() {
    if (!selectedDate || !selectedTimeSlot) {
      alert("Por favor, selecione uma nova data e horário");
      return;
    }

    const dateLabel = selectedDate.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const dataAntiga = formatarConsulta(consultaAtual.date, consultaAtual.time);

    if (modalSummary) {
      modalSummary.innerHTML = `
        <p class="mb-1"><strong>Especialidade:</strong> ${consultaAtual.especialidade || "Não informada"}</p>
        <p class="mb-1"><strong>Unidade:</strong> ${consultaAtual.unidade || "Não informada"}</p>
        <p class="mb-1"><strong>Data Antiga:</strong> ${dataAntiga}</p>
        <hr>
        <p class="mb-1"><strong>Nova Data:</strong> ${dateLabel}</p>
        <p class="mb-0"><strong>Novo Horário:</strong> ${selectedTimeSlot.label.split(" - ")[0]}</p>
      `;
    }

    const modalEl = document.getElementById("confirmModal");
    if (modalEl) {
      const bsModal = new bootstrap.Modal(modalEl);
      if (modalAlert) {
        modalAlert.classList.add("d-none");
      }
      bsModal.show();
    }
  }

  function finalizarReagendamento() {
    // Previne múltiplos cliques
    if (reagendamentoEmProcesso) {
      return;
    }

    reagendamentoEmProcesso = true;

    // Desabilita o botão para feedback visual
    if (finalizeAppointmentBtn) {
      finalizeAppointmentBtn.disabled = true;
      finalizeAppointmentBtn.textContent = "Processando...";
    }

    consultaAtual.date = selectedDate.toISOString();
    consultaAtual.time = selectedTimeSlot.label.split(" - ")[0];
    consultaAtual.status = "Reagendado";

    try {
      consultas[consultaIndex] = consultaAtual;
      localStorage.setItem("careplus_consultas", JSON.stringify(consultas));

      if (modalAlert) {
        modalAlert.classList.remove("d-none");
      }

      setTimeout(() => {
        window.location.href = "../index.html";
      }, 1200);
    } catch (err) {
      console.error("Erro ao salvar reagendamento:", err);
      alert("Não foi possível salvar o reagendamento.");

      // Reabilita o botão em caso de erro
      reagendamentoEmProcesso = false;
      if (finalizeAppointmentBtn) {
        finalizeAppointmentBtn.disabled = false;
        finalizeAppointmentBtn.textContent = "Confirmar reagendamento";
      }
    }
  }

  if (confirmBtn) {
    confirmBtn.onclick = abrirModalReagendamento;
  }

  if (finalizeAppointmentBtn) {
    finalizeAppointmentBtn.addEventListener("click", finalizarReagendamento);
  }

  if (desistirBtn) {
    desistirBtn.addEventListener("click", () => {
      const removeModalEl = document.getElementById("removeModal");
      if (removeModalEl) {
        const bsModal = new bootstrap.Modal(removeModalEl);

        // Preenche os dados da consulta no modal
        const consultaAtual = consultas[consultaIndex];
        if (consultaAtual) {
          const dataConsulta = new Date(consultaAtual.date);
          const dataHoje = new Date();

          // Verifica se é hoje
          const ehHoje =
            dataConsulta.toDateString() === dataHoje.toDateString();

          const dataFormatada = dataConsulta
            .toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "2-digit",
              month: "short",
            })
            .replace("-feira", "")
            .replace(".", "");

          const textoData = ehHoje
            ? "hoje"
            : dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1);

          document.getElementById("modalConsultaData").textContent = textoData;
          document.getElementById("modalConsultaHora").textContent =
            consultaAtual.time || "--:--";

          // Atualiza a mensagem de alerta baseado no tempo
          atualizarMensagemModalCancelamento();
        }

        bsModal.show();
      }
    });
  }

  if (confirmarRemocaoBtn) {
    confirmarRemocaoBtn.addEventListener("click", () => {
      // Previne múltiplos cliques
      if (remocaoEmProcesso) {
        return;
      }

      remocaoEmProcesso = true;

      // Desabilita o botão para feedback visual
      confirmarRemocaoBtn.disabled = true;
      confirmarRemocaoBtn.textContent = "Removendo...";

      try {
        consultas.splice(consultaIndex, 1);
        localStorage.setItem("careplus_consultas", JSON.stringify(consultas));

        const removeModalEl = document.getElementById("removeModal");
        if (removeModalEl) {
          const bsModal = bootstrap.Modal.getInstance(removeModalEl);
          if (bsModal) {
            bsModal.hide();
          }
        }

        window.alert("Consulta removida com sucesso!");
        window.location.href = "../index.html";
      } catch (err) {
        console.error("Erro ao remover consulta:", err);
        alert("Não foi possível remover a consulta.");

        // Reabilita o botão em caso de erro
        remocaoEmProcesso = false;
        confirmarRemocaoBtn.disabled = false;
        confirmarRemocaoBtn.textContent = "Remover";
      }
    });
  }
}
