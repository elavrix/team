import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Hash,
  Home,
  Inbox,
  Layers3,
  Lock,
  Pencil,
  Plus,
  Search,
  Settings,
  Star,
  Users,
  X
} from "lucide-react";
import { useMemo, useState } from "react";

const railItems = [
  { key: "home", id: "dashboard", label: "Home", icon: Home, badge: 2, sidebarTab: "spaces" },
  { key: "inbox", id: "inbox", label: "Inbox", icon: Inbox, badge: 2, sidebarTab: "unread" },
  { key: "tasks", id: "list", label: "Tasks", icon: CheckCircle2, sidebarTab: "unread" },
  { key: "board", id: "board", label: "Board", icon: Layers3, sidebarTab: "spaces" },
  { key: "calendar", id: "calendar", label: "Calendar", icon: CalendarDays, sidebarTab: "unread" },
  { key: "team", id: "team", label: "Team", icon: Users, sidebarTab: "dms" }
];

const homeItems = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "inbox", label: "Inbox", icon: Inbox, badge: 2 },
  { id: "list", label: "My Tasks", icon: CheckCircle2 },
  { id: "calendar", label: "Today & Overdue", icon: CalendarDays, meta: "1" },
  { id: "board", label: "Overview", icon: Layers3 },
  { id: "team", label: "Team", icon: Users }
];

const unreadItems = [
  { id: "inbox", label: "Inbox updates", icon: Inbox, badge: 2 },
  { id: "list", label: "Unread tasks", icon: CheckCircle2, meta: "4" },
  { id: "calendar", label: "Overdue alerts", icon: CalendarDays, meta: "1" }
];

const directMessages = [
  { id: "u2", initials: "FA", name: "Faisal Ali", presence: "Available" },
  { id: "u1", initials: "AS", name: "Amir Sharif", presence: "You" },
  { id: "u3", initials: "SK", name: "Sarah Khan", presence: "Design" },
  { id: "u4", initials: "AR", name: "Ali Raza", presence: "Engineering" }
];

