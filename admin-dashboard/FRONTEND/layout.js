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
  // Hamburger button — visible only on mobile via CSS
  const menuBtn=ui.el("button",undefined,"vt-admin-menu-btn");
  menuBtn.type="button";
  menuBtn.setAttribute("aria-label","Open navigation menu");
  menuBtn.setAttribute("aria-expanded","false");
  menuBtn.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`;
  menuBtn.addEventListener("click",()=>{
    const open=document.body.classList.toggle("nav-open");
    menuBtn.setAttribute("aria-expanded",String(open));
    menuBtn.setAttribute("aria-label",open?"Close navigation menu":"Open navigation menu")
  });
  // Tap the overlay (body::after) to close
  document.addEventListener("click",e=>{
    if(document.body.classList.contains("nav-open")){
      const side=document.querySelector(".vt-admin-sidebar");
      if(side&&!side.contains(e.target)&&e.target!==menuBtn&&!menuBtn.contains(e.target)){
        document.body.classList.remove("nav-open");
        menuBtn.setAttribute("aria-expanded","false");
        menuBtn.setAttribute("aria-label","Open navigation menu")
      }
    }
  });
  const side=ui.el("aside",undefined,"vt-admin-sidebar"), links=ui.el("nav",undefined,"vt-admin-nav");
  const logo=ui.el("span",undefined,"vt-admin-logo");
  logo.setAttribute("aria-hidden","true");
  logo.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" role="img" aria-label="Calendar with clock">
  <rect width="512" height="512" rx="94" fill="#3EBCA2"/>
  <g fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round">
    <g stroke-width="28">
      <path d="M188 401H157A30 30 0 0 1 127 371V155A30 30 0 0 1 157 125H355A30 30 0 0 1 385 155V187"/>
      <path d="M127 215H205"/>
      <path d="M199 109V144M314 109V144"/>
      <circle cx="314" cy="326" r="75"/>
    </g>
    <path stroke-width="22" d="M311 297V323L332 344"/>
  </g>
</svg>`;
  brand.append(logo,ui.el("span","VisiTrack"),ui.el("span","Admin Dashboard","vt-admin-subtitle"));
  const user=ui.el("div",undefined,"vt-admin-user");
  user.append(ui.el("span","","vt-admin-dot"),ui.el("span","Loading…"));
  header.append(menuBtn,brand,user);
  nav.forEach(n=>{
    const a=ui.el("a",n.label);
    a.href=n.file;
    if(n.id===page)a.className="active";
    links.append(a)
  }  );
  const out=ui.el("button",undefined,"vt-admin-signout");
  out.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:middle;margin-right:10px;color:#9AAFA6"><path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4"/><path d="M10 12h11"/><path d="M17 8l4 4-4 4"/></svg><span>Sign-out</span>`;
  out.type="button";
  out.addEventListener("click",async()=> {
    if(confirm("Sign out of VisiTrack?")) {
      await api.signOut();
      window.location.href="../../LoginPage/Front-End/LoginPage.html?role=admin"
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
