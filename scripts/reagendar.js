const calendarBody = document.getElementById("calendarBody");
const monthDisplay = document.getElementById("monthDisplay");
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");
const confirmBtn = document.getElementById("confirmBtn");

let date = new Date();
let selectedDate = null;

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

  // 6 semanas x 7 dias
  for (let week = 0; week < 6; week++) {
    const row = document.createElement("tr");

    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      const cell = document.createElement("td");
      const dayDiv = document.createElement("div");
      dayDiv.classList.add("calendar-day");

      if (week === 0 && dayOfWeek < firstDayIndex) {
        // Dias do mês anterior
        dayDiv.classList.add("disabled", "empty");
        dayDiv.innerText = prevMonthDayCounter;
        prevMonthDayCounter++;
      } else if (dayCounter <= lastDay) {
        // Dias do mês atual
        dayDiv.innerText = dayCounter;
        const dateObj = new Date(year, month, dayCounter);

        // Marcar hoje
        if (dateObj.getTime() === today.getTime()) {
          dayDiv.classList.add("today");
        }

        if (dateObj.getDay() == 0 || dateObj.getDay() == 6) {
          dayDiv.classList.add("disabled");
        }

        // Desabilitar passados
        if (dateObj < today) {
          dayDiv.classList.add("disabled");
        }

        // Manter seleção ao navegar entre meses
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
        // Dias do próximo mês
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
}

function selectDate(element, day, month, year) {
  selectedDate = new Date(year, month, day);

  // UI Update
  document
    .querySelectorAll(".calendar-day.selected")
    .forEach((el) => el.classList.remove("selected"));
  element.classList.add("selected");

  // Ativar botão de confirmação
  confirmBtn.classList.remove("disabled");

  console.log("Data selecionada:", selectedDate.toLocaleDateString("pt-BR"));
}

prevMonthBtn.onclick = () => {
  date.setMonth(date.getMonth() - 1);
  renderCalendar();
};

nextMonthBtn.onclick = () => {
  date.setMonth(date.getMonth() + 1);
  renderCalendar();
};

renderCalendar();
