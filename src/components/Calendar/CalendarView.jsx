const monthDate = new Date(2026, 4, 1);
const daysInMonth = new Date(2026, 5, 0).getDate();
const leadingBlanks = monthDate.getDay();
const cells = [
  ...Array.from({ length: leadingBlanks }, (_, index) => ({ type: "blank", id: `blank-${index}` })),
  ...Array.from({ length: daysInMonth }, (_, index) => ({ type: "day", day: index + 1 }))
];

export default function CalendarView({ tasks, onOpenTask }) {
  return (
    <section className="calendar-panel panel full">
      <div className="panel-header">
        <div>
          <span className="eyebrow">Schedule</span>
          <h2>May 2026</h2>
        </div>
      </div>
      <div className="calendar-grid weekdays">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <b key={day}>{day}</b>
        ))}
      </div>
      <div className="calendar-grid">
        {cells.map((cell) =>
          cell.type === "blank" ? (
            <div className="calendar-cell muted-cell" key={cell.id} />
          ) : (
            <div className="calendar-cell" key={cell.day}>
              <span className="day-number">{cell.day}</span>
              <div className="calendar-tasks">
                {tasks
                  .filter((task) => {
                    const date = new Date(`${task.dueDate}T00:00:00`);
                    return date.getFullYear() === 2026 && date.getMonth() === 4 && date.getDate() === cell.day;
                  })
                  .map((task) => (
                    <button key={task.id} onClick={() => onOpenTask(task.id)}>
                      {task.title}
                    </button>
                  ))}
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
}
