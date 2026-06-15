import { statuses } from "../../data/sampleData.js";
import TaskCard from "./TaskCard.jsx";

export default function BoardColumn({ status, tasks, onOpenTask, onUpdateTask }) {
  const nextStatus = statuses[(statuses.indexOf(status) + 1) % statuses.length];

  return (
    <section className="board-column">
      <div className="column-header">
        <span className={`status-dot ${status.toLowerCase().replaceAll(" ", "-")}`} />
        <h3>{status}</h3>
        <b>{tasks.length}</b>
      </div>
      <div className="column-stack">
        {tasks.map((task) => (
          <div key={task.id} className="board-card-wrap">
            <TaskCard task={task} onOpenTask={onOpenTask} />
            {status !== "Completed" && (
              <button className="move-button" onClick={() => onUpdateTask(task.id, { status: nextStatus })}>
                Move to {nextStatus}
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
