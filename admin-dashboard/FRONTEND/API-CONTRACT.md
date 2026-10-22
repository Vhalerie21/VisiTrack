# VisiTrack Admin API Contract

This document describes the frontend boundary used by the static Admin Dashboard. Backend teammates should only need to update `js/admin/config.js` and `js/admin/api.js` to connect the live API.

## Conventions

- JSON keys use camelCase.
- Timestamps are ISO 8601 strings in UTC with an offset, for example `2026-09-30T10:24:00+08:00`. The frontend formats them for display.
- List endpoints return `{ "items": [], "page": 1, "limit": 25, "total": 0 }`.
- List endpoints support `?query=&role=&page=&limit=` where applicable.
- Errors return `{ "error": { "code": "ERROR_CODE", "message": "Human-readable message", "fields": { "fieldName": "Validation message" } } }`. `fields` is optional.
- Every entity has a stable string `id`. This is separate from `employeeId`, `referenceNo`, and slot `code`.
- Personnel update and delete use the stable personnel `id`.

## Session

### GET `/api/admin/session`

Returns the current signed-in user.

Example success:

```json
{ "id": "p-1", "displayName": "J. Robles", "role": "admin" }
```

### POST `/api/admin/session/sign-out`

Ends the current cookie session.

Example request: no body.

Example success:

```json
{ "ok": true }
```

## Dashboard

### GET `/api/admin/dashboard/stats`

Example success:

```json
{ "liveOnCampus": 42, "uncollectedIds": 3, "totalVisitors": 187 }
```

### GET `/api/admin/dashboard/peak-hours`

Example success:

```json
{ "items": [{ "hour": "7", "count": 6 }, { "hour": "14", "count": 34 }] }
```

### GET `/api/admin/dashboard/overdue-ids`

Example success:

```json
{ "items": [{ "id": "overdue-1", "visitor": "D. Santos", "slot": "B-12", "timeIn": "2026-09-30T09:14:00+08:00", "status": "overdue" }], "page": 1, "limit": 25, "total": 1 }
```

### GET `/api/admin/dashboard/recent-transactions`

Example success:

```json
{ "items": [{ "id": "txn-1", "referenceNo": "REF-90231", "visitor": "J. Dela Cruz", "slot": "A-02", "timeIn": "2026-09-30T08:41:00+08:00", "timeOut": "2026-09-30T09:55:00+08:00", "handledBy": "Guard Ramos" }], "page": 1, "limit": 25, "total": 1 }
```

## Visitor logs

### GET `/api/admin/visitor-logs`

Query parameters: `query`, `page`, `limit`. Search covers reference number, visitor, slot, and handler.

Example request: `GET /api/admin/visitor-logs?query=REF-90231&page=1&limit=25`

Example success:

```json
{ "items": [{ "id": "visit-1", "referenceNo": "REF-90231", "visitor": "J. Dela Cruz", "slot": "A-02", "timeIn": "2026-09-30T08:41:00+08:00", "timeOut": "2026-09-30T09:55:00+08:00", "handledBy": "Guard Ramos" }], "page": 1, "limit": 25, "total": 1 }
```

## Storage slots

### GET `/api/admin/slots`

Example success:

```json
{ "items": [{ "id": "slot-1", "code": "A-01", "status": "vacant", "visitor": null, "referenceNo": null, "timeIn": null }], "page": 1, "limit": 25, "total": 1 }
```

### GET `/api/admin/slots/detail`

Query parameters: `slotId` (stable slot id or slot code).

Example request: `GET /api/admin/slots/detail?slotId=slot-1`

Example success:

```json
{ "id": "slot-1", "code": "A-01", "status": "occupied", "visitor": "M. Reyes", "referenceNo": "REF-90240", "timeIn": "2026-09-30T11:20:00+08:00" }
```

### POST `/api/admin/slots/override`

Request body:

```json
{ "slotId": "slot-1", "action": "release", "reason": "Emergency", "note": "Gate equipment issue" }
```

Example success:

```json
{ "ok": true }
```

The backend writes the audit entry and applies the resulting slot state.

## Reports

### GET `/api/admin/reports/visitors`

Query parameters: `range` (`today`, `yesterday`, `last-7-days`, or `this-month`).

Example request: `GET /api/admin/reports/visitors?range=today`

Example success:

```json
{ "totalVisitors": 187, "liveOnCampus": 42, "uncollectedIds": 3, "peakHours": [{ "hour": "7", "count": 6 }], "offices": [{ "name": "Registrar's Office", "visits": 62 }] }
```

