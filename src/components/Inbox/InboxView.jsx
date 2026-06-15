import { Activity, Check, CheckCheck, CircleDashed, Clock3, Filter, Inbox, Search, UserRound, Waves } from "lucide-react";
import { useMemo, useState } from "react";

function formatDate(value) {
  if (!value) return "No date";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(value));
}

function InboxRow({ row, onClear, onLater, onOpen }) {
  return (
    <div className={`inbox-row ${row.done ? "is-cleared" : ""}`}>
      <button className="inbox-row-title" onClick={onOpen}>
        <span className={row.done ? "inbox-done" : "inbox-pending"}>{row.done ? <Check size={13} /> : <CircleDashed size={18} />}</span>
        <strong>{row.title}</strong>
      </button>
      <button className="inbox-row-message" onClick={onOpen}>
        {row.actorInitials ? <span className="avatar inbox-avatar">{row.actorInitials}</span> : <UserRound size={17} />}
        <span>
          {row.actorName && <em>{row.actorName}</em>} <b>{row.message}</b>
        </span>
      </button>
      <time>{formatDate(row.date)}</time>
      <div className="inbox-hover-actions">
        {!row.done && (
          <button aria-label="Move to later" onClick={onLater}>
            <Clock3 size={17} />
          </button>
        )}
        {!row.done && (
          <button aria-label="Clear inbox item" onClick={onClear}>
            <Check size={17} />
            Clear
          </button>
        )}
        {row.done && (
          <button aria-label="Open cleared item" onClick={onOpen}>
            Open
          </button>
        )}
      </div>
    </div>
  );
}

export default function InboxView({
  currentMember,
  notifications = [],
  users = [],
  tasks = [],
  onOpenTask,
  onRead,
  onReadAll
}) {
  const [activeTab, setActiveTab] = useState("primary");
  const [query, setQuery] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [laterIds, setLaterIds] = useState([]);
  const [clearedTaskIds, setClearedTaskIds] = useState([]);

  const rows = useMemo(() => {
    const notificationRows = notifications.map((notice) => {
      const actor = users.find((user) => user.id === notice.actorId);
      const task = tasks.find((item) => item.id === notice.taskId);
      return {
        id: `notice-${notice.id}`,
        sourceId: notice.id,
        taskId: notice.taskId,
        type: notice.type || "notification",
        title: task?.title || notice.body || notice.title,
        message: notice.title,
        actorName: actor?.name,
        actorInitials: actor?.initials,
        date: notice.createdAt,
        done: Boolean(notice.readAt),
        source: "notification"
      };
    });

    const assignedTaskRows = tasks
      .filter((task) => task.assigneeId === currentMember?.id)
      .map((task) => ({
        id: `task-${task.id}`,
        sourceId: task.id,
        taskId: task.id,
        type: "assigned_task",
        title: task.title,
        message: `${task.status} task assigned to you`,
        actorName: task.project?.name,
        actorInitials: task.project?.name?.slice(0, 2).toUpperCase(),
        date: task.dueDate,
        done: task.status === "Completed" || clearedTaskIds.includes(task.id),
        source: "task"
      }));

    const merged = [...notificationRows, ...assignedTaskRows];
    const seen = new Set();
    return merged
      .filter((row) => {
        const key = `${row.source}-${row.sourceId}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [notifications, users, tasks, currentMember?.id, clearedTaskIds]);

  const visibleRows = rows.filter((row) => {
    const normalized = query.trim().toLowerCase();
    const isLater = laterIds.includes(row.id);
    const matchesQuery =
      !normalized ||
      row.title.toLowerCase().includes(normalized) ||
      row.message.toLowerCase().includes(normalized) ||
      row.actorName?.toLowerCase().includes(normalized);
    const matchesUnread = !unreadOnly || !row.done;
    const matchesTab =
      (activeTab === "primary" && !row.done && !isLater) ||
      (activeTab === "other" && row.type !== "task_assigned" && row.type !== "assigned_task" && !row.done && !isLater) ||
      (activeTab === "later" && isLater) ||
      (activeTab === "cleared" && row.done);
    return matchesQuery && matchesUnread && matchesTab;
  });

  const unreadCount = rows.filter((row) => !row.done && !laterIds.includes(row.id)).length;
  const laterCount = rows.filter((row) => laterIds.includes(row.id)).length;
  const clearedCount = rows.filter((row) => row.done).length;

  const clearRow = (row) => {
    if (row.source === "notification") onRead(row.sourceId);
    if (row.source === "task") setClearedTaskIds((current) => (current.includes(row.sourceId) ? current : [...current, row.sourceId]));
    setLaterIds((current) => current.filter((id) => id !== row.id));
  };

  const clearVisible = () => {
    const notificationIds = visibleRows.filter((row) => row.source === "notification" && !row.done).map((row) => row.sourceId);
    const taskIds = visibleRows.filter((row) => row.source === "task" && !row.done).map((row) => row.sourceId);
    if (notificationIds.length) onReadAll(notificationIds);
    if (taskIds.length) setClearedTaskIds((current) => [...new Set([...current, ...taskIds])]);
    setLaterIds((current) => current.filter((id) => !visibleRows.some((row) => row.id === id)));
  };

  return (
    <section className="inbox-workspace">
      <div className="inbox-tabs">
        <button className={activeTab === "primary" ? "active" : ""} onClick={() => setActiveTab("primary")}>
          <Inbox size={19} />
          <span>
            Primary
            <small>{unreadCount} unread</small>
          </span>
        </button>
        <button className={activeTab === "other" ? "active" : ""} onClick={() => setActiveTab("other")}>
          <Activity size={19} />
          Other
        </button>
        <button className={activeTab === "later" ? "active" : ""} onClick={() => setActiveTab("later")}>
          <Clock3 size={19} />
          <span>
            Later
            <small>{laterCount} saved</small>
          </span>
        </button>
        <button className={activeTab === "cleared" ? "active" : ""} onClick={() => setActiveTab("cleared")}>
          <CheckCheck size={19} />
          <span>
            Cleared
            <small>{clearedCount} done</small>
          </span>
        </button>
      </div>

      <div className="inbox-actions-bar">
        <label className="inbox-search">
          <Search size={16} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search inbox" />
        </label>
        <div>
          <button className={`view-chip ${unreadOnly ? "active" : ""}`} onClick={() => setUnreadOnly((current) => !current)}>
            <Filter size={16} />
            Unread only
          </button>
          <button className="view-chip" onClick={clearVisible} disabled={!visibleRows.some((row) => !row.done)}>
            <Waves size={16} />
            Clear visible
          </button>
        </div>
      </div>

      <div className="inbox-section">
        <h2>{activeTab === "cleared" ? "Cleared items" : activeTab === "later" ? "Saved for later" : "Needs attention"}</h2>
        <div className="inbox-list-card">
          {visibleRows.length === 0 && <p className="empty-note">Nothing here right now.</p>}
          {visibleRows.map((row) => (
            <InboxRow
              key={row.id}
              row={row}
              onOpen={() => row.taskId && onOpenTask(row.taskId)}
              onClear={() => clearRow(row)}
              onLater={() => setLaterIds((current) => (current.includes(row.id) ? current : [...current, row.id]))}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
