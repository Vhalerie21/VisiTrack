/* Purpose: shared shell, route guard, and sign-out. Pages using it: all admin pages. API stubs: getCurrentUser, signOut. */
(function ()  {
  const api = window.VisiTrackAPI, ui = window.VisiTrackUI, page = document.body.dataset.page;
  const nav = [ {
    id: "dashboard", label: "Dashboard", file: "dashboard.html"
  }  ,  {
    id: "visitor-logs", label: "Visitor Logs", file: "visitor-logs.html"
  }  ,  {
    id: "storage-slots", label: "Storage Slots", file: "storage-slots.html"
  }  ,  {
    id: "reports", label: "Reports", file: "reports.html"
  }  ,  {
    id: "audit-trail", label: "Audit Trail", file: "audit-trail.html"
  }  ,  {
    id: "personnel-accounts", label: "Personnel Accounts", file: "personnel-accounts.html"
  }  ,  {
    id: "settings", label: "Settings", file: "settings.html"
  }  ];
  const shell = document.getElementById("vt-admin-shell"), header = ui.el("header", undefined, "vt-admin-header"), brand = ui.el("a", undefined, "vt-admin-brand");
  brand.href="dashboard.html";
  brand.setAttribute("aria-label","VisiTrack Admin Dashboard");
  const logo=ui.el("span",undefined,"vt-admin-logo");
  logo.setAttribute("aria-hidden","true");
  logo.innerHTML=`<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#f1fffa" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect width="64" height="64" rx="14" fill="#39c5a5" stroke="none"/><rect x="14" y="19" width="32" height="30" rx="5"/><path d="M24 13v9M36 13v9M14 29h32"/><path d="M22 37h4M22 43h4"/><circle cx="44" cy="44" r="10" fill="#39c5a5"/><path d="M44 38.5V44l3.5 2.5" stroke-width="2.5"/></svg>`;
  brand.append(logo,ui.el("span","VisiTrack"),ui.el("span","Admin Dashboard","vt-admin-subtitle"));
  const user=ui.el("div",undefined,"vt-admin-user");
  user.append(ui.el("span","","vt-admin-dot"),ui.el("span","Loading…"));
  header.append(brand,user);
  const side=ui.el("aside",undefined,"vt-admin-sidebar"), links=ui.el("nav",undefined,"vt-admin-nav");
  nav.forEach(n=> {
    const a=ui.el("a",n.label);
    a.href=n.file;
    if(n.id===page)a.className="active";
    links.append(a)
  }  );
  const out=ui.el("button","↪  Sign-out","vt-admin-signout");
  out.type="button";
  out.addEventListener("click",async()=> {
    if(confirm("Sign out of VisiTrack?")) {
      await api.signOut();
      window.location.href="login-placeholder.html"
    }
  }  );
  side.append(links,out);
  shell.prepend(header);
  shell.insertBefore(side, shell.lastElementChild);
  // TODO[AUTH]: route guard is UX only; backend must enforce roles. Redirect if session lookup fails.
  api.getCurrentUser().then(u=> {
    user.lastChild.textContent=`${u.role === "admin" ? "Admin" : u.role}, ${u.displayName}`
  }  ).catch(ui.error);
}
());
