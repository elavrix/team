import { useCallback, useEffect, useMemo, useState } from "react";
import { Routes, Route, Navigate, useNavigate, useParams } from "react-router-dom";
import { X } from "lucide-react";
import Login from "./components/Auth/Login.jsx";
import Signup from "./components/Auth/Signup.jsx";
import Sidebar from "./components/Layout/Sidebar.jsx";
import Topbar from "./components/Layout/Topbar.jsx";
import Dashboard from "./components/Dashboard/Dashboard.jsx";
import TaskList from "./components/Tasks/TaskList.jsx";
import TaskModal from "./components/Tasks/TaskModal.jsx";
import TaskDrawer from "./components/Tasks/TaskDrawer.jsx";
import BoardView from "./components/Board/BoardView.jsx";
import CalendarView from "./components/Calendar/CalendarView.jsx";
import InboxView from "./components/Inbox/InboxView.jsx";
import TeamPanel from "./components/Team/TeamPanel.jsx";
import DirectMessages from "./components/Chat/DirectMessages.jsx";
import NotificationPanel from "./components/Notifications/NotificationPanel.jsx";
import { activities as seedActivities } from "./data/sampleData.js";
import { appStore, usingSupabase } from "./lib/appStore.js";

const storageKeys = {
  view: "flowdesk.selectedView"
};

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function WorkspaceApp({ session, onLogout }) {
  const navigate = useNavigate();
  const { view = "dashboard" } = useParams();
  const [workspace, setWorkspace] = useState({ id: "", name: "Flowdesk" });
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentMember, setCurrentMember] = useState(session?.member || null);
  const [notifications, setNotifications] = useState([]);
  const [directMessages, setDirectMessages] = useState([]);
  const [activities, setActivities] = useState(seedActivities);
  const [isLoadingWorkspace, setIsLoadingWorkspace] = useState(true);
  const [workspaceError, setWorkspaceError] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quickCreate, setQuickCreate] = useState(null);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({ status: "All", assignee: "All" });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => localStorage.setItem(storageKeys.view, JSON.stringify(view)), [view]);

  const loadWorkspace = useCallback(async () => {
    try {
      setWorkspaceError("");
      const data = await appStore.loadWorkspace();
      setWorkspace(data.workspace);
      setUsers(data.users);
      setProjects(data.projects);
      setTasks(data.tasks);
      setNotifications(data.notifications || []);
      setDirectMessages(data.directMessages || []);
      setCurrentMember(data.currentMember || session?.member || null);
    } catch (error) {
      setWorkspaceError(error.message || "Could not load workspace.");
    } finally {
      setIsLoadingWorkspace(false);
    }
  }, [session?.member]);

  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  useEffect(() => {
    if (!usingSupabase || !workspace.id || !currentMember?.id) return undefined;
    return appStore.subscribe(workspace.id, currentMember.id, () => loadWorkspace());
  }, [workspace.id, currentMember?.id, loadWorkspace]);

  const selectedTask = tasks.find((task) => task.id === selectedTaskId);

  const enrichedTasks = useMemo(
    () =>
      tasks.map((task) => ({
        ...task,
        assignee: users.find((user) => user.id === task.assigneeId),
        project: projects.find((project) => project.id === task.projectId)
      })),
    [tasks, projects, users]
  );

  const filteredTasks = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return enrichedTasks.filter((task) => {
      const matchesSearch =
        !normalized ||
        task.title.toLowerCase().includes(normalized) ||
        task.description.toLowerCase().includes(normalized) ||
        task.project?.name.toLowerCase().includes(normalized);
      const matchesStatus = filters.status === "All" || task.status === filters.status;
      const matchesAssignee = filters.assignee === "All" || task.assigneeId === filters.assignee;
      return matchesSearch && matchesStatus && matchesAssignee;
    });
  }, [enrichedTasks, query, filters]);

  const addActivity = (message) => setActivities((current) => [message, ...current].slice(0, 8));

  const createTask = async (payload) => {
    try {
      const task = await appStore.createTask(workspace.id, payload, currentMember);
      setTasks((current) => [task, ...current]);
      addActivity(`Created task: ${payload.title}`);
      setIsModalOpen(false);
      await loadWorkspace();
    } catch (error) {
      setWorkspaceError(error.message || "Could not create task.");
    }
  };

  const updateTask = async (taskId, patch) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId
          ? { ...task, ...patch, activity: [`Task updated`, ...(task.activity || [])].slice(0, 8) }
          : task
      )
    );
    try {
      await appStore.updateTask(workspace.id, taskId, patch, currentMember);
      addActivity("Updated a task");
      await loadWorkspace();
    } catch (error) {
      setWorkspaceError(error.message || "Could not update task.");
      await loadWorkspace();
    }
  };

  const deleteTask = async (taskId) => {
    const task = tasks.find((item) => item.id === taskId);
    setTasks((current) => current.filter((item) => item.id !== taskId));
    if (selectedTaskId === taskId) setSelectedTaskId(null);
    if (task) addActivity(`Deleted task: ${task.title}`);
    try {
      await appStore.deleteTask(taskId);
    } catch (error) {
      setWorkspaceError(error.message || "Could not delete task.");
      await loadWorkspace();
    }
  };

  const addComment = async (taskId, text) => {
    const comment = await appStore.addTaskMessage(workspace.id, taskId, text, currentMember);
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId
          ? {
              ...task,
              comments: [...(task.comments || []), comment],
              activity: ["Comment added", ...(task.activity || [])].slice(0, 8)
            }
          : task
      )
    );
    addActivity("Added a task comment");
    await loadWorkspace();
  };

  const selectView = (nextView) => {
    navigate(`/app/${nextView}`);
    setSidebarOpen(false);
  };

  const openSidebar = () => {
    setSidebarCollapsed(false);
    setSidebarOpen(true);
  };

  const collapseSidebar = () => {
    setSidebarOpen(false);
    setSidebarCollapsed(true);
  };

  const createProject = async (name) => {
    try {
      const project = await appStore.createProject(workspace.id, name);
      setProjects((current) => [...current, project]);
      addActivity(`Created project: ${name}`);
    } catch (error) {
      setWorkspaceError(error.message || "Could not create project.");
    }
  };

  const renameWorkspace = async (name) => {
    try {
      const nextWorkspace = await appStore.renameWorkspace(workspace.id, name);
      setWorkspace(nextWorkspace);
    } catch (error) {
      setWorkspaceError(error.message || "Could not rename workspace.");
    }
  };

  const sendDirectMessage = async (recipientId, body) => {
    try {
      const message = await appStore.sendDirectMessage(workspace.id, recipientId, body, currentMember);
      setDirectMessages((current) => [...current, message]);
      await loadWorkspace();
    } catch (error) {
      setWorkspaceError(error.message || "Could not send message.");
    }
  };

  const markNotificationRead = async (notificationId) => {
    setNotifications((current) =>
      current.map((notice) => (notice.id === notificationId ? { ...notice, readAt: new Date().toISOString() } : notice))
    );
    try {
      await appStore.markNotificationRead(notificationId);
    } catch (error) {
      setWorkspaceError(error.message || "Could not update notification.");
    }
  };

  const markNotificationsRead = async (notificationIds) => {
    const idSet = new Set(notificationIds);
    setNotifications((current) =>
      current.map((notice) => (idSet.has(notice.id) ? { ...notice, readAt: new Date().toISOString() } : notice))
    );
    try {
      await Promise.all(notificationIds.map((notificationId) => appStore.markNotificationRead(notificationId)));
    } catch (error) {
      setWorkspaceError(error.message || "Could not clear notifications.");
      await loadWorkspace();
    }
  };

  const selectedTaskWithRelations = selectedTask
    ? {
        ...selectedTask,
        assignee: users.find((user) => user.id === selectedTask.assigneeId),
        project: projects.find((project) => project.id === selectedTask.projectId)
      }
    : null;

  return (
    <div className="app-shell">
      <Topbar
        activeView={view}
        workspaceName={workspace.name}
        query={query}
        onQueryChange={setQuery}
        onCreateTask={() => setIsModalOpen(true)}
        onSelectView={selectView}
        onRenameWorkspace={() => setQuickCreate("workspace")}
        onLogout={onLogout}
      />
      <div className="app-body">
        <Sidebar
          activeView={view}
          projects={projects}
          tasks={enrichedTasks}
          notifications={notifications}
          directMessages={directMessages}
          currentMember={currentMember}
          users={users}
          sidebarOpen={sidebarOpen}
          sidebarCollapsed={sidebarCollapsed}
          onClose={collapseSidebar}
          onDismiss={() => setSidebarOpen(false)}
          onOpenSidebar={openSidebar}
          onSelectView={selectView}
          onRenameWorkspace={() => setQuickCreate("workspace")}
          onCreateProject={() => setQuickCreate("project")}
        />
        <div className="app-main">
          <main className="workspace">
          {workspaceError && <p className="workspace-alert">{workspaceError}</p>}
          {isLoadingWorkspace && <p className="workspace-alert">Loading workspace...</p>}
          {view === "dashboard" && (
            <>
              <Dashboard tasks={enrichedTasks} users={users} projects={projects} activities={activities} onOpenTask={setSelectedTaskId} />
              <NotificationPanel notifications={notifications} users={users} tasks={tasks} onRead={markNotificationRead} />
            </>
          )}
          {view === "inbox" && (
            <InboxView
              currentMember={currentMember}
              notifications={notifications}
              users={users}
              tasks={enrichedTasks}
              onOpenTask={setSelectedTaskId}
              onRead={markNotificationRead}
              onReadAll={markNotificationsRead}
            />
          )}
          {view === "list" && (
            <TaskList
              tasks={filteredTasks}
              users={users}
              filters={filters}
              onFilterChange={setFilters}
              onCreateTask={() => setIsModalOpen(true)}
              onOpenTask={setSelectedTaskId}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
            />
          )}
          {view === "board" && <BoardView tasks={filteredTasks} onOpenTask={setSelectedTaskId} onUpdateTask={updateTask} />}
          {view === "calendar" && <CalendarView tasks={enrichedTasks} onOpenTask={setSelectedTaskId} />}
          {view === "team" && (
            <>
              <TeamPanel users={users} tasks={tasks} />
              <DirectMessages currentMember={currentMember} users={users} messages={directMessages} onSendMessage={sendDirectMessage} />
            </>
          )}
          </main>
        </div>
      </div>
      <TaskModal isOpen={isModalOpen} users={users} projects={projects} onClose={() => setIsModalOpen(false)} onCreate={createTask} />
      <QuickCreateModal
        type={quickCreate}
        currentWorkspace={workspace.name}
        onClose={() => setQuickCreate(null)}
        onSave={(value) => {
          if (quickCreate === "workspace") renameWorkspace(value);
          if (quickCreate === "project") createProject(value);
          setQuickCreate(null);
        }}
      />
      <TaskDrawer
        task={selectedTaskWithRelations}
        users={users}
        projects={projects}
        onClose={() => setSelectedTaskId(null)}
        onUpdateTask={updateTask}
        onAddComment={addComment}
      />
    </div>
  );
}

