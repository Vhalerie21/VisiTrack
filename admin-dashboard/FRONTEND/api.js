/* Purpose: sole backend boundary with mock and real modes. Pages using it: every admin controller. API stubs: all. */
(function ()  {
  const cfg = window.VisiTrackConfig;
  const mock = window.VisiTrackMock;
  const clone = value => JSON.parse(JSON.stringify(value));
  const list = (items, opts =  {
  }  ) =>  {
    const page = Number(opts.page || 1), limit = Number(opts.limit || 25);
    return  {
      items: items.slice((page - 1) * limit, page * limit), page, limit, total: items.length
    }    ;
  }  ;
  function apiError(status, message, fields)  {
    const e = new Error(message);
    e.status = status;
    e.payload =  {
      error:  {
        code: status === 422 ? "VALIDATION_ERROR" : "REQUEST_ERROR", message, ...(fields ?  {
          fields
        }
        :  {
        }        )
      }
    }    ;
    return e;
  }
  async function request(method, path, options =  {
  }  , fnName)  {
    if (cfg.SIMULATE_ERRORS) throw apiError(503, "Service temporarily unavailable");
    if (cfg.USE_MOCK || cfg.MOCK_OVERRIDES[fnName])  {
      await new Promise(r => setTimeout(r, 80));
      return mockResponse(fnName, options);
    }
    const url = new URL(cfg.API_BASE_URL + path, window.location.href);
    Object.entries(options.query ||  {
    }    ).forEach(([k, v]) => v !== undefined && v !== "" && url.searchParams.set(k, v));
    const headers =  {
      "Content-Type": "application/json"
    }    ;
    // TODO[AUTH]: attach a bearer token here if token auth is selected.
    const response = await fetch(url,  {
      method, credentials: "include", headers, body: options.body ? JSON.stringify(options.body) : undefined
    }    );
    if (!response.ok)  {
      let payload =  {
      }      ;
      try  {
        payload = await response.json();
      }
      catch (_)  {
      }
      const e = apiError(response.status, payload.error?.message || `Request failed (${response.status})`, payload.error?.fields);
      e.payload = payload;
      throw e;
    }
    return response.status === 204 ? null : response.json();
  }
  function filtered(items, options)  {
    const q = String(options.query?.query || "").toLowerCase();
    const role = options.query?.role;
    return items.filter(x => !q || JSON.stringify(x).toLowerCase().includes(q)).filter(x => !role || x.role === role);
  }
  function mockResponse(fn, o)  {
    switch (fn)  {
      case "getCurrentUser": return clone(mock.currentUser);
      case "getDashboardStats": return clone(mock.dashboardStats);
      case "getPeakHours": return clone(mock.peakHours);
      case "getOverdueIds": return list(clone(mock.overdueIds));
      case "getRecentTransactions": return list(clone(mock.recentTransactions));
      case "getVisitorLogs": return list(filtered(clone(mock.visitorLogs), o), o.query);
      case "getSlots": return list(clone(mock.slots), o.query);
      case "getSlotDetails": return clone(mock.slots.find(s => s.id === o.body?.slotId || s.code === o.query?.slotId) || null);
      case "getVisitorReport": return  {
        ...clone(mock.dashboardStats), peakHours: clone(mock.peakHours), offices: clone(mock.reports.offices)
      }      ;
      case "getAuditTrail": return list(filtered(clone(mock.auditTrail), o), o.query);
      case "getPersonnel": return list(filtered(clone(mock.personnel), o), o.query);
      case "getSettings": return clone(mock.settings);
      case "signOut": return  {
        ok: true
      }      ;
      case "saveSettings": return  {
        ...clone(mock.settings), ...(o.body ||  {
        }        )
      }      ;
      case "createPersonnel": return  {
        ...(o.body ||  {
        }        ), id: `p-${Date.now()}`
      }      ;
      case "updatePersonnel": return clone(o.body);
      case "deletePersonnel": case "resetPersonnelPassword": case "overrideSlot": case "exportReport": return  {
        ok: true
      }      ;
      default: return  {
      }      ;
    }
  }
  const call = (name, method, path, options) => request(method, path, options, name);
  window.VisiTrackAPI =  {
    getCurrentUser: () => call("getCurrentUser", "GET", "/api/admin/session"), signOut: () => call("signOut", "POST", "/api/admin/session/sign-out"),
    getDashboardStats: () => call("getDashboardStats", "GET", "/api/admin/dashboard/stats"), getPeakHours: () => call("getPeakHours", "GET", "/api/admin/dashboard/peak-hours"), getOverdueIds: () => call("getOverdueIds", "GET", "/api/admin/dashboard/overdue-ids"), getRecentTransactions: () => call("getRecentTransactions", "GET", "/api/admin/dashboard/recent-transactions"),
    getVisitorLogs: (query =  {
    }    ) => call("getVisitorLogs", "GET", "/api/admin/visitor-logs",  {
      query
    }    ), getSlots: () => call("getSlots", "GET", "/api/admin/slots"), getSlotDetails: slotId => call("getSlotDetails", "GET", "/api/admin/slots/detail",  {
      query:  {
        slotId
      }
    }    ), overrideSlot: body => call("overrideSlot", "POST", "/api/admin/slots/override",  {
      body
    }    ),
    getVisitorReport: range => call("getVisitorReport", "GET", "/api/admin/reports/visitors",  {
      query:  {
        range
      }
    }    ), exportReport: body => call("exportReport", "POST", "/api/admin/reports/export",  {
      body
    }    ), getAuditTrail: query => call("getAuditTrail", "GET", "/api/admin/audit-trail",  {
      query
    }    ), getPersonnel: query => call("getPersonnel", "GET", "/api/admin/personnel",  {
      query
    }    ),
    createPersonnel: body => call("createPersonnel", "POST", "/api/admin/personnel",  {
      body
    }    ), updatePersonnel: body => call("updatePersonnel", "PATCH", `/api/admin/personnel/${body.id}`,  {
      body
    }    ), deletePersonnel: id => call("deletePersonnel", "DELETE", `/api/admin/personnel/${id}`), resetPersonnelPassword: id => call("resetPersonnelPassword", "POST", `/api/admin/personnel/${id}/reset-password`), getSettings: () => call("getSettings", "GET", "/api/admin/settings"), saveSettings: body => call("saveSettings", "PATCH", "/api/admin/settings",  {
      body
    }    )
  }  ;
}
());
