/* Purpose: shared API enums. Pages using it: api.js and all admin pages. API stubs: all. */
window.VisiTrackConstants =  {
  slotStatus: ["vacant", "occupied", "overdue", "bypassed"],
  idStatus: ["collected", "uncollected", "overdue", "flagged"],
  roles: ["admin", "guard", "system"],
  accountStatus: ["active", "disabled"],
  overrideActions: ["release", "reassign", "bypass"],
  overrideReasons: ["Slot malfunction", "Visitor mix-up", "Guard error", "Emergency", "Other"]
};
