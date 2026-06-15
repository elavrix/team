import { MessageSquare, X } from "lucide-react";
import { useEffect, useState } from "react";
import { priorities, statuses } from "../../data/sampleData.js";

export default function TaskDrawer({ task, users, projects, onClose, onUpdateTask, onAddComment }) {
  const [comment, setComment] = useState("");

  useEffect(() => setComment(""), [task?.id]);

  if (!task) return null;

  const update = (field, value) => onUpdateTask(task.id, { [field]: value });
  const submitComment = (event) => {
    event.preventDefault();
    if (!comment.trim()) return;
    onAddComment(task.id, comment.trim());
    setComment("");
  };

  return (
    <aside className="task-drawer">
      <div className="drawer-header">
        <div>
          <span className="eyebrow">Task detail</span>
          <input className="drawer-title" value={task.title} onChange={(event) => update("title", event.target.value)} />
        </div>
        <button className="icon-button" onClick={onClose} aria-label="Close task details">
          <X size={18} />
        </button>
      </div>
      <label>
        Description
        <textarea value={task.description} onChange={(event) => update("description", event.target.value)} />
      </label>
      <div className="drawer-grid">
        <label>
          Assignee
          <select value={task.assigneeId} onChange={(event) => update("assigneeId", event.target.value)}>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select value={task.status} onChange={(event) => update("status", event.target.value)}>
            {statuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </label>
        <label>
          Priority
          <select value={task.priority} onChange={(event) => update("priority", event.target.value)}>
            {priorities.map((priority) => (
              <option key={priority}>{priority}</option>
            ))}
          </select>
        </label>
        <label>
          Due date
          <input type="date" value={task.dueDate} onChange={(event) => update("dueDate", event.target.value)} />
        </label>
        <label className="span-2">
          Project
          <select value={task.projectId} onChange={(event) => update("projectId", event.target.value)}>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <section className="drawer-section">
        <h3>
          <MessageSquare size={17} />
          Task Chat
        </h3>
        <div className="comments-list">
          {(task.comments || []).map((item) => {
            const author = users.find((user) => user.id === item.authorId);
            return (
              <div className="comment" key={item.id}>
                <span className="avatar small">{author?.initials || "TM"}</span>
                <div>
                  <strong>{author?.name || "Team member"}</strong>
                  <p>{item.text}</p>
                </div>
              </div>
            );
          })}
        </div>
        <form className="comment-form" onSubmit={submitComment}>
          <input value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Message this task thread" />
          <button className="button primary" type="submit">
            Post
          </button>
        </form>
      </section>
      <section className="drawer-section">
        <h3>Activity log</h3>
        <div className="activity-list compact">
          {(task.activity || []).map((item, index) => (
            <div className="activity-item" key={`${item}-${index}`}>
              <span />
              <p>{item}</p>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}
