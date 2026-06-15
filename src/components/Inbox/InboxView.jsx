import { Activity, Check, CheckCheck, CircleDashed, Clock3, Filter, Inbox, Settings, UserRound, Waves } from "lucide-react";

const inboxRows = [
  {
    id: "i1",
    title: "Presentation, Every Single details and feature of this Slate truck",
    person: "MI",
    attachment: "ussupplychaincorp.com__page_id=7553&preview=true.png",
    date: "May 26",
    done: false
  },
  {
    id: "i2",
    title: "John - Marksam Website WordPress - add chiense Language",
    person: "FA",
    message: "@Muhammad Adeel Iqbal please update the language of menu of Marksam website now. Just menu items right now",
    date: "May 26",
    done: true
  },
  {
    id: "i3",
    title: "YESMedical - Images for Medical products",
    person: "Faisal Ali",
    message: "assigned this task to you",
    date: "May 23",
    done: false
  }
];

const earlierRows = [
  {
    id: "i4",
    title: "Make Video narration to present this Slate and then enable review",
    person: "Faisal Ali",
    message: "assigned this task to you",
    date: "May 18",
    done: false
  }
];

function InboxRow({ row, highlighted }) {
  return (
    <div className={`inbox-row ${highlighted ? "is-highlighted" : ""}`}>
      <div className="inbox-row-title">
        <span className={row.done ? "inbox-done" : "inbox-pending"}>{row.done ? <Check size={13} /> : <CircleDashed size={18} />}</span>
        <strong>{row.title}</strong>
      </div>
      <div className="inbox-row-message">
        {row.person?.length <= 2 ? <span className="avatar inbox-avatar">{row.person}</span> : <UserRound size={17} />}
        {row.attachment && <span className="attachment-chip">{row.attachment}</span>}
        {row.message && (
          <span>
            {row.person?.length > 2 && <em>{row.person}</em>} <b>{row.message}</b>
          </span>
        )}
      </div>
      <time>{row.date}</time>
      {highlighted && (
        <div className="inbox-hover-actions">
          <button aria-label="Snooze">
            <Clock3 size={17} />
          </button>
          <button aria-label="Clear">
            <Check size={17} />
            Clear
          </button>
        </div>
      )}
    </div>
  );
}

export default function InboxView() {
  return (
    <section className="inbox-workspace">
      <div className="inbox-tabs">
        <button className="active">
          <Inbox size={19} />
          <span>
            Primary
            <small>2 unread</small>
          </span>
        </button>
        <button>
          <Activity size={19} />
          Other
        </button>
        <button>
          <Clock3 size={19} />
          Later
        </button>
        <button>
          <CheckCheck size={19} />
          Cleared
        </button>
      </div>

      <div className="inbox-actions-bar">
        <button className="view-chip">
          <Filter size={16} />
          Filter
        </button>
        <div>
          <button className="search-square" aria-label="Inbox settings">
            <Settings size={18} />
          </button>
          <button className="view-chip">
            <Waves size={16} />
            Clear all
          </button>
        </div>
      </div>

      <div className="inbox-section">
        <h2>Last 7 days</h2>
        <div className="inbox-list-card">
          {inboxRows.map((row) => (
            <InboxRow key={row.id} row={row} />
          ))}
        </div>
      </div>

      <div className="inbox-section">
        <h2>Earlier this month</h2>
        <div className="inbox-list-card soft">
          {earlierRows.map((row) => (
            <InboxRow key={row.id} row={row} highlighted />
          ))}
        </div>
      </div>
    </section>
  );
}