function QuickCreateModal({ type, currentWorkspace, onClose, onSave }) {
  const [value, setValue] = useState("");

  useEffect(() => {
    setValue(type === "workspace" ? currentWorkspace : "");
  }, [type, currentWorkspace]);

  if (!type) return null;

  const title = type === "workspace" ? "Workspace Name" : "Create Project";
  const placeholder = type === "workspace" ? "Workspace name" : "Project name";

  return (
    <div className="modal-backdrop">
      <form
        className="quick-modal"
        onSubmit={(event) => {
          event.preventDefault();
          if (value.trim()) onSave(value.trim());
        }}
      >
        <div className="modal-header">
          <div>
            <span className="eyebrow">Workspace setup</span>
            <h2>{title}</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close setup modal">
            <X size={18} />
          </button>
        </div>
        <label>
          Name
          <input value={value} onChange={(event) => setValue(event.target.value)} placeholder={placeholder} autoFocus />
        </label>
        <div className="modal-actions">
          <button type="button" className="button secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="button primary" type="submit">
            Save
          </button>
        </div>
      </form>
    </div>
  );
}

export default function App() {
  const navigate = useNavigate();
  const savedView = readStorage(storageKeys.view, "dashboard");
  const [session, setSession] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    appStore
      .getSession()
      .then((currentSession) => setSession(currentSession))
      .catch(() => setSession(null))
      .finally(() => setIsCheckingSession(false));
  }, []);

  const requestCode = async (email, metadata) => {
    try {
      setAuthError("");
      await appStore.requestOtp(email.trim().toLowerCase(), metadata);
    } catch (error) {
      setAuthError(error.message || "Could not send verification code.");
      throw error;
    }
  };

  const login = async ({ email, code }) => {
    try {
      const nextSession = await appStore.verifyOtp(email.trim().toLowerCase(), code.trim());
      setSession(nextSession);
      setAuthError("");
      navigate(`/app/${savedView || "dashboard"}`, { replace: true });
    } catch (error) {
      setAuthError(error.message || "Invalid verification code.");
    }
  };

  const completeSignup = async ({ name, email, code }) => {
    try {
      const nextSession = await appStore.verifyOtp(email.trim().toLowerCase(), code.trim(), { name });
      setSession(nextSession);
      setAuthError("");
      navigate(`/app/${savedView || "dashboard"}`, { replace: true });
    } catch (error) {
      setAuthError(error.message || "Could not complete signup.");
    }
  };

  const logout = async () => {
    await appStore.logout();
    setSession(null);
    setAuthError("");
    navigate("/login", { replace: true });
  };

  if (isCheckingSession) return null;

  return (
    <Routes>
      <Route
        path="/login"
        element={
          session ? (
            <Navigate to={`/app/${savedView || "dashboard"}`} replace />
          ) : (
            <Login onLogin={login} onRequestCode={requestCode} error={authError} />
          )
        }
      />
      <Route
        path="/signup/:token"
        element={
          session ? (
            <Navigate to={`/app/${savedView || "dashboard"}`} replace />
          ) : (
            <Signup onSignup={completeSignup} onRequestCode={requestCode} error={authError} />
          )
        }
      />
      <Route
        path="/signup"
        element={
          session ? (
            <Navigate to={`/app/${savedView || "dashboard"}`} replace />
          ) : (
            <Signup onSignup={completeSignup} onRequestCode={requestCode} error={authError} />
          )
        }
      />
      <Route path="/app/:view" element={session ? <WorkspaceApp session={session} onLogout={logout} /> : <Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to={session ? `/app/${savedView || "dashboard"}` : "/login"} replace />} />
    </Routes>
  );
}
