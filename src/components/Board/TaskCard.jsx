export default function TaskCard({ task, onOpenTask }) {
  return (
    <button className="board-card" onClick={() => onOpenTask(task.id)}>
      <div className="card-topline">
        <span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span>
        <span>{task.dueDate}</span>
      </div>
      <strong>{task.title}</strong>
      <p>{task.description}</p>
      <div className="card-footer">
        <span className="project-chip" style={{ "--chip": task.project?.color }}>
          {task.project?.name}
        </span>
        <span className="avatar small">{task.assignee?.initials}</span>
      </div>
    </button>
  );
}
