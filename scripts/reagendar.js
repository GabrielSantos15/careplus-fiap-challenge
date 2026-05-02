const calendarBody = document.getElementById("calendarBody");
const monthDisplay = document.getElementById("monthDisplay");
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");
const confirmBtn = document.getElementById("confirmBtn");
const listaHorarios = document.getElementById("listaHorarios");
const periodoDia = document.getElementById("periodoDia");
const prevPeriodBtn = document.getElementById("prevPeriod");
const nextPeriodBtn = document.getElementById("nextPeriod");
const displayNovaData = document.getElementById("displayNovaData");

const periodos = [
  {
    key: "manha",
    label: "Manhã",
    slots: [
      { label: "08:00 - 08:30", available: true },
      { label: "08:30 - 09:00", available: false },
      { label: "09:00 - 09:30", available: true },
      { label: "09:30 - 10:00", available: true },
      { label: "10:00 - 10:30", available: false },
      { label: "10:30 - 11:00", available: true },
      { label: "11:00 - 11:30", available: true },
      { label: "11:30 - 12:00", available: true },
    ],
  },
  {
    key: "tarde",
    label: "Tarde",
    slots: [
      { label: "13:00 - 13:30", available: true },
      { label: "13:30 - 14:00", available: true },
      { label: "14:00 - 14:30", available: false },
      { label: "14:30 - 15:00", available: true },
      { label: "15:00 - 15:30", available: true },
      { label: "15:30 - 16:00", available: false },
      { label: "16:00 - 16:30", available: true },
      { label: "16:30 - 17:00", available: true },
    ],
  },
];

let date = new Date();
let selectedDate = null;
let selectedTimeSlot = null;
let currentPeriodIndex = 0;

function formatSelectedDate() {
  if (!selectedDate) {
    return "Selecione no calendário...";
  }

  const dateLabel = selectedDate.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  if (selectedTimeSlot) {
    return `${dateLabel} às ${selectedTimeSlot.label.split(" - ")[0]}`;
  }

  return dateLabel;
}

function updateSummary() {
  displayNovaData.textContent = formatSelectedDate();
}

function updateConfirmState() {
  const isReady = Boolean(selectedDate && selectedTimeSlot);
  confirmBtn.disabled = !isReady;
  confirmBtn.classList.toggle("disabled", !isReady);
}

function renderCalendar() {
  calendarBody.innerHTML = "";

  const month = date.getMonth();
  const year = date.getFullYear();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  monthDisplay.innerText = `${monthNames[month]} ${year}`;

  const firstDayIndex = new Date(year, month, 1).getDay();
  const lastDayPrevMonth = new Date(year, month, 0).getDate();
  const lastDay = new Date(year, month + 1, 0).getDate();

  let dayCounter = 1;
  let prevMonthDayCounter = lastDayPrevMonth - firstDayIndex + 1;
  let nextMonthCounter = 1;

  for (let week = 0; week < 6; week++) {
    const row = document.createElement("tr");

    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      const cell = document.createElement("td");
      const dayDiv = document.createElement("div");
      dayDiv.classList.add("calendar-day");

      if (week === 0 && dayOfWeek < firstDayIndex) {
        dayDiv.classList.add("disabled", "empty");
        dayDiv.innerText = prevMonthDayCounter;
        prevMonthDayCounter++;
      } else if (dayCounter <= lastDay) {
        dayDiv.innerText = dayCounter;
        const dateObj = new Date(year, month, dayCounter);

        if (dateObj.getTime() === today.getTime()) {
          dayDiv.classList.add("today");
        }

        if (dateObj.getDay() === 0 || dateObj.getDay() === 6) {
          dayDiv.classList.add("disabled");
        }

        if (dateObj < today) {
          dayDiv.classList.add("disabled");
        }

        if (selectedDate && dateObj.getTime() === selectedDate.getTime()) {
          dayDiv.classList.add("selected");
        }

        const currentDay = dayCounter;
        dayDiv.addEventListener("click", () => {
          if (!dayDiv.classList.contains("disabled")) {
            selectDate(dayDiv, currentDay, month, year);
          }
        });

        dayCounter++;
      } else {
        dayDiv.classList.add("disabled", "empty");
        dayDiv.innerText = nextMonthCounter;
        nextMonthCounter++;
      }

      cell.appendChild(dayDiv);
      row.appendChild(cell);
    }

    calendarBody.appendChild(row);

    if (dayCounter > lastDay) break;
  }

  updateConfirmState();
}

function selectDate(element, day, month, year) {
  selectedDate = new Date(year, month, day);

  document.querySelectorAll(".calendar-day.selected").forEach((el) => el.classList.remove("selected"));
  element.classList.add("selected");

  updateSummary();
  updateConfirmState();
  console.log("Data selecionada:", selectedDate.toLocaleDateString("pt-BR"));
}

function renderTimeSlots() {
  const periodo = periodos[currentPeriodIndex];
  periodoDia.innerText = periodo.label;
  listaHorarios.innerHTML = "";

  periodo.slots.forEach((slot) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "list-group-item list-group-item-action time-slot";
    button.innerText = slot.label;

    if (!slot.available) {
      button.classList.add("disabled", "text-muted");
      button.disabled = true;
    }

    if (selectedTimeSlot && selectedTimeSlot.periodKey === periodo.key && selectedTimeSlot.label === slot.label) {
      button.classList.add("selected");
    }

    button.addEventListener("click", () => {
      if (!slot.available) {
        return;
      }

      selectedTimeSlot = {
        periodKey: periodo.key,
        label: slot.label,
      };

      document.querySelectorAll(".time-slot.selected").forEach((el) => el.classList.remove("selected"));
      button.classList.add("selected");

      updateSummary();
      updateConfirmState();
      console.log("Horário selecionado:", selectedTimeSlot.label);
    });

    listaHorarios.appendChild(button);
  });
}

function changePeriod(direction) {
  currentPeriodIndex = (currentPeriodIndex + direction + periodos.length) % periodos.length;
  selectedTimeSlot = null;
  renderTimeSlots();
  updateConfirmState();
}

prevMonthBtn.onclick = () => {
  date.setMonth(date.getMonth() - 1);
  renderCalendar();
};

nextMonthBtn.onclick = () => {
  date.setMonth(date.getMonth() + 1);
  renderCalendar();
};

prevPeriodBtn.onclick = () => changePeriod(-1);
nextPeriodBtn.onclick = () => changePeriod(1);

renderCalendar();
renderTimeSlots();
updateSummary();
