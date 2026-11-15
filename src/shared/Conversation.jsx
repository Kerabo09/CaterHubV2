import { sb } from './supabase';
import { when } from './lib';
// One chat made from the chat messages and from the replies written with status updates
export function buildThread({ ms, h, meId, selfRole, otherName }) {
  const rows = [
    ...ms.map((x) => ({ key: 'm' + x.message_id, at: x.created_at, mine: x.sender_role === selfRole, text: x.message })),
    ...h
      .filter((x) => x.previous_status && x.message)
      .map((x) => ({ key: 'h' + (x.history_id || x.created_at), at: x.created_at, mine: x.changed_by === meId, text: x.message, status: x.status })),
  ];
  return rows.sort((a, b) => new Date(a.at) - new Date(b.at)).map((r) => ({ ...r, who: r.mine ? 'You' : otherName }));
}
export function Conversation({ title, thread, empty, onSend, placeholder, canSend = true, top = 22 }) {
  return (
    <div className="card" style={top ? { marginTop: top } : undefined}>
      <h3 className="h3" style={{ marginBottom: 12 }}>
        {title}
      </h3>
      {thread.length === 0 ? (
        <p className="mut small">{empty}</p>
      ) : (
        <div className="chat">
          {thread.map((x) => (
            <div className={'bub' + (x.mine ? ' me' : '')} key={x.key}>
              <span className="who">
                {x.who} · {when(x.at)}
              </span>
              {x.status && <span className="st">{x.status}</span>}
              <p>{x.text}</p>
            </div>
          ))}
        </div>
      )}
      {canSend && (
        <form onSubmit={onSend}>
          <textarea name="message" rows="3" maxLength={1000} placeholder={placeholder} />
          <button className="btn sm" style={{ marginTop: 12 }}>
            Send message
          </button>
        </form>
      )}
    </div>
  );
}
// refs of inquiries that have unread notifications for this user
export async function unreadRefs(uid) {
  const r = await sb.from('notifications').select('message').eq('user_id', uid).eq('is_read', false);
  if (r.error) return new Set();
  return new Set(r.data.flatMap((n) => n.message.match(/INQ-\d+/g) || []));
}
// opening an inquiry marks its notifications as read
export async function markInquiryRead(uid, ref) {
  const r = await sb.from('notifications').select('notification_id,message').eq('user_id', uid).eq('is_read', false);
  if (r.error) return;
  const ids = r.data.filter((n) => (n.message.match(/INQ-\d+/g) || []).includes(ref)).map((n) => n.notification_id);
  if (!ids.length) return;
  await sb.from('notifications').update({ is_read: true }).in('notification_id', ids).eq('user_id', uid);
  window.dispatchEvent(new Event('caterhub:notes'));
}
