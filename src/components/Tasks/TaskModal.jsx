import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { priorities, statuses } from "../../data/sampleData.js";

const initialForm = {
  title: "",
  description: "",
  assigneeId: "",
  projectId: "",
  status: "To Do",
  priority: "Normal",
  dueDate: ""
};

export default function TaskModal({ isOpen, users, projects, onClose, onCreate }) {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (isOpen) {
      setForm({
        ...initialForm,
        assigneeId: users[0]?.id || "",
        projectId: projects[0]?.id || "",
        dueDate: new Date().toISOString().slice(0, 10)
      });
    }
  }, [isOpen, users, projects]);

  if (!isOpen) return null;

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const submit = (event) => {
    event.preventDefault();
    if (!form.title.trim()) return;
    onCreate({ ...form, title: form.title.trim(), description: form.description.trim() || "No description added yet." });
  };

  return (
    <div className="modal-backdrop">
      <form className="task-modal" onSubmit={submit}>
        <div className="modal-header">
          <div>
            <span className="eyebrow">New task</span>
            <h2>Create Task</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>
        <label>
          Task title
          <input value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="Write a clear task name" autoFocus />
        </label>
        <label>
          Description
          <textarea value={form.description} onChange={(event) => update("description", event.target.value)} placeholder="Add context, scope, or acceptance notes" />
        </label>
        <div className="form-grid">
          <label>
            Assignee
            <select value={form.assigneeId} onChange={(event) => update("assigneeId", event.target.value)}>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Project
            <select value={form.projectId} onChange={(event) => update("projectId", event.target.value)}>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select value={form.status} onChange={(event) => update("status", event.target.value)}>
              {statuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>
          <label>
            Priority
            <select value={form.priority} onChange={(event) => update("priority", event.target.value)}>
              {priorities.map((priority) => (
                <option key={priority}>{priority}</option>
              ))}
            </select>
          </label>
          <label>
            Due date
            <input type="date" value={form.dueDate} onChange={(event) => update("dueDate", event.target.value)} />
          </label>
        </div>
        <div className="modal-actions">
          <button type="button" className="button secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="button primary" type="submit">
            Create Task
          </button>
        </div>
      </form>
    </div>
  );
}
