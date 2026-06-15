import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Flower2,
  Grid2X2,
  LogOut,
  Plus,
  Search,
  SquareChartGantt
} from "lucide-react";

export default function Topbar({
  activeView,
  workspaceName,
  query,
  onQueryChange,
  onCreateTask,
  onSelectView,
  onRenameWorkspace,
  onLogout
}) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-workspace">
          <div className="workspace-logo topbar-logo">
            <img src="/codeink-logo.png" alt="Codeink Studio" />
          </div>
          <button className="workspace-selector" onClick={onRenameWorkspace}>
            <span>
              <strong>{workspaceName}</strong>
              <small>Codeink Studio</small>
            </span>
            <ChevronDown size={14} />
          </button>
          <button className="topbar-calendar" onClick={() => onSelectView("calendar")} aria-label="Open calendar">
            <CalendarDays size={15} />
          </button>
        </div>
      </div>

      <div className="topbar-center">
        <div className="topbar-search">
          <Search size={15} />
          <input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search" />
          <kbd>⌘K</kbd>
          <span className="search-spark" aria-hidden="true">
            <Flower2 size={15} />
          </span>
        </div>
      </div>

      <div className="topbar-right">
        <div className="topbar-view-links">
          <button className={activeView === "dashboard" ? "active" : ""} onClick={() => onSelectView("dashboard")}>
            <Grid2X2 size={14} />
            <span>Dashboard</span>
          </button>
          <button className={activeView === "list" ? "active" : ""} onClick={() => onSelectView("list")}>
            <CheckCircle2 size={14} />
            <span>List</span>
          </button>
          <button className={activeView === "board" ? "active" : ""} onClick={() => onSelectView("board")}>
            <SquareChartGantt size={14} />
            <span>Board</span>
          </button>
          <button className={activeView === "calendar" ? "active" : ""} onClick={() => onSelectView("calendar")}>
            <CalendarDays size={14} />
            <span>Calendar</span>
          </button>
        </div>

        <button className="button primary topbar-create" onClick={onCreateTask}>
          <Plus size={15} />
          <span>Create Task</span>
        </button>

        <button className="icon-button logout-button" onClick={onLogout} aria-label="Sign out">
          <LogOut size={15} />
        </button>
        <div className="avatar topbar-avatar">AS</div>
      </div>
    </header>
  );
}
