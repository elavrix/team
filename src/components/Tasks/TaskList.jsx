import { CheckCircle2, ChevronDown, Filter, Layers3, Link2, Plus, Search, Star } from "lucide-react";
import { statuses } from "../../data/sampleData.js";
import TaskRow from "./TaskRow.jsx";

const today = new Date("2026-05-30T00:00:00");

function createGroups(tasks) {
  const groups = [
    {
      id: "overdue",
      title: "Overdue",
      tone: "danger",
      tasks: tasks.filter((task) => task.status !== "Completed" && task.dueDate && new Date(`${task.dueDate}T00:00:00`) < today)
    },
    {
      id: "no-date",
      title: "No due date",
      tasks: tasks.filter((task) => task.status !== "Completed" && !task.dueDate)
    },
    {
      id: "active",
      title: "Upcoming",
      tasks: tasks.filter((task) => task.status !== "Completed" && task.dueDate && new Date(`${task.dueDate}T00:00:00`) >= today)
    },
    {
      id: "done",
      title: "Done",
      tasks: tasks.filter((task) => task.status === "Completed")
    }
  ];

  return groups.filter((group) => group.tasks.length || group.id === "no-date");
}

export default function TaskList({ tasks, users, filters, onFilterChange, onCreateTask, onOpenTask, onUpdateTask, onDeleteTask }) {
  const groups = createGroups(tasks);

  return (
    <section className="task-list panel full">
      <div className="member-task-header">
        <div className="member-title">
          <span className="avatar profile-avatar online">AS</span>
          <h2>Amir Sharif</h2>
          <button aria-label="More options">...</button>
          <Star size={20} />
        </div>
        <nav className="member-tabs" aria-label="Member workspace tabs">
          <button>Chat</button>
          <button>Calendar</button>
          <button className="active">Tasks</button>
        </nav>
      </div>

      <div className="task-view-toolbar">
        <div className="task-view-left">
          <button className="view-chip active">
            <Layers3 size={17} />
            Group: Due date
          </button>
          <button className="view-chip">
            <Link2 size={16} />
            Subtasks
          </button>
        </div>
        <div className="task-view-right">
          <select value={filters.status} onChange={(event) => onFilterChange({ ...filters, status: event.target.value })} aria-label="Filter by status">
            <option>All</option>
            {statuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
          <select value={filters.assignee} onChange={(event) => onFilterChange({ ...filters, assignee: event.target.value })} aria-label="Filter by assignee">
            <option value="All">All assignees</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
          <button className="save-view-button">Save view</button>
          <button className="view-chip">
            <Filter size={16} />
            Filter
          </button>
          <button className="view-chip active">
            <CheckCircle2 size={16} />
            Closed
          </button>
          <button className="search-square" aria-label="Search">
            <Search size={20} />
          </button>
          <button className="button primary" onClick={onCreateTask}>
            <Plus size={16} />
            Add task
          </button>
        </div>
      </div>

      {tasks.length ? (
        <div className="grouped-task-table">
          {groups.map((group) => (
            <section className="task-group" key={group.id}>
              <div className="task-group-heading">
                <ChevronDown size={17} />
                <h3 className={group.tone === "danger" ? "danger-title" : ""}>{group.title}</h3>
                <span>{group.tasks.length}</span>
                <button aria-label={`More actions for ${group.title}`}>...</button>
                <button onClick={onCreateTask} aria-label={`Add task to ${group.title}`}>
                  <Plus size={18} />
                </button>
              </div>
              <div className="task-grid-head">
                <span>Name</span>
                <span>Priority</span>
                <span>Due date</span>
                <span>Assignee</span>
                <span>Created by</span>
              </div>
              <div className="task-group-rows">
                {group.tasks.map((task) => (
                  <TaskRow key={task.id} task={task} users={users} onOpenTask={onOpenTask} onUpdateTask={onUpdateTask} onDeleteTask={onDeleteTask} />
                ))}
              </div>
              <button className="inline-add-task" onClick={onCreateTask}>
                <Plus size={18} />
                Add Task
              </button>
            </section>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h3>No tasks found</h3>
          <p>Adjust filters or create a new task for this workspace.</p>
          <button className="button primary" onClick={onCreateTask}>
            <Plus size={16} />
            Create task
          </button>
        </div>
      )}
    </section>
  );
}
