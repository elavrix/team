import { MailPlus, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";

const roleOptions = [
  { value: "owner", label: "Owner" },
  { value: "admin", label: "Admin" },
  { value: "member", label: "Member" }
];

const positionOptions = ["Founder", "Project Manager", "Product Designer", "Frontend Engineer", "Growth Lead", "QA Engineer", "Team Member"];

const initialInvite = {
  name: "",
  email: "",
  role: "member",
  position: "Team Member"
};

export default function TeamPanel({ users, tasks, currentMember, onCreateMember, onUpdateMember, onDeleteMember }) {
  const [invite, setInvite] = useState(initialInvite);
  const [showInvite, setShowInvite] = useState(false);

  const updateInvite = (field, value) => setInvite((current) => ({ ...current, [field]: value }));

  const submitInvite = (event) => {
    event.preventDefault();
    if (!invite.name.trim() || !invite.email.trim()) return;
    onCreateMember(invite);
    setInvite(initialInvite);
    setShowInvite(false);
  };

  return (
    <section className="team-panel panel full">
      <div className="panel-header">
        <div>
          <span className="eyebrow">Members</span>
          <h2>Team management</h2>
        </div>
        <button className="button primary" onClick={() => setShowInvite((current) => !current)}>
          <UserPlus size={15} />
          Add Member
        </button>
      </div>

      {showInvite && (
        <form className="team-invite-form" onSubmit={submitInvite}>
          <label>
            Name
            <input value={invite.name} onChange={(event) => updateInvite("name", event.target.value)} placeholder="Team member name" />
          </label>
          <label>
            Email
            <input type="email" value={invite.email} onChange={(event) => updateInvite("email", event.target.value)} placeholder="member@company.com" />
          </label>
          <label>
            Role
            <select value={invite.role} onChange={(event) => updateInvite("role", event.target.value)}>
              {roleOptions.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Position
            <select value={invite.position} onChange={(event) => updateInvite("position", event.target.value)}>
              {positionOptions.map((position) => (
                <option key={position}>{position}</option>
              ))}
            </select>
          </label>
          <button className="button primary" type="submit">
            <MailPlus size={15} />
            Invite
          </button>
        </form>
      )}

      <div className="team-grid">
        {users.map((user) => {
          const assigned = tasks.filter((task) => task.assigneeId === user.id);
          const active = assigned.filter((task) => task.status !== "Completed").length;
          const completed = assigned.length - active;
          const isCurrentMember = user.id === currentMember?.id;
          return (
            <article className="team-card" key={user.id}>
              <div className="team-card-head">
                <span className="avatar large">{user.initials}</span>
                <div>
                  <h3>{user.name}</h3>
                  <p>{user.email || "Pending invite"}</p>
                </div>
              </div>

              <div className="member-controls">
                <label>
                  Role
                  <select value={user.role || "member"} onChange={(event) => onUpdateMember(user.id, { role: event.target.value })} disabled={isCurrentMember}>
                    {roleOptions.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Position
                  <select value={user.position || user.role || "Team Member"} onChange={(event) => onUpdateMember(user.id, { position: event.target.value })}>
                    {positionOptions.map((position) => (
                      <option key={position}>{position}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="member-stats">
                <span>
                  <b>{assigned.length}</b>
                  Assigned
                </span>
                <span>
                  <b>{active}</b>
                  Active
                </span>
                <span>
                  <b>{completed}</b>
                  Done
                </span>
              </div>

              <div className="team-card-actions">
                <span>{isCurrentMember ? "Current member" : user.userId ? "Active" : "Pending invite"}</span>
                <button className="icon-button danger" onClick={() => onDeleteMember(user.id)} disabled={isCurrentMember} aria-label={`Remove ${user.name}`}>
                  <Trash2 size={15} />
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

