export const TABS = [
  ['', 'Overview'],
  ['inq', 'Inquiries'],
  ['av', 'Availability'],
  ['pk', 'Packages'],
  ['pf', 'Business profile'],
  ['nt', 'Notifications'],
];
export const STATUSES = ['Pending', 'Replied', 'Available', 'Unavailable', 'Confirmed Outside System', 'Cancelled'];
// the statuses an owner can move an inquiry to
export const OWNER_STATUSES = STATUSES.slice(1);
