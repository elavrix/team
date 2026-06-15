import { Bell, CheckCheck } from "lucide-react";

export default function NotificationPanel({ notifications, users, tasks, onRead }) {
  const unreadCount = notifications.filter((notice) => !notice.readAt).length;

  return (
    <section className="panel notification-panel">
      <div className="panel-header compact-panel-header">
        <div>
          <span className="eyebrow">Realtime</span>
          <h2>Notifications</h2>
        </div>
        <span className="notification-count">
          <Bell size={15} />
          {unreadCount}
        </span>
      </div>
      <div className="notification-list">
        {notifications.length === 0 && <p className="empty-note">No notifications yet.</p>}
        {notifications.slice(0, 6).map((notice) => {
          const actor = users.find((user) => user.id === notice.actorId);
          const task = tasks.find((item) => item.id === notice.taskId);
          return (
            <button
              key={notice.id}
              className={`notification-item ${notice.readAt ? "" : "is-unread"}`}
              onClick={() => onRead(notice.id)}
            >
              <span className="avatar small">{actor?.initials || "TM"}</span>
              <span>
                <strong>{notice.title}</strong>
                <small>{task?.title || notice.body || "Workspace update"}</small>
              </span>
              {!notice.readAt && <CheckCheck size={15} />}
            </button>
          );
        })}
      </div>
    </section>
  );
}

