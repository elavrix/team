export default function TeamPanel({ users, tasks }) {
  return (
    <section className="team-panel panel full">
      <div className="panel-header">
        <div>
          <span className="eyebrow">Members</span>
          <h2>Team workload</h2>
        </div>
      </div>
      <div className="team-grid">
        {users.map((user) => {
          const assigned = tasks.filter((task) => task.assigneeId === user.id);
          const active = assigned.filter((task) => task.status !== "Completed").length;
          return (
            <article className="team-card" key={user.id}>
              <span className="avatar large">{user.initials}</span>
              <div>
                <h3>{user.name}</h3>
                <p>{user.role}</p>
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
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
