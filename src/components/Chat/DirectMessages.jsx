import { Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export default function DirectMessages({ currentMember, users, messages, onSendMessage }) {
  const teammates = users.filter((user) => user.id !== currentMember?.id);
  const [selectedId, setSelectedId] = useState(teammates[0]?.id || "");

  useEffect(() => {
    if (!selectedId && teammates[0]?.id) setSelectedId(teammates[0].id);
  }, [selectedId, teammates]);
  const [draft, setDraft] = useState("");
  const selectedMember = users.find((user) => user.id === selectedId) || teammates[0];
  const thread = useMemo(
    () =>
      messages
        .filter((message) => {
          const participants = [message.authorId, message.recipientId];
          return participants.includes(currentMember?.id) && participants.includes(selectedMember?.id);
        })
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
    [messages, currentMember?.id, selectedMember?.id]
  );

  const submit = (event) => {
    event.preventDefault();
    if (!draft.trim() || !selectedMember) return;
    onSendMessage(selectedMember.id, draft.trim());
    setDraft("");
  };

  return (
    <section className="panel direct-message-panel">
      <div className="panel-header compact-panel-header">
        <div>
          <span className="eyebrow">Team chat</span>
          <h2>Direct Messages</h2>
        </div>
      </div>
      <div className="dm-workspace">
        <div className="dm-roster">
          {teammates.map((user) => (
            <button key={user.id} className={selectedMember?.id === user.id ? "active" : ""} onClick={() => setSelectedId(user.id)}>
              <span className="avatar small">{user.initials}</span>
              <span>{user.name}</span>
            </button>
          ))}
        </div>
        <div className="dm-thread">
          <div className="dm-thread-list">
            {thread.length === 0 && <p className="empty-note">Start the conversation.</p>}
            {thread.map((message) => {
              const mine = message.authorId === currentMember?.id;
              return (
                <div key={message.id} className={`dm-bubble ${mine ? "mine" : ""}`}>
                  <p>{message.body}</p>
                </div>
              );
            })}
          </div>
          <form className="dm-form" onSubmit={submit}>
            <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={`Message ${selectedMember?.name || "team"}`} />
            <button className="button primary" type="submit" aria-label="Send message">
              <Send size={15} />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
