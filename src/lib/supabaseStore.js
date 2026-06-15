import { supabase } from "./supabaseClient.js";

const DEFAULT_WORKSPACE = "Flowdesk";

function initialsFor(nameOrEmail) {
  return nameOrEmail
    .split(/[.\s@_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function toUser(member) {
  return {
    id: member.id,
    userId: member.user_id,
    email: member.email,
    name: member.name,
    role: member.role,
    position: member.position || member.role,
    initials: member.initials
  };
}

function toTask(row, assignees = [], messages = []) {
  const firstAssignee = assignees.find((item) => item.task_id === row.id);
  return {
    id: row.id,
    title: row.title,
    description: row.description || "",
    assigneeId: firstAssignee?.member_id || "",
    projectId: row.project_id || "",
    status: row.status,
    priority: row.priority,
    dueDate: row.due_date || "",
    comments: messages
      .filter((item) => item.task_id === row.id)
      .map((item) => ({ id: item.id, authorId: item.author_id, text: item.body, createdAt: item.created_at })),
    activity: [`Updated ${new Date(row.updated_at || row.created_at).toLocaleDateString()}`]
  };
}

function toProject(row) {
  return { id: row.id, name: row.name, color: row.color };
}

function toNotification(row) {
  return {
    id: row.id,
    recipientId: row.recipient_id,
    actorId: row.actor_id,
    taskId: row.task_id,
    type: row.type,
    title: row.title,
    body: row.body,
    readAt: row.read_at,
    createdAt: row.created_at
  };
}

function toDirectMessage(row, recipientId = "") {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    authorId: row.author_id,
    recipientId,
    body: row.body,
    createdAt: row.created_at
  };
}

async function ensureWorkspace(user) {
  const { data: existingMember, error: memberError } = await supabase
    .from("members")
    .select("*, workspaces(*)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (memberError) throw memberError;
  if (existingMember?.workspaces) {
    return { workspace: existingMember.workspaces, member: existingMember };
  }

  const { data: workspace, error: workspaceError } = await supabase
    .from("workspaces")
    .insert({ name: DEFAULT_WORKSPACE, created_by: user.id })
    .select()
    .single();

  if (workspaceError) throw workspaceError;

  const name = user.user_metadata?.name || user.email?.split("@")[0] || "Team Member";
  const { data: member, error: createMemberError } = await supabase
    .from("members")
    .insert({
      workspace_id: workspace.id,
      user_id: user.id,
      email: user.email,
      name,
      initials: initialsFor(name || user.email),
      role: "owner",
      position: "Workspace Owner"
    })
    .select()
    .single();

  if (createMemberError) throw createMemberError;
  return { workspace, member };
}

export const supabaseStore = {
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (!data.session?.user) return null;
    const { member } = await ensureWorkspace(data.session.user);
    return { user: data.session.user, member: toUser(member) };
  },
  async requestOtp(email, metadata = {}) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true, data: metadata }
    });
    if (error) throw error;
    return { needsCode: true };
  },
  async verifyOtp(email, token) {
    const { data, error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
    if (error) throw error;
    const { member } = await ensureWorkspace(data.user);
    return { user: data.user, member: toUser(member) };
  },
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
  async loadWorkspace() {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    const user = sessionData.session?.user;
    if (!user) throw new Error("Not authenticated");

    const { workspace, member } = await ensureWorkspace(user);
    const [membersResult, projectsResult, tasksResult, assigneesResult, messagesResult, notificationsResult, conversationMembersResult, directMessagesResult] =
      await Promise.all([
        supabase.from("members").select("*").eq("workspace_id", workspace.id).order("created_at"),
        supabase.from("projects").select("*").eq("workspace_id", workspace.id).order("created_at"),
        supabase.from("tasks").select("*").eq("workspace_id", workspace.id).order("created_at", { ascending: false }),
        supabase.from("task_assignees").select("*"),
        supabase.from("task_messages").select("*").order("created_at"),
        supabase.from("notifications").select("*").eq("recipient_id", member.id).order("created_at", { ascending: false }),
        supabase.from("conversation_members").select("conversation_id, member_id"),
        supabase.from("direct_messages").select("*").order("created_at")
      ]);

    for (const result of [
      membersResult,
      projectsResult,
      tasksResult,
      assigneesResult,
      messagesResult,
      notificationsResult,
      conversationMembersResult,
      directMessagesResult
    ]) {
      if (result.error) throw result.error;
    }

    const conversationMembers = conversationMembersResult.data || [];
    const directMessages = (directMessagesResult.data || []).map((message) => {
      const recipient = conversationMembers.find(
        (item) => item.conversation_id === message.conversation_id && item.member_id !== message.author_id
      );
      return toDirectMessage(message, recipient?.member_id || "");
    });

    return {
      workspace: { id: workspace.id, name: workspace.name },
      currentMember: toUser(member),
      users: membersResult.data.map(toUser),
      projects: projectsResult.data.map(toProject),
      tasks: tasksResult.data.map((task) => toTask(task, assigneesResult.data, messagesResult.data)),
      notifications: notificationsResult.data.map(toNotification),
      directMessages
    };
  },
  async renameWorkspace(workspaceId, name) {
    const { data, error } = await supabase.from("workspaces").update({ name }).eq("id", workspaceId).select().single();
    if (error) throw error;
    return { id: data.id, name: data.name };
  },
  async createProject(workspaceId, name) {
    const colors = ["#7B68EE", "#F59E0B", "#2563EB", "#22C55E", "#EF4444"];
    const { count } = await supabase.from("projects").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId);
    const { data, error } = await supabase
      .from("projects")
      .insert({ workspace_id: workspaceId, name, color: colors[(count || 0) % colors.length] })
      .select()
      .single();
    if (error) throw error;
    return toProject(data);
  },
  async createMember(workspaceId, payload) {
    const name = payload.name.trim();
    const email = payload.email.trim().toLowerCase();
    const { data, error } = await supabase
      .from("members")
      .insert({
        workspace_id: workspaceId,
        user_id: payload.userId || null,
        email,
        name,
        initials: initialsFor(name || email),
        role: payload.role || "member",
        position: payload.position || "Team Member"
      })
      .select()
      .single();
    if (error) throw error;
    return toUser(data);
  },
  async updateMember(memberId, patch) {
    const memberPatch = {};
    if ("role" in patch) memberPatch.role = patch.role;
    if ("position" in patch) memberPatch.position = patch.position;
    if ("name" in patch) {
      memberPatch.name = patch.name;
      memberPatch.initials = initialsFor(patch.name);
    }
    const { data, error } = await supabase.from("members").update(memberPatch).eq("id", memberId).select().single();
    if (error) throw error;
    return toUser(data);
  },
  async deleteMember(memberId) {
    const { error: assigneeError } = await supabase.from("task_assignees").delete().eq("member_id", memberId);
    if (assigneeError) throw assigneeError;
    const { error } = await supabase.from("members").delete().eq("id", memberId);
    if (error) throw error;
  },
  async createTask(workspaceId, payload, actor) {
    const { data: task, error } = await supabase
      .from("tasks")
      .insert({
        workspace_id: workspaceId,
        project_id: payload.projectId || null,
        title: payload.title,
        description: payload.description,
        status: payload.status,
        priority: payload.priority,
        due_date: payload.dueDate || null,
        created_by: actor?.userId || actor?.user_id || null
      })
      .select()
      .single();
    if (error) throw error;

    if (payload.assigneeId) {
      await supabase.from("task_assignees").insert({ task_id: task.id, member_id: payload.assigneeId });
    }
    if (payload.assigneeId && payload.assigneeId !== actor?.id) {
      await supabase.from("notifications").insert({
        workspace_id: workspaceId,
        recipient_id: payload.assigneeId,
        actor_id: actor?.id,
        task_id: task.id,
        type: "task_assigned",
        title: "New task assigned",
        body: task.title
      });
    }
    return toTask(task, [{ task_id: task.id, member_id: payload.assigneeId }], []);
  },
  async updateTask(workspaceId, taskId, patch, actor) {
    const taskPatch = {};
    if ("title" in patch) taskPatch.title = patch.title;
    if ("description" in patch) taskPatch.description = patch.description;
    if ("status" in patch) taskPatch.status = patch.status;
    if ("priority" in patch) taskPatch.priority = patch.priority;
    if ("dueDate" in patch) taskPatch.due_date = patch.dueDate || null;
    if ("projectId" in patch) taskPatch.project_id = patch.projectId || null;

    let task;
    if (Object.keys(taskPatch).length) {
      const { data, error } = await supabase.from("tasks").update(taskPatch).eq("id", taskId).select().single();
      if (error) throw error;
      task = data;
    }

    if ("assigneeId" in patch) {
      await supabase.from("task_assignees").delete().eq("task_id", taskId);
      if (patch.assigneeId) {
        await supabase.from("task_assignees").insert({ task_id: taskId, member_id: patch.assigneeId });
        if (patch.assigneeId !== actor?.id) {
          await supabase.from("notifications").insert({
            workspace_id: workspaceId,
            recipient_id: patch.assigneeId,
            actor_id: actor?.id,
            task_id: taskId,
            type: "task_assigned",
            title: "Task assigned to you",
            body: task?.title || "A task was assigned to you"
          });
        }
      }
    }
    return task ? toTask(task, [{ task_id: taskId, member_id: patch.assigneeId }], []) : null;
  },
  async deleteTask(taskId) {
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);
    if (error) throw error;
  },
  async addTaskMessage(workspaceId, taskId, body, actor) {
    const { data, error } = await supabase
      .from("task_messages")
      .insert({ task_id: taskId, author_id: actor.id, body })
      .select()
      .single();
    if (error) throw error;

    const { data: task } = await supabase.from("tasks").select("title").eq("id", taskId).single();
    const { data: assignees } = await supabase.from("task_assignees").select("member_id").eq("task_id", taskId);
    const recipients = [...new Set((assignees || []).map((item) => item.member_id).filter((id) => id !== actor.id))];
    if (recipients.length) {
      await supabase.from("notifications").insert(
        recipients.map((recipientId) => ({
          workspace_id: workspaceId,
          recipient_id: recipientId,
          actor_id: actor.id,
          task_id: taskId,
          type: "task_comment",
          title: "New task comment",
          body: task?.title || body
        }))
      );
    }
    return { id: data.id, authorId: data.author_id, text: data.body, createdAt: data.created_at };
  },
  async sendDirectMessage(workspaceId, recipientId, body, actor) {
    const { data: membership } = await supabase
      .from("conversation_members")
      .select("conversation_id")
      .in("member_id", [actor.id, recipientId]);

    const grouped = (membership || []).reduce((acc, item) => {
      acc[item.conversation_id] = (acc[item.conversation_id] || 0) + 1;
      return acc;
    }, {});
    let conversationId = Object.keys(grouped).find((id) => grouped[id] === 2);

    if (!conversationId) {
      const { data: conversation, error: conversationError } = await supabase
        .from("conversations")
        .insert({ workspace_id: workspaceId })
        .select()
        .single();
      if (conversationError) throw conversationError;
      conversationId = conversation.id;
      const { error: membersError } = await supabase
        .from("conversation_members")
        .insert([
          { conversation_id: conversationId, member_id: actor.id },
          { conversation_id: conversationId, member_id: recipientId }
        ]);
      if (membersError) throw membersError;
    }

    const { data, error } = await supabase
      .from("direct_messages")
      .insert({ conversation_id: conversationId, author_id: actor.id, body })
      .select()
      .single();
    if (error) throw error;
    return toDirectMessage(data, recipientId);
  },
  async markNotificationRead(notificationId) {
    const { error } = await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", notificationId);
    if (error) throw error;
  },
  subscribe(workspaceId, memberId, onChange) {
    const channel = supabase
      .channel(`workspace-${workspaceId}-${memberId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks", filter: `workspace_id=eq.${workspaceId}` }, onChange)
      .on("postgres_changes", { event: "*", schema: "public", table: "task_assignees" }, onChange)
      .on("postgres_changes", { event: "*", schema: "public", table: "task_messages" }, onChange)
      .on("postgres_changes", { event: "*", schema: "public", table: "direct_messages" }, onChange)
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `recipient_id=eq.${memberId}` }, onChange)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }
};
