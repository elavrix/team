export const users = [
  { id: "u1", name: "Amir Sharif", role: "Founder", initials: "AS" },
  { id: "u2", name: "Faisal Ali", role: "Project Manager", initials: "FA" },
  { id: "u3", name: "Sarah Khan", role: "Product Designer", initials: "SK" },
  { id: "u4", name: "Ali Raza", role: "Frontend Engineer", initials: "AR" },
  { id: "u5", name: "Hassan Malik", role: "Growth Lead", initials: "HM" }
];

export const projects = [
  { id: "p1", name: "Website Redesign", color: "#7B68EE" },
  { id: "p2", name: "Marketing", color: "#F59E0B" },
  { id: "p3", name: "Development", color: "#2563EB" },
  { id: "p4", name: "Client Work", color: "#22C55E" },
  { id: "p5", name: "Internal Tasks", color: "#64748B" }
];

export const tasks = [
  {
    id: "t1",
    title: "Finalize new homepage wireframes",
    description: "Prepare polished desktop and mobile wireframes for stakeholder review.",
    assigneeId: "u3",
    projectId: "p1",
    status: "Review",
    priority: "High",
    dueDate: "2026-05-30",
    comments: [
      { id: "c1", authorId: "u2", text: "Please include the pricing CTA state before review.", createdAt: "2026-05-26T10:00:00.000Z" }
    ],
    activity: ["Sarah moved the task to Review", "Faisal added a comment"]
  },
  {
    id: "t2",
    title: "Launch email nurture sequence",
    description: "Create a five-email onboarding sequence for new trial users.",
    assigneeId: "u5",
    projectId: "p2",
    status: "In Progress",
    priority: "Normal",
    dueDate: "2026-06-02",
    comments: [],
    activity: ["Hassan started copywriting"]
  },
  {
    id: "t3",
    title: "Implement workspace settings",
    description: "Build editable profile, billing placeholder, and member controls.",
    assigneeId: "u4",
    projectId: "p3",
    status: "To Do",
    priority: "Urgent",
    dueDate: "2026-05-28",
    comments: [],
    activity: ["Amir created the task"]
  },
  {
    id: "t4",
    title: "Prepare client Q2 roadmap",
    description: "Collect open scope items and convert them into a clear roadmap deck.",
    assigneeId: "u2",
    projectId: "p4",
    status: "Completed",
    priority: "High",
    dueDate: "2026-05-24",
    comments: [],
    activity: ["Faisal completed the task"]
  },
  {
    id: "t5",
    title: "Clean internal knowledge base",
    description: "Archive stale docs and update the agency delivery checklist.",
    assigneeId: "u1",
    projectId: "p5",
    status: "In Progress",
    priority: "Low",
    dueDate: "2026-06-06",
    comments: [],
    activity: ["Amir updated the description"]
  },
  {
    id: "t6",
    title: "QA responsive task table",
    description: "Verify task list behavior on mobile, tablet, and desktop breakpoints.",
    assigneeId: "u4",
    projectId: "p3",
    status: "To Do",
    priority: "Normal",
    dueDate: "2026-06-01",
    comments: [],
    activity: ["Ali was assigned"]
  }
];

export const activities = [
  "Sarah submitted homepage wireframes for review",
  "Ali was assigned workspace settings",
  "Hassan updated marketing sequence priority",
  "Faisal completed Q2 roadmap planning"
];

export const statuses = ["To Do", "In Progress", "Review", "Completed"];
export const priorities = ["Urgent", "High", "Normal", "Low"];