### POST `/api/admin/reports/export`

Request body:

```json
{ "range": "today", "format": "csv" }
```

Example success:

```json
{ "ok": true, "downloadUrl": "/api/admin/reports/download/report-1" }
```

## Audit trail

### GET `/api/admin/audit-trail`

Query parameters: `query`, `role`, `page`, `limit`.

Example request: `GET /api/admin/audit-trail?query=overdue&role=system&page=1&limit=25`

Example success:

```json
{ "items": [{ "id": "audit-1", "when": "2026-09-30T10:24:00+08:00", "user": "J. Robles", "role": "admin", "action": "Viewed report", "details": "Weekly visitor summary" }], "page": 1, "limit": 25, "total": 1 }
```

## Personnel accounts

### GET `/api/admin/personnel`

Query parameters: `query`, `role`, `page`, `limit`.

Example request: `GET /api/admin/personnel?query=Ramos&role=guard&page=1&limit=25`

Example success:

```json
{ "items": [{ "id": "p-2", "name": "Guard Ramos", "employeeId": "SEC-014", "email": "guard.ramos@example.edu", "role": "guard", "status": "active", "lastLogin": "2026-09-30T07:58:00+08:00" }], "page": 1, "limit": 25, "total": 1 }
```

### POST `/api/admin/personnel`

Request body:

```json
{ "name": "Guard Ramos", "employeeId": "SEC-014", "email": "guard.ramos@example.edu", "role": "guard", "status": "active" }
```

Example success: same personnel shape as the created account, including stable `id`.

### PATCH `/api/admin/personnel/:id`

Request body: the editable personnel fields, including stable `id` when sent by the frontend.

Example request: `PATCH /api/admin/personnel/p-2`

Example success: the updated personnel object.

### DELETE `/api/admin/personnel/:id`

Example request: `DELETE /api/admin/personnel/p-2`

Example success:

```json
{ "ok": true }
```

### POST `/api/admin/personnel/:id/reset-password`

Example request: `POST /api/admin/personnel/p-2/reset-password` with no body.

Example success:

```json
{ "ok": true }
```

Password delivery/reset is owned by the backend. The Add Account form intentionally has no password field.

## Settings

### GET `/api/admin/settings`

Example success:

```json
{ "displayName": "J. Robles", "overdueHours": 4, "retention": "1 year", "alertOverdue": true, "dailySummary": true, "alertSlots": false }
```

### PATCH `/api/admin/settings`

Request body:

```json
{ "displayName": "J. Robles", "overdueHours": 4, "retention": "1 year", "alertOverdue": true, "dailySummary": true, "alertSlots": false }
```

Example success: the saved settings object.

## Enumerations

Defined in `js/admin/constants.js`:

- Slot status: `vacant`, `occupied`, `overdue`, `bypassed`
- ID status: `collected`, `uncollected`, `overdue`, `flagged`
- Roles: `admin`, `guard`, `system`
- Account status: `active`, `disabled`
- Override actions: `release`, `reassign`, `bypass`
- Override reasons: `Slot malfunction`, `Visitor mix-up`, `Guard error`, `Emergency`, `Other`

## Common errors

- `401`: session expired; frontend clears the session and redirects to `login-placeholder.html`.
- `403`: authenticated user lacks permission.
- `422`: validation error; return `error.fields` for inline field messages.
- `500`/`503` or network failure: frontend shows a retryable error state.

## Server responsibilities

- Calculate overdue status using the Settings threshold.
- Write audit trail entries for every override, settings change, login, and personnel change. The frontend does not write audit entries.
- Reject deletion of the caller's own account and enforce admin-only access.
- Create and deliver passwords/reset links. The Add Account form has no password field; confirm the delivery workflow.
- Enforce data retention from Settings.
- Enforce authentication and authorization on every endpoint. The frontend route guard is UX only.

## Open questions for backend/other frontend teammates

- What statuses and reference-number format (`REF-#####`) are shared with the visitor and desk-staff pages?
- What authentication method will be used: cookie session, bearer token, or both?
- Does `Security Guard` correspond to `desk staff` in the other frontend?
- What should happen when a slot is bypassed? This status is included by frontend assumption because it was not shown in the mockup.
- How should report exports be downloaded and authenticated?
- Should `downloadUrl` be temporary, and should exports be generated synchronously or asynchronously?
