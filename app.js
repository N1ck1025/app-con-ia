// app.js — lógica mínima de autenticación, CRUD y demo
(function(){
  const LS_USERS = 'sr_users';
  const LS_RES = 'sr_reservations';
  const LS_CUR = 'sr_current';
  const LS_DEF_ROLE = 'sr_default_role';

  // Selector rápido para elementos del DOM
  const qs = s => document.querySelector(s);
  // showAlert: muestra mensajes temporales en el contenedor `#alerts`.
  // `type` controla la apariencia ('info' o 'error').
  const showAlert = (msg, type='info') => {
    const a = qs('#alerts');
    if(!a) return;
    a.innerHTML = `<div class="p-3 rounded mb-2 ${type==='error'? 'bg-red-800 text-red-200':'bg-gray-800'}">${msg}</div>`;
    setTimeout(()=> a.innerHTML='',3000);
  };

  // Storage helpers
  function getUsers(){ return JSON.parse(localStorage.getItem(LS_USERS) || '[]'); }
  function saveUsers(u){ localStorage.setItem(LS_USERS, JSON.stringify(u)); }
  function getReservations(){ return JSON.parse(localStorage.getItem(LS_RES) || '[]'); }
  function saveReservations(r){ localStorage.setItem(LS_RES, JSON.stringify(r)); }

  function getDefaultRole(){ return localStorage.getItem(LS_DEF_ROLE) || 'cliente'; }
  function setDefaultRole(r){ localStorage.setItem(LS_DEF_ROLE, r); }

  // Demo seed (idempotent — sobrescribe datos de prueba)
  // Crea usuarios pre-registrados (admin, operador) y varias reservas demo
  // asignadas al operador. Útil para pruebas manuales rápidas.
  function seedDemo(){
    // Pre-registered: only admin and operador
    const users = [
      {id:1,name:'Admin Demo',email:'admin@demo',password:'admin123',role:'admin'},
      {id:2,name:'Operador Demo',email:'operador@demo',password:'operador123',role:'operador'}
    ];
    saveUsers(users);

    const today = new Date();
    const reservations = [];
    let id = 1;
    const services = ['Servicio A','Servicio B','Servicio C','Consulta','Soporte'];
    for(let d=0; d<7; d++){
      const dt = new Date(today); dt.setDate(today.getDate()+d);
      const ds = dt.toISOString().slice(0,10);
      const count = Math.floor(Math.random()*3)+1; // 1..3 per day
      for(let k=0;k<count;k++){
        reservations.push({
          id: id++,
          // assign demo reservations to operador (userId 2)
          userId: 2,
          service: services[Math.floor(Math.random()*services.length)],
          date: ds,
          status: ['pendiente','confirmada','cancelada'][Math.floor(Math.random()*3)],
          notes: 'Reserva demo'
        });
      }
    }
    saveReservations(reservations);
    showAlert('Demo cargada: usuarios y reservas (sobrescrito)', 'info');
    renderAuthArea();
    renderRoleBanner();
  }

  // ---------- Autenticación (usuarios) ----------
  // register: añade un usuario nuevo si el email no está registrado.
  function register({name,email,password,role}){
    const users = getUsers();
    if(users.find(u=>u.email===email)) { showAlert('Email ya registrado', 'error'); return false; }
    const id = users.length ? Math.max(...users.map(u=>u.id))+1 : 1;
    users.push({id,name,email,password,role});
    saveUsers(users);
    showAlert('Registro correcto. Puedes iniciar sesión.');
    return true;
  }

  // login: valida credenciales contra los usuarios en localStorage y
  // guarda la sesión actual en `sr_current`.
  function login(email,password){
    const u = getUsers().find(x=>x.email===email && x.password===password);
    if(!u) { showAlert('Credenciales inválidas','error'); return null; }
    localStorage.setItem(LS_CUR, JSON.stringify(u));
    renderAuthArea();
    showAlert('Sesión iniciada: '+u.name);
    return u;
  }

  function logout(){ localStorage.removeItem(LS_CUR); renderAuthArea(); showAlert('Sesión cerrada'); }
  function getCurrent(){ return JSON.parse(localStorage.getItem(LS_CUR) || 'null'); }

  // ---------- UI: área de autenticación en header ----------
  // renderAuthArea: muestra botones de inicio de sesión/registro cuando
  // no hay sesión, y el nombre del usuario con acceso al panel cuando
  // la sesión está activa.
  function renderAuthArea(){
    const area = qs('#auth-area');
    const cur = getCurrent();
    if(cur){
      area.innerHTML = `<div class="text-sm">${cur.name} <span class="text-xs text-gray-400">(${cur.role})</span></div><div class="flex gap-2"><button id="btn-profile" class="px-3 py-1 rounded border">Panel</button><button id="btn-logout" class="px-3 py-1 rounded border">Salir</button></div>`;
      qs('#btn-logout').addEventListener('click', logout);
      qs('#btn-profile').addEventListener('click', ()=> renderDashboard());
    } else {
      area.innerHTML = `<div class="flex gap-2"><button id="nav-login" class="px-3 py-1 rounded bg-cyan-600">Entrar</button><button id="nav-register" class="px-3 py-1 rounded border">Registro</button></div>`;
      qs('#nav-login').addEventListener('click', showLogin);
      qs('#nav-register').addEventListener('click', showRegister);
    }
  }

  // ---------- Banner de rol por defecto ----------
  // renderRoleBanner: permite elegir un rol por defecto que se usará
  // al registrarse. Se almacena en `sr_default_role`.
  function renderRoleBanner(){
    const banner = qs('#role-banner');
    if(!banner) return;
    if(!localStorage.getItem(LS_DEF_ROLE)){
      banner.classList.remove('hidden');
      const sel = qs('#default-role-select');
      sel.value = 'cliente';
      qs('#btn-set-role').onclick = ()=>{
        const val = sel.value || 'cliente';
        setDefaultRole(val);
        banner.classList.add('hidden');
        showAlert('Rol por defecto guardado: '+val);
      };
    } else {
      banner.classList.add('hidden');
    }
  }

  // ---------- Modal de autenticación ----------
  // showLogin / showRegister: abre el modal para login o registro.
  function showLogin(){ openAuthModal('login'); }
  function showRegister(){ openAuthModal('register'); }

  // openAuthModal: construye dinámicamente el modal de login/registro
  // y gestiona el envío. En el registro se usa el rol por defecto.
  function openAuthModal(mode){
    const tpl = qs('#tmpl-auth-forms');
    const node = tpl.content.cloneNode(true);
    const modal = node.querySelector('#auth-forms');
    const form = modal.querySelector('#form-auth');
    modal.querySelector('#auth-title').textContent = mode==='login' ? 'Iniciar sesión' : 'Registrarse';

    if(mode==='login'){
      form.name.style.display='none';
      form.role.style.display='none';
    } else {
      form.name.style.display='block';
      // hide role input on register: we use default role chooser
      form.role.style.display='none';
    }

    const submitHandler = (e)=>{
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form));
      if(mode==='login'){
        const user = login((data.email||'').trim(), (data.password||'').trim());
        if(user && document.body.contains(modal)) document.body.removeChild(modal);
      } else {
        if(!data.email || !data.password || !data.name) { showAlert('Complete los campos','error'); return; }
        const role = getDefaultRole();
        const ok = register({name: data.name.trim(), email: data.email.trim(), password: data.password.trim(), role});
        if(ok && document.body.contains(modal)) document.body.removeChild(modal);
      }
    };

    form.addEventListener('submit', submitHandler);
    modal.querySelector('#auth-cancel').addEventListener('click', ()=>{ if(document.body.contains(modal)) document.body.removeChild(modal); });
    document.body.appendChild(modal);
  }

  // ---------- Dashboard principal ----------
  // renderDashboard: decide qué vista mostrar según el rol del usuario
  // actualmente autenticado: admin, operador o cliente.
  function renderDashboard(){
    const cur = getCurrent();
    if(!cur) return showAlert('Inicia sesión primero','error');
    qs('#landing').classList.add('hidden');
    qs('#dashboard').classList.remove('hidden');
    const container = qs('#dashboard-content');
    container.innerHTML = '';
    const h = document.createElement('div');
    h.innerHTML = `<h3 class="text-lg font-semibold mb-3">Panel - ${cur.role}</h3>`;
    container.appendChild(h);
    if(cur.role==='admin') renderAdmin(container);
    else if(cur.role==='operador') renderOperator(container);
    else renderClient(container, cur);
  }

  // ---------- Vista Admin ----------
  // renderAdmin: lista todas las reservas con controles para cambiar
  // estado y eliminar reservas. También muestra estadísticas.
  function renderAdmin(container){
    const res = getReservations();
    const users = getUsers();
    const tbl = document.createElement('div');
    tbl.className = 'overflow-x-auto';
    tbl.innerHTML = `
      <table class="w-full text-sm">
        <thead class="text-left text-gray-400"><tr><th>ID</th><th>Cliente</th><th>Servicio</th><th>Fecha</th><th>Estado</th><th>Acciones</th></tr></thead>
        <tbody id="admin-tbody"></tbody>
      </table>
    `;
    container.appendChild(tbl);
    const tbody = qs('#admin-tbody'); tbody.innerHTML = '';
    res.forEach(r=>{
      const user = users.find(u=>u.id===r.userId) || {name:'Desconocido'};
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="py-2">${r.id}</td>
        <td class="py-2">${user.name}</td>
        <td class="py-2">${r.service}</td>
        <td class="py-2">${r.date}</td>
        <td class="py-2">${r.status}</td>
        <td class="py-2">
          <select id="status-${r.id}" class="p-1 bg-gray-800 border border-gray-700 rounded">
            <option value="pendiente">pendiente</option>
            <option value="confirmada">confirmada</option>
            <option value="cancelada">cancelada</option>
          </select>
          <button id="del-${r.id}" class="ml-2 px-2 py-1 rounded border">Eliminar</button>
        </td>
      `;
      tbody.appendChild(tr);
      const sel = document.getElementById(`status-${r.id}`);
      const del = document.getElementById(`del-${r.id}`);
      if(sel){ sel.value = r.status; sel.addEventListener('change', e=> changeStatus(r.id, e.target.value)); }
      if(del) del.addEventListener('click', ()=>{ if(confirm('Eliminar reserva?')) { deleteReservation(r.id); renderDashboard(); }});
    });
    const stats = document.createElement('div');
    stats.className = 'mt-4';
    stats.innerHTML = `<p>Reservas totales: ${res.length}</p><p>Usuarios totales: ${users.length}</p>`;
    container.appendChild(stats);
    renderStatistics(container, res);
  }

  // ---------- Vista Operador ----------
  // renderOperator: muestra solo reservas 'pendiente' del día actual
  // que el operador debe atender. Incluye botones para confirmar
  // o reprogramar y un botón de 'Refrescar' para recargar la lista.
  function renderOperator(container){
    const today = new Date().toISOString().slice(0,10);
    // show only pending reservations for today in operator panel
    const res = getReservations().filter(r=>r.date===today && r.status==='pendiente');
    const div = document.createElement('div');
    div.className = 'mb-2';
    const header = document.createElement('div');
    header.className = 'flex items-center justify-between';
    header.innerHTML = `<p>Agenda diaria (${today}): ${res.length} reservas pendientes</p>`;
    const btnRefresh = document.createElement('button'); btnRefresh.className='px-3 py-1 rounded border'; btnRefresh.textContent='Refrescar';
    btnRefresh.addEventListener('click', ()=> renderDashboard());
    header.appendChild(btnRefresh);
    div.appendChild(header);

    if(res.length===0){
      const empty = document.createElement('div'); empty.className='p-3 text-gray-400'; empty.textContent = 'No hay reservas pendientes para hoy.'; div.appendChild(empty);
    } else {
      res.forEach(r=>{
        const el = document.createElement('div');
        el.className='p-3 rounded border border-gray-700 mt-2 flex justify-between items-center';
        const left = document.createElement('div');
        left.innerHTML = `<strong>${r.service}</strong><div class="text-xs text-gray-400">${r.date} — ${r.status}</div>`;
        const right = document.createElement('div');
        right.className = 'flex gap-2';
        const btnConfirm = document.createElement('button'); btnConfirm.className='px-2 py-1 rounded bg-cyan-600'; btnConfirm.textContent='Confirmar';
        const btnReprog = document.createElement('button'); btnReprog.className='px-2 py-1 rounded border'; btnReprog.textContent='Reprogramar';
        btnConfirm.addEventListener('click', ()=>{ changeStatus(r.id, 'confirmada'); renderDashboard(); });
        btnReprog.addEventListener('click', ()=>{
          const nd = prompt('Nueva fecha (YYYY-MM-DD)', r.date);
          if(nd && validateDate(nd)){ updateReservation(r.id, {date:nd}); renderDashboard(); }
          else if(nd) showAlert('Fecha inválida','error');
        });
        right.appendChild(btnConfirm); right.appendChild(btnReprog);
        el.appendChild(left); el.appendChild(right);
        div.appendChild(el);
      });
    }
    container.appendChild(div);
  }

  // ---------- Vista Cliente ----------
  // renderClient: interfaz para que un cliente cree nuevas reservas
  // y gestione (cancele) sus propias reservas.
  function renderClient(container, cur){
    const mine = getReservations().filter(r=>r.userId===cur.id);
    const wrap = document.createElement('div'); wrap.className='mt-2';
    const form = document.createElement('form'); form.className='space-y-2 mb-4';
    form.innerHTML = `
      <h4 class="font-semibold">Crear reserva</h4>
      <input name="service" placeholder="Servicio" class="w-full p-2 rounded bg-gray-800 border border-gray-700" />
      <input name="date" type="date" class="w-full p-2 rounded bg-gray-800 border border-gray-700" />
      <textarea name="notes" placeholder="Notas" class="w-full p-2 rounded bg-gray-800 border border-gray-700"></textarea>
      <div><button class="px-4 py-2 rounded bg-cyan-600">Crear</button></div>
    `;
    form.addEventListener('submit', e=>{
      e.preventDefault();
      const f = new FormData(form);
      const service = (f.get('service')||'').trim();
      const date = f.get('date');
      const notes = (f.get('notes')||'').trim();
      if(!service || !date) return showAlert('Complete servicio y fecha','error');
      if(!validateDate(date)) return showAlert('Fecha inválida','error');
      createReservation({userId:cur.id, service, date, notes});
      renderDashboard();
    });
    wrap.appendChild(form);

    const list = document.createElement('div'); list.className='space-y-2';
    if(!mine.length) list.innerHTML = '<p>No tienes reservas.</p>';
    else {
      mine.forEach(r=>{
        const el = document.createElement('div');
        el.className='p-3 rounded border border-gray-700 flex justify-between items-center';
        const left = document.createElement('div'); left.innerHTML = `<strong>${r.service}</strong><div class="text-xs text-gray-400">${r.date} — ${r.status}</div>`;
        const btn = document.createElement('button'); btn.className='px-2 py-1 rounded border'; btn.textContent='Cancelar';
        btn.addEventListener('click', ()=>{ if(confirm('Cancelar reserva?')){ changeStatus(r.id,'cancelada'); renderDashboard(); }});
        el.appendChild(left); el.appendChild(btn);
        list.appendChild(el);
      });
    }
    wrap.appendChild(list);
    container.appendChild(wrap);
  }

  // ---------- Helpers CRUD ----------
  // validateDate: evita que se creen reservas en fechas pasadas.
  function validateDate(dateStr){
    const today = new Date(); today.setHours(0,0,0,0);
    const d = new Date(dateStr); d.setHours(0,0,0,0);
    return d>=today;
  }

  // createReservation: agrega una reserva nueva (estado 'pendiente').
  function createReservation({userId,service,date,notes}){
    const reservations = getReservations();
    const id = reservations.length ? Math.max(...reservations.map(r=>r.id))+1 : 1;
    const rec = {id,userId,service,date,status:'pendiente',notes};
    reservations.push(rec);
    saveReservations(reservations);
    showAlert('Reserva creada');
  }

  // updateReservation: actualiza campos de una reserva existente.
  function updateReservation(id, updates){
    const reservations = getReservations();
    const idx = reservations.findIndex(r=>r.id===id);
    if(idx===-1) return showAlert('Reserva no encontrada','error');
    reservations[idx] = Object.assign({}, reservations[idx], updates);
    saveReservations(reservations);
    showAlert('Reserva actualizada');
  }

  // deleteReservation: elimina la reserva indicada por id.
  function deleteReservation(id){
    const reservations = getReservations().filter(r=>r.id!==id);
    saveReservations(reservations);
    showAlert('Reserva eliminada');
  }

  // changeStatus: atajo para cambiar únicamente el estado de una reserva.
  function changeStatus(id, status){ updateReservation(id, {status}); }

  // ---------- Estadísticas ----------
  // renderStatistics: calcula y muestra totales por estado y un desglose
  // simple de reservas para los próximos 7 días.
  function renderStatistics(container, reservations){
    const byStatus = reservations.reduce((acc,r)=>{ acc[r.status] = (acc[r.status]||0)+1; return acc; }, {});
    const total = reservations.length || 1;
    const statEl = document.createElement('div'); statEl.className = 'mt-4 p-4 border border-gray-800 rounded';
    let html = '<h4 class="font-semibold mb-2">Estadísticas</h4><div class="grid grid-cols-3 gap-3">';
    ['pendiente','confirmada','cancelada'].forEach(s=>{ const n = byStatus[s] || 0; const perc = Math.round((n/total)*100); html += `<div class="p-2 rounded bg-gray-800"><div class="text-sm text-gray-400">${s}</div><div class="text-lg font-bold">${n}</div><div class="text-xs text-gray-500">${perc}%</div></div>`; });
    html += '</div>';
    const today = new Date(); const upcoming = [];
    for(let i=0;i<7;i++){ const d = new Date(today); d.setDate(today.getDate()+i); const ds = d.toISOString().slice(0,10); const cnt = reservations.filter(r=>r.date===ds).length; upcoming.push({date:ds,count:cnt}); }
    html += '<div class="mt-3"><h5 class="text-sm font-medium">Próximos 7 días</h5><ul class="text-xs text-gray-400 mt-1">';
    upcoming.forEach(u=> html += `<li>${u.date}: ${u.count}</li>`);
    html += '</ul></div>';
    statEl.innerHTML = html; container.appendChild(statEl);
  }

  // ---------- Inicialización ----------
  // init: enlaza botones principales y dibuja el estado inicial de la UI.
  function init(){
    qs('#btn-login').addEventListener('click', showLogin);
    qs('#btn-register').addEventListener('click', showRegister);
    const ask = qs('#btn-ask-reserve');
    if(ask) ask.addEventListener('click', ()=>{ const cur = getCurrent(); if(cur) renderDashboard(); else showLogin(); });
    renderAuthArea();
    renderRoleBanner();
  }

  window.addEventListener('DOMContentLoaded', init);
})();
