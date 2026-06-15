import { ChevronRight, CircleDashed, Eye, Flag, Grip, Link2, ListFilter, Paperclip, Plus, Tag, Trash2 } from "lucide-react";
import { priorities, statuses } from "../../data/sampleData.js";

function initials(name) {
  return name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function TaskRow({ task, users, onOpenTask, onUpdateTask, onDeleteTask }) {
  const assigneeInitials = task.assignee?.initials || initials(task.assignee?.name) || "TM";
  const createdBy = users[1] || users[0];

  return (
    <div className="workspace-task-row">
      <div className="task-main-cell">
        <button className="row-check" onClick={() => onUpdateTask(task.id, { status: task.status === "Completed" ? "To Do" : "Completed" })} aria-label="Toggle completed">
          {task.status === "Completed" ? <span className="done-dot" /> : <CircleDashed size={17} />}
        </button>
        <ChevronRight size={15} className="row-chevron" />
        <button className="task-title-line" onClick={() => onOpenTask(task.id)}>
          <strong>{task.title}</strong>
          <span>
            <Link2 size={13} />
            1
            <Grip size={13} />
            <Paperclip size={13} />
            <ListFilter size={13} />
            0/2
          </span>
        </button>
        <div className="quick-row-actions">
          <button className="mini-square" onClick={() => onOpenTask(task.id)} aria-label="Open task">
            <Eye size={15} />
          </button>
          <button className="mini-square" aria-label="Add subtask">
            <Plus size={15} />
          </button>
          <button className="mini-square" aria-label="Tag task">
            <Tag size={15} />
          </button>
          <button className="mini-square danger" onClick={() => onDeleteTask(task.id)} aria-label="Delete task">
            <Trash2 size={15} />
          </button>
        </div>
      </div>
      <div className="task-priority-cell">
        <Flag size={18} />
        <select value={task.priority} onChange={(event) => onUpdateTask(task.id, { priority: event.target.value })} aria-label="Priority">
          {priorities.map((priority) => (
            <option key={priority}>{priority}</option>
          ))}
        </select>
      </div>
      <div className="task-date-cell">
        <input type="date" value={task.dueDate || ""} onChange={(event) => onUpdateTask(task.id, { dueDate: event.target.value })} aria-label="Due date" />
      </div>
      <div className="task-assignee-cell">
        <span className="avatar stack-avatar">{assigneeInitials}</span>
        <select value={task.assigneeId} onChange={(event) => onUpdateTask(task.id, { assigneeId: event.target.value })} aria-label="Assignee">
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>
      <div className="task-created-cell">
        <span className="avatar stack-avatar dark">{createdBy?.initials || "FA"}</span>
      </div>
      <select className="row-status-select" value={task.status} onChange={(event) => onUpdateTask(task.id, { status: event.target.value })} aria-label="Status">
        {statuses.map((status) => (
          <option key={status}>{status}</option>
        ))}
      </select>
    </div>
  );
}
