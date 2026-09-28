/**
 * Horário com fuso Europe/Lisbon e suporte a encerramento após meia-noite.
 */
(function () {
  const TZ = "Europe/Lisbon";

  function parseTime(hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  }

  /** Partes da data/hora em Lisboa */
  function lisbonParts(date) {
    const d = date || new Date();
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: TZ,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const parts = fmt.formatToParts(d);
    const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
    const weekdayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return {
      day: weekdayMap[map.weekday] ?? 0,
      minutes: parseTime(`${map.hour}:${map.minute}`),
    };
  }

  function slotForDay(schedule, dayIndex) {
    return schedule?.[dayIndex] ?? schedule?.[String(dayIndex)] ?? null;
  }

  /**
   * Verifica se o café está aberto no instante `date` (default: agora).
   */
  function isOpenNow(schedule, date) {
    const { day, minutes } = lisbonParts(date);
    const today = slotForDay(schedule, day);
    const yesterday = slotForDay(schedule, (day + 6) % 7);

    if (yesterday?.closeNextDay) {
      const closeMin = parseTime(yesterday.close);
      if (minutes < closeMin) return true;
    }

    if (!today) return false;

    const openMin = parseTime(today.open);
    const closeMin = parseTime(today.close);

    if (today.closeNextDay) {
      return minutes >= openMin;
    }

    return minutes >= openMin && minutes < closeMin;
  }

  function formatSlot(slot, closedLabel) {
    if (!slot) return closedLabel;
    return `${slot.open} – ${slot.close}${slot.closeNextDay ? "*" : ""}`;
  }

  function renderHoursTable(container, schedule, i18n) {
    if (!container) return;
    const { day: todayIndex } = lisbonParts();
    const open = isOpenNow(schedule);
    const statusEl = container.querySelector("[data-hours-status]");
    const tbody = container.querySelector("[data-hours-body]");

    if (statusEl) {
      statusEl.textContent = open ? i18n.t("hours.openNow") : i18n.t("hours.closedNow");
      statusEl.classList.toggle("is-open", open);
      statusEl.classList.toggle("is-closed", !open);
    }

    if (!tbody) return;
    tbody.innerHTML = "";
    for (let d = 0; d < 7; d++) {
      const tr = document.createElement("tr");
      if (d === todayIndex) tr.classList.add("is-today");
      const dayName = i18n.t("hours.dayNames")[d] ?? String(d);
      const slot = slotForDay(schedule, d);
      tr.innerHTML = `<th scope="row">${dayName}</th><td>${formatSlot(slot, i18n.t("hours.closed"))}</td>`;
      tbody.appendChild(tr);
    }

    const note = container.querySelector("[data-hours-note]");
    if (note) {
      note.hidden = false;
      note.textContent =
        i18n.getLang() === "pt"
          ? "* Encerramento na madrugada do dia seguinte."
          : "* Closes in the early hours of the next day.";
    }
  }

  window.CafeHours = { isOpenNow, renderHoursTable, lisbonParts };
})();
