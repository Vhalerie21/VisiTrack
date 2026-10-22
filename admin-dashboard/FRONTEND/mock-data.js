/* Purpose: deterministic mock data only. Pages use it through api.js, never directly. API stubs: all. */
(function ()  {
  const iso = (time) => `2026-09-30T${time}:00+08:00`;
  window.VisiTrackMock =  {
    currentUser:  {
      id: "user-admin-001", displayName: "J. Robles", employeeId: "ADM-001", role: "admin"
    }    ,
    dashboardStats:  {
      liveOnCampus: 42, uncollectedIds: 3, totalVisitors: 187
    }    ,
    peakHours: [6, 10, 18, 27, 22, 14, 24, 34, 20, 12].map((count, i) => ( {
      hour: i + 7, count
    }    )),
    overdueIds: [ {
      id: "overdue-1", visitor: "D. Santos", slot: "B-12", timeIn: iso("09:14"), status: "overdue"
    }    ,  {
      id: "overdue-2", visitor: "R. Cruz", slot: "A-05", timeIn: iso("10:02"), status: "overdue"
    }    ,  {
      id: "overdue-3", visitor: "M. Reyes", slot: "C-03", timeIn: iso("11:20"), status: "flagged"
    }    ],
    recentTransactions: [ {
      id: "tx-1", referenceNo: "REF-90231", visitor: "J. Dela Cruz", slot: "A-02", timeIn: iso("08:41"), timeOut: iso("09:55"), handledBy: "Guard Ramos"
    }    ,  {
      id: "tx-2", referenceNo: "REF-90244", visitor: "A. Comeros", slot: "B-07", timeIn: iso("09:03"), timeOut: null, handledBy: "Guard Ramos"
    }    ,  {
      id: "tx-3", referenceNo: "REF-90251", visitor: "V. Estrera", slot: "C-11", timeIn: iso("09:10"), timeOut: iso("10:20"), handledBy: "Guard Tan"
    }    ],
    visitorLogs: [ {
      id: "v-1", referenceNo: "REF-90231", visitor: "J. Dela Cruz", slot: "A-02", timeIn: iso("08:41"), timeOut: iso("09:55"), handledBy: "Guard Ramos"
    }    ,  {
      id: "v-2", referenceNo: "REF-90244", visitor: "A. Comeros", slot: "B-07", timeIn: iso("09:03"), timeOut: null, handledBy: "Guard Ramos"
    }    ,  {
      id: "v-3", referenceNo: "REF-90251", visitor: "V. Estrera", slot: "C-11", timeIn: iso("09:10"), timeOut: iso("10:20"), handledBy: "Guard Tan"
    }    ],
    slots: ["A","B","C"].flatMap(row => Array.from( {
      length: 12
    }    , (_, i) =>  {
      const code = `${row}-${String(i + 1).padStart(2, "0")}`;
      const status = ["A-01","B-02","B-07","C-06"].includes(code) ? "occupied" : ["A-05","B-12","C-03"].includes(code) ? "overdue" : "vacant";
      return  {
        id: `slot-${code}`, code, status, visitor: code === "C-03" ? "M. Reyes" : null, referenceNo: code === "C-03" ? "REF-90240" : null
      }      ;
    }    )),
    reports:  {
      offices: [ {
        name: "Registrar's Office", visits: 62
      }      ,  {
        name: "College of CS", visits: 41
      }      ,  {
        name: "Admissions", visits: 33
      }      ,  {
        name: "Accounting", visits: 28
      }      ,  {
        name: "Library", visits: 23
      }      ]
    }    ,
    auditTrail: [
      { id: "a-1", when: iso("10:24"), user: "J. Robles", role: "admin", action: "Viewed report", details: "Weekly visitor summary" },
      { id: "a-2", when: iso("10:02"), user: "Guard Ramos", role: "guard", action: "Accepted time-in", details: "REF-90262 · slot A-05" },
      { id: "a-3", when: iso("09:55"), user: "Guard Ramos", role: "guard", action: "Recorded time-out", details: "REF-90231 · slot A-02" },
      { id: "a-4", when: iso("09:14"), user: "Guard Tan", role: "guard", action: "Accepted time-in", details: "REF-90258 · slot B-12" },
      { id: "a-5", when: iso("09:10"), user: "System", role: "system", action: "Marked ID overdue", details: "D. Santos · slot B-12" },
      { id: "a-6", when: iso("08:52"), user: "Guard Ramos", role: "guard", action: "Rejected time-in", details: "REF-90236" },
      { id: "a-7", when: iso("08:31"), user: "J. Robles", role: "admin", action: "Changed setting", details: "Overdue threshold: 4 hours" },
      { id: "a-8", when: iso("08:05"), user: "J. Robles", role: "admin", action: "Logged in", details: "Admin dashboard" },
    ],
personnel: [ {
      id: "p-1", name: "J. Robles", email: "j.robles@plm.edu.ph", employeeId: "ADM-001", role: "admin", status: "active", lastLogin: iso("08:05")
    }    ,  {
      id: "p-2", name: "M. Villar", email: "m.villar@plm.edu.ph", employeeId: "ADM-002", role: "admin", status: "active", lastLogin: iso("16:40")
    }    ,  {
      id: "p-3", name: "R. Ramos", email: "r.ramos@plm.edu.ph", employeeId: "SEC-014", role: "guard", status: "active", lastLogin: iso("07:58")
    }    ,  {
      id: "p-4", name: "L. Tan", email: "l.tan@plm.edu.ph", employeeId: "SEC-021", role: "guard", status: "active", lastLogin: iso("07:58")
    }    ,  {
      id: "p-5", name: "E. Navarro", email: "e.navarro@plm.edu.ph", employeeId: "SEC-030", role: "disabled", status: "disabled", lastLogin: iso("18:02")
    }    ],
    settings:  {
      displayName: "J. Robles", overdueHours: 4, retention: "1 year", alertOverdue: true, dailySummary: true, alertSlots: false
    }
  }  ;
}
());