export default function Sidebar({
  activeView,
  projects,
  sidebarOpen,
  sidebarCollapsed,
  onClose,
  onDismiss,
  onOpenSidebar,
  onSelectView,
  onRenameWorkspace,
  onCreateProject
}) {
  const [sidebarTab, setSidebarTab] = useState("all");
  const filteredPanel = useMemo(() => {
    if (sidebarTab === "unread") return "unread";
    if (sidebarTab === "dms") return "dms";
    if (sidebarTab === "spaces") return "spaces";
    return "spaces";
  }, [sidebarTab]);

  const handleNav = (id, options = {}) => {
    if (options.tab) setSidebarTab(options.tab);
    onOpenSidebar?.();
    onSelectView(id);
  };

  return (
    <>
      <aside className="app-rail" aria-label="Global navigation">
        <nav className="rail-nav">
          {railItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.key}
                className={isActive ? "active" : ""}
                onClick={() => handleNav(item.id, { tab: item.sidebarTab || "spaces" })}
                title={item.label}
              >
                <span className="rail-icon">
                  <Icon size={15} />
                  {item.badge && <b>{item.badge}</b>}
                </span>
                <small>{item.label}</small>
              </button>
            );
          })}
        </nav>
      </aside>
      <aside className={`sidebar ${sidebarOpen ? "is-open" : ""} ${sidebarCollapsed ? "is-collapsed" : ""}`}>
        <button className="mobile-close icon-button" onClick={onClose} aria-label="Close navigation">
          <X size={14} />
        </button>
        <label className="sidebar-search">
          <Search size={16} />
          <input placeholder="Search workspace" />
        </label>
        <div className="sidebar-homebar">
          <div>
            <h2>Home</h2>
          </div>
          <button className="icon-button" onClick={onCreateProject} aria-label="Create project">
            <Plus size={17} />
          </button>
        </div>
        <div className="sidebar-tabs">
          <button className={sidebarTab === "all" ? "active" : ""} onClick={() => setSidebarTab("all")}>
            All
          </button>
          <button className={sidebarTab === "spaces" ? "active" : ""} onClick={() => setSidebarTab("spaces")}>
            Spaces
          </button>
          <button className={sidebarTab === "unread" ? "active" : ""} onClick={() => setSidebarTab("unread")}>
            Unread
          </button>
          <button className={sidebarTab === "dms" ? "active" : ""} onClick={() => setSidebarTab("dms")}>
            DMs
          </button>
        </div>
        <nav className="sidebar-nav">
          {homeItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={activeView === item.id ? "active" : ""}
                onClick={() => handleNav(item.id)}
                title={item.label}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.badge && <b className="nav-badge">{item.badge}</b>}
                {item.meta && <small>{item.meta}</small>}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-section">
          <div className="project-heading">
            <span className="section-label">Favorites</span>
          </div>
          <button className="project-link muted-link">
            <Star size={15} />
            Add to your sidebar
          </button>
        </div>
        {(sidebarTab === "all" || filteredPanel === "spaces") && (
          <>
            <div className="sidebar-section">
              <div className="project-heading">
                <span className="section-label">Channels</span>
                <button className="icon-button tiny" aria-label="Add channel">
                  <Plus size={14} />
                </button>
              </div>
              <button className="project-link">
                <Hash size={15} />
                Account & Finance
                <Lock size={12} className="link-lock" />
              </button>
              <button className="project-link">
                <Hash size={15} />
                Welcome
              </button>
              <button className="project-link">
                <Hash size={15} />
                General
                <span className="project-muted">Codeink Studio</span>
              </button>
            </div>
            <div className="project-section">
              <div className="project-heading">
                <span className="section-label">Spaces</span>
                <button className="icon-button tiny" onClick={onCreateProject} aria-label="Create project">
                  <Plus size={14} />
                </button>
              </div>
              <button className="project-link" onClick={onRenameWorkspace}>
                <Pencil size={15} />
                Rename workspace
              </button>
              {projects.map((project) => (
                <button key={project.id} className="project-link" onClick={() => handleNav("list")}>
                  <span className="project-dot" style={{ background: project.color }} />
                  {project.name}
                </button>
              ))}
            </div>
          </>
        )}
        {(sidebarTab === "all" || filteredPanel === "unread") && (
          <div className="sidebar-section">
            <div className="project-heading">
              <span className="section-label">Unread</span>
            </div>
            {unreadItems.map((item) => {
              const Icon = item.icon;
              return (
                <button key={item.label} className="project-link" onClick={() => handleNav(item.id)}>
                  <Icon size={15} />
                  {item.label}
                  {item.badge && <b className="nav-badge">{item.badge}</b>}
                  {item.meta && <span className="project-muted">{item.meta}</span>}
                </button>
              );
            })}
          </div>
        )}
        {(sidebarTab === "all" || filteredPanel === "dms") && (
          <div className="sidebar-section">
            <div className="project-heading">
              <span className="section-label">Direct Messages</span>
            </div>
            {directMessages.map((member) => (
              <button key={member.id} className="dm-link" onClick={() => handleNav("team")}>
                <span className={`avatar mini ${member.initials === "AS" ? "online" : ""}`}>{member.initials}</span>
                {member.name}
                <span className="project-muted">{member.presence}</span>
              </button>
            ))}
            <button className="dm-compose" onClick={() => handleNav("team")}>
              <Plus size={14} />
              New message
            </button>
          </div>
        )}
        <button className="customize-sidebar">
          <Settings size={15} />
          Customize Sidebar
        </button>
      </aside>
      <button className={`sidebar-scrim ${sidebarOpen ? "is-open" : ""}`} onClick={onDismiss} aria-label="Close navigation overlay" />
    </>
  );
}
