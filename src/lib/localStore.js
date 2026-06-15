import { projects as seedProjects, tasks as seedTasks, users as seedUsers } from "../data/sampleData.js";

const keys = {
  session: "flowdesk.local.session",
  workspace: "flowdesk.local.workspace",
  projects: "flowdesk.local.projects",
  tasks: "flowdesk.local.tasks",
  users: "flowdesk.local.users",
  notifications: "flowdesk.local.notifications",
  directMessages: "flowdesk.local.directMessages"
};

const demoSession = {
  user: { id: "local-user", email: "amir@codeink.com" },
  member: { id: "u1", userId: "local-user", email: "amir@codeink.com", name: "Amir Sharif", initials: "AS", role: "owner" }
};

function read(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  return value;
}

function initialsFor(nameOrEmail) {
  return nameOrEmail
    .split(/[.\s@_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function ensure() {
  if (!read(keys.workspace, null)) write(keys.workspace, { id: "local-workspace", name: "Flowdesk" });
  if (!read(keys.projects, null)) write(keys.projects, seedProjects);
  if (!read(keys.tasks, null)) write(keys.tasks, seedTasks);
  if (!read(keys.users, null)) write(keys.users, seedUsers);
  if (!read(keys.notifications, null)) write(keys.notifications, []);
  if (!read(keys.directMessages, null)) write(keys.directMessages, []);
}

export const localStore = {
  async getSession() {
    ensure();
    return read(keys.session, null);
  },
  async requestOtp(email) {
    ensure();
    write(keys.session, { ...demoSession, user: { ...demoSession.user, email } });
    return { needsCode: true };
  },
  async verifyOtp(email) {
    ensure();
    const session = { ...demoSession, user: { ...demoSession.user, email } };
    write(keys.session, session);
    return session;
  },
  async logout() {
    localStorage.removeItem(keys.session);
  },
  async loadWorkspace() {
    ensure();
    const workspace = read(keys.workspace, { id: "local-workspace", name: "Flowdesk" });
    const users = read(keys.users, seedUsers);
    const projects = read(keys.projects, seedProjects);
    const tasks = read(keys.tasks, seedTasks);
    const notifications = read(keys.notifications, []);
    const directMessages = read(keys.directMessages, []);
    return { workspace, users, projects, tasks, notifications, directMessages };
  },
  async renameWorkspace(_workspaceId, name) {
    return write(keys.workspace, { id: "local-workspace", name });
  },
  async createProject(_workspaceId, name) {
    const projects = read(keys.projects, seedProjects);
    const colorPool = ["#7B68EE", "#F59E0B", "#2563EB", "#22C55E", "#EF4444"];
    const project = { id: `p${Date.now()}`, name, color: colorPool[projects.length % colorPool.length] };
    write(keys.projects, [...projects, project]);
    return project;
  },
  async createMember(_workspaceId, payload) {
    const users = read(keys.users, seedUsers);
    const member = {
      id: `u${Date.now()}`,
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      role: payload.role || "member",
      position: payload.position || payload.role || "Team Member",
      initials: initialsFor(payload.name || payload.email)
    };
    write(keys.users, [...users, member]);
    return member;
  },
  async updateMember(memberId, patch) {
    const users = read(keys.users, seedUsers);
    let updatedMember = null;
    write(
      keys.users,
      users.map((user) => {
        if (user.id !== memberId) return user;
        updatedMember = { ...user, ...patch };
        return updatedMember;
      })
    );
    return updatedMember;
  },
  async deleteMember(memberId) {
    const users = read(keys.users, seedUsers);
    const tasks = read(keys.tasks, seedTasks);
    write(
      keys.tasks,
      tasks.map((task) => (task.assigneeId === memberId ? { ...task, assigneeId: "" } : task))
    );
    write(
      keys.users,
      users.filter((user) => user.id !== memberId)
    );
  },
  async createTask(_workspaceId, payload, actor) {
    const tasks = read(keys.tasks, seedTasks);
    const task = { id: `t${Date.now()}`, comments: [], activity: ["Task created"], ...payload };
    write(keys.tasks, [task, ...tasks]);
    const notifications = read(keys.notifications, []);
    if (payload.assigneeId && payload.assigneeId !== actor?.id) {
      const notice = {
        id: `n${Date.now()}`,
        recipientId: payload.assigneeId,
        actorId: actor?.id,
        taskId: task.id,
        type: "task_assigned",
        title: "New task assigned",
        body: task.title,
        createdAt: new Date().toISOString(),
        readAt: null
      };
      write(keys.notifications, [notice, ...notifications]);
    }
    return task;
  },
  async updateTask(_workspaceId, taskId, patch, actor) {
    const tasks = read(keys.tasks, seedTasks);
    let updatedTask = null;
    const nextTasks = tasks.map((task) => {
      if (task.id !== taskId) return task;
      updatedTask = { ...task, ...patch, activity: ["Task updated", ...(task.activity || [])].slice(0, 8) };
      return updatedTask;
    });
    write(keys.tasks, nextTasks);
    if (patch.assigneeId && patch.assigneeId !== actor?.id) {
      const notifications = read(keys.notifications, []);
      write(keys.notifications, [
        {
          id: `n${Date.now()}`,
          recipientId: patch.assigneeId,
          actorId: actor?.id,
          taskId,
          type: "task_assigned",
          title: "Task assigned to you",
          body: updatedTask?.title,
          createdAt: new Date().toISOString(),
          readAt: null
        },
        ...notifications
      ]);
    }
    return updatedTask;
  },
  async deleteTask(taskId) {
    const tasks = read(keys.tasks, seedTasks);
    write(keys.tasks, tasks.filter((task) => task.id !== taskId));
  },
  async addTaskMessage(_workspaceId, taskId, body, actor) {
    const tasks = read(keys.tasks, seedTasks);
    const message = { id: `c${Date.now()}`, authorId: actor?.id || "u1", text: body, createdAt: new Date().toISOString() };
    write(
      keys.tasks,
      tasks.map((task) =>
        task.id === taskId
          ? { ...task, comments: [...(task.comments || []), message], activity: ["Comment added", ...(task.activity || [])].slice(0, 8) }
          : task
      )
    );
    return message;
  },
  async sendDirectMessage(_workspaceId, recipientId, body, actor) {
    const messages = read(keys.directMessages, []);
    const message = {
      id: `dm${Date.now()}`,
      conversationId: [actor?.id || "u1", recipientId].sort().join("-"),
      authorId: actor?.id || "u1",
      recipientId,
      body,
      createdAt: new Date().toISOString()
    };
    write(keys.directMessages, [...messages, message]);
    return message;
  },
  async markNotificationRead(notificationId) {
    const notifications = read(keys.notifications, []);
    write(
      keys.notifications,
      notifications.map((notice) => (notice.id === notificationId ? { ...notice, readAt: new Date().toISOString() } : notice))
    );
  },
  subscribe() {
    return () => {};
  }
};
