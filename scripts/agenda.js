// Pegando os elementos do HTML
const especialidadeSelect = document.getElementById("especialidadeSelect");
const unidadeSelect = document.getElementById("unidadeSelect");
const patientDescription = document.getElementById("patientDescription");
const finalizeAppointmentBtn = document.getElementById("finalizeAppointmentBtn");
const modalSummary = document.getElementById("modalSummary");
const modalAlert = document.getElementById("modalAlert");

// Abre o Modal e monta o resumo
function abrirModal() {
  if (!selectedDate || !selectedTimeSlot) {
    alert("Por favor, selecione uma data e horário");
    return;
  }

  const especialidade = especialidadeSelect ? especialidadeSelect.value : "Não informada";
  const unidade = unidadeSelect ? unidadeSelect.value : "Não informada";
  const description = patientDescription ? patientDescription.value.trim() : "";

  if (!description) {
    if (patientDescription) {
      patientDescription.reportValidity();
      patientDescription.focus();
    }
    return;
  }

  const dateLabel = selectedDate.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  if (modalSummary) {
    modalSummary.innerHTML = `
      <p class="mb-1"><strong>Especialidade:</strong> ${especialidade}</p>
      <p class="mb-1"><strong>Unidade:</strong> ${unidade}</p>
      <p class="mb-1"><strong>Descrição:</strong> ${description}</p>
      <p class="mb-1"><strong>Data:</strong> ${dateLabel}</p>
      <p class="mb-0"><strong>Horário:</strong> ${selectedTimeSlot.label.split(" - ")[0]}</p>
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

// Confirmação Final e salvamento no LocalStorage 
function finalizarAgendamento() {
  const especialidade = especialidadeSelect ? especialidadeSelect.value : "Não informada";
  const unidade = unidadeSelect ? unidadeSelect.value : "Não informada";
  const description = patientDescription ? patientDescription.value.trim() : "";

  // consulta com ID
  const appointment = {
    id: Date.now(),
    especialidade,
    unidade,
    description,
    date: selectedDate ? selectedDate.toISOString() : null,
    time: selectedTimeSlot ? selectedTimeSlot.label.split(" - ")[0] : null,
    status: "Agendado"
  };

  try {
    // Busca o LocalStorage
    const existing = JSON.parse(localStorage.getItem("careplus_consultas")) || [];

    // Adiciona
    existing.push(appointment);

    // Salva 
    localStorage.setItem("careplus_consultas", JSON.stringify(existing));

    console.log("Agendamento salvo:", appointment);

    if (modalAlert) {
      modalAlert.classList.remove("d-none");
    }

    // Volta para a Home 
    setTimeout(() => {
      console.log("Redirecionando para home...");
      window.location.href = "../index.html";
    }, 2400);

  } catch (err) {
    console.error(err);
    alert("Erro ao salvar agendamento: " + err.message);
  }
}