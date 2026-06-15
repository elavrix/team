import { Clock3, TrendingUp } from "lucide-react";
import StatsCard from "./StatsCard.jsx";

const today = new Date("2026-05-29T00:00:00");

export default function Dashboard({ tasks, users, projects, activities, onOpenTask }) {
  const completed = tasks.filter((task) => task.status === "Completed").length;
  const inProgress = tasks.filter((task) => task.status === "In Progress").length;
  const overdue = tasks.filter((task) => task.status !== "Completed" && new Date(task.dueDate) < today).length;

  return (
    <div className="dashboard-grid">
      <section className="stats-grid">
        <StatsCard label="Total Tasks" value={tasks.length} detail="Across active projects" />
        <StatsCard label="Completed Tasks" value={completed} tone="success" detail="Ready for delivery" />
        <StatsCard label="In Progress Tasks" value={inProgress} tone="primary" detail="Moving this week" />
        <StatsCard label="Overdue Tasks" value={overdue} tone="danger" detail="Need attention" />
      </section>
      <section className="panel wide">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Focus</span>
            <h2>My Tasks</h2>
          </div>
          <Clock3 size={18} />
        </div>
        <div className="task-stack">
          {tasks.slice(0, 5).map((task) => (
            <button className="mini-task" key={task.id} onClick={() => onOpenTask(task.id)}>
              <span className={`status-dot ${task.status.toLowerCase().replaceAll(" ", "-")}`} />
              <strong>{task.title}</strong>
              <small>{task.assignee?.name}</small>
            </button>
          ))}
        </div>
      </section>
      <section className="panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Live feed</span>
            <h2>Recent Activity</h2>
          </div>
        </div>
        <div className="activity-list">
          {activities.map((item) => (
            <div key={item} className="activity-item">
              <span />
              <p>{item}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Capacity</span>
            <h2>Team Workload</h2>
          </div>
        </div>
        <div className="workload-list">
          {users.map((user) => {
            const count = tasks.filter((task) => task.assigneeId === user.id && task.status !== "Completed").length;
            return (
              <div className="workload-row" key={user.id}>
                <span className="avatar small">{user.initials}</span>
                <div>
                  <strong>{user.name}</strong>
                  <small>{user.role}</small>
                </div>
                <b>{count}</b>
              </div>
            );
          })}
        </div>
      </section>
      <section className="panel wide">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Delivery</span>
            <h2>Project Progress</h2>
          </div>
          <TrendingUp size={18} />
        </div>
        <div className="progress-list">
          {projects.map((project) => {
            const projectTasks = tasks.filter((task) => task.projectId === project.id);
            const done = projectTasks.filter((task) => task.status === "Completed").length;
            const progress = projectTasks.length ? Math.round((done / projectTasks.length) * 100) : 0;
            return (
              <div className="progress-row" key={project.id}>
                <div>
                  <strong>{project.name}</strong>
                  <small>{projectTasks.length} tasks</small>
                </div>
                <div className="progress-track">
                  <span style={{ width: `${progress}%`, background: project.color }} />
                </div>
                <b>{progress}%</b>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
