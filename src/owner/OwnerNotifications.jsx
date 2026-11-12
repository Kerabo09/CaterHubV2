import { NotesBody } from '../shared/NotificationsList';
export function OwnerNotes() {
  return (
    <>
      <h1>Notifications</h1>
      <p className="sub">New inquiries and status updates for your business.</p>
      <div style={{ marginTop: 26 }}>
        <NotesBody owner />
      </div>
      <p className="tiny mut" style={{ marginTop: 16 }}>
        These notifications belong only to your business. Customer contact information stays inside your authorized workspace.
      </p>
    </>
  );
}
