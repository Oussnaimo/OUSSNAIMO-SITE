(function(){
  // Simple unique id
  function uid(){ return Math.random().toString(36).slice(2) + Date.now().toString(36); }
  function today(){ return new Date().toISOString().slice(0,10); }
  function qs(s, r=document){ return r.querySelector(s); }
  function qsa(s, r=document){ return Array.from(r.querySelectorAll(s)); }

  // Data state
  let reports = JSON.parse(localStorage.getItem('reports')||'[]');
  let vehicles = JSON.parse(localStorage.getItem('vehicles')||'[]');
  let complaints = JSON.parse(localStorage.getItem('complaints')||'[]');

  function save(){
    localStorage.setItem('reports', JSON.stringify(reports));
    localStorage.setItem('vehicles', JSON.stringify(vehicles));
    localStorage.setItem('complaints', JSON.stringify(complaints));
  }

  // Tabs
  qsa('.tabBtn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      qsa('.tabBtn').forEach(b=>b.classList.remove('active'));
      qsa('.tab').forEach(t=>t.classList.remove('active'));
      btn.classList.add('active');
      qs('#tab-'+btn.dataset.tab).classList.add('active');
    });
  });

  // ------- Reports -------
  const reportForm = qs('#reportForm');
  const rEmp = qs('#r-employee');
  const rProj = qs('#r-project');
  const rDate = qs('#r-date');
  const rHours = qs('#r-hours');
  const rDesc = qs('#r-desc');
  const rReceipt = qs('#r-receipt');
  const rAmount = qs('#r-amount');
  const rNotes = qs('#r-notes');
  rDate.value = today();

  reportForm.addEventListener('submit', function(e){
    e.preventDefault();
    if(!rEmp.value.trim() || !rProj.value.trim() || !rDesc.value.trim()){
      alert('Remplissez Employé, Projet, Description');
      return;
    }
    const item = {
      id: uid(),
      employee: rEmp.value.trim(),
      project: rProj.value.trim(),
      description: rDesc.value.trim(),
      hours: Number(rHours.value||0),
      date: rDate.value,
      receiptNumber: rReceipt.value.trim(),
      amount: Number(rAmount.value||0),
      notes: rNotes.value.trim(),
    };
    reports.unshift(item);
    save();
    renderReports();
    reportForm.reset();
    rDate.value = today();
  });

  function renderReports(){
    const tbody = qs('#reportsTable tbody');
    tbody.innerHTML = '';
    if(reports.length===0){
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 8; td.textContent = 'Aucun rapport.'; td.style.color = '#6b7280'; td.style.textAlign='center';
      tr.appendChild(td); tbody.appendChild(tr); return;
    }
    reports.forEach(r=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${r.date}</td>
        <td>${r.employee}</td>
        <td>${r.project}</td>
        <td>${r.description}</td>
        <td>${r.hours}</td>
        <td>${r.receiptNumber}</td>
        <td>${r.amount}</td>
        <td>
          <button class="mini" data-dl-report="${r.id}">Télécharger</button>
          <button class="mini danger" data-del-report="${r.id}">Supprimer</button>
        </td>`;
      tbody.appendChild(tr);
    });
  }

  // Section downloads
  qs('#downloadReports').addEventListener('click', ()=>downloadJSON(reports, 'rapports.json'));

  // Delegation for table buttons
  qs('#reportsTable').addEventListener('click', function(e){
    const t = e.target;
    if(t.matches('[data-del-report]')){
      const id = t.getAttribute('data-del-report');
      reports = reports.filter(x=>x.id!==id); save(); renderReports();
    }
    if(t.matches('[data-dl-report]')){
      const id = t.getAttribute('data-dl-report');
      const item = reports.find(x=>x.id===id); if(item) downloadJSON(item, `rapport_${item.employee}_${item.date}.json`);
    }
  });

  // ------- Vehicles -------
  const vehicleForm = qs('#vehicleForm');
  const vKind = qs('#v-kind');
  const vBrand = qs('#v-brand');
  const vModel = qs('#v-model');
  const vPlate = qs('#v-plate');
  const vYear = qs('#v-year');
  const vKm = qs('#v-km');
  const vVisite = qs('#v-visite');
  const vAssur = qs('#v-assurance');
  const vStatus = qs('#v-status');
  vVisite.value = today();
  vAssur.value = today();

  vehicleForm.addEventListener('submit', function(e){
    e.preventDefault();
    if(!vPlate.value.trim()) { alert('Plaque obligatoire'); return; }
    const item = {
      id: uid(),
      kind: vKind.value,
      brand: vBrand.value.trim(),
      model: vModel.value.trim(),
      plate: vPlate.value.trim().toUpperCase(),
      year: Number(vYear.value||0),
      mileage: Number(vKm.value||0),
      nextVisite: vVisite.value,
      assuranceExpiry: vAssur.value,
      status: vStatus.value,
    };
    vehicles.unshift(item); save(); renderVehicles(); refreshPlateOptions(); vehicleForm.reset(); vVisite.value=today(); vAssur.value=today();
  });

  function renderVehicles(){
    const tbody = qs('#vehiclesTable tbody');
    tbody.innerHTML = '';
    if(vehicles.length===0){
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 9; td.textContent = 'Aucun véhicule.'; td.style.color = '#6b7280'; td.style.textAlign='center';
      tr.appendChild(td); tbody.appendChild(tr); return;
    }
    vehicles.forEach(v=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${v.plate}</td>
        <td>${v.kind}</td>
        <td>${v.brand} ${v.model}</td>
        <td>${v.year||'-'}</td>
        <td>${v.mileage||'-'}</td>
        <td>${v.nextVisite}</td>
        <td>${v.assuranceExpiry}</td>
        <td><span class="badge">${v.status}</span></td>
        <td>
          <button class="mini" data-dl-vehicle="${v.id}">Télécharger</button>
          <button class="mini danger" data-del-vehicle="${v.id}">Supprimer</button>
        </td>`;
      tbody.appendChild(tr);
    });
  }

  qs('#downloadVehicles').addEventListener('click', ()=>downloadJSON(vehicles, 'vehicules.json'));
  qs('#vehiclesTable').addEventListener('click', function(e){
    const t = e.target;
    if(t.matches('[data-del-vehicle]')){
      const id = t.getAttribute('data-del-vehicle');
      vehicles = vehicles.filter(x=>x.id!==id); save(); renderVehicles(); refreshPlateOptions();
    }
    if(t.matches('[data-dl-vehicle]')){
      const id = t.getAttribute('data-dl-vehicle');
      const item = vehicles.find(x=>x.id===id); if(item) downloadJSON(item, `vehicule_${item.plate}.json`);
    }
  });

  // ------- Complaints -------
  const complaintForm = qs('#complaintForm');
  const cPlate = qs('#c-plate');
  const cKind = qs('#c-kind');
  const cUrg = qs('#c-urgency');
  const cDate = qs('#c-date');
  const cReporter = qs('#c-reporter');
  const cDesc = qs('#c-desc');
  cDate.value = today();

  complaintForm.addEventListener('submit', function(e){
    e.preventDefault();
    if(!cPlate.value){ alert('Choisissez une plaque'); return; }
    if(!cDesc.value.trim()){ alert('Ajoutez une description'); return; }
    const item = {
      id: uid(),
      plate: cPlate.value,
      issueKind: cKind.value,
      urgency: cUrg.value,
      date: cDate.value,
      reporter: cReporter.value.trim(),
      description: cDesc.value.trim(),
    };
    complaints.unshift(item); save(); renderComplaints(); complaintForm.reset(); cDate.value=today(); cPlate.value = (vehicles[0]?.plate)||'';
  });

  function renderComplaints(){
    const tbody = qs('#complaintsTable tbody');
    tbody.innerHTML = '';
    if(complaints.length===0){
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 7; td.textContent = 'Aucune réclamation.'; td.style.color = '#6b7280'; td.style.textAlign='center';
      tr.appendChild(td); tbody.appendChild(tr); return;
    }
    complaints.forEach(c=>{
      const tr = document.createElement('tr');
      const urgencyClass = c.urgency==='Haute'?'badge red':(c.urgency==='Faible'?'badge green':'badge');
      tr.innerHTML = `
        <td>${c.plate}</td>
        <td>${c.issueKind}</td>
        <td><span class="${urgencyClass}">${c.urgency}</span></td>
        <td>${c.date}</td>
        <td>${c.reporter||'-'}</td>
        <td>${c.description}</td>
        <td>
          <button class="mini" data-dl-complaint="${c.id}">Télécharger</button>
          <button class="mini danger" data-del-complaint="${c.id}">Supprimer</button>
        </td>`;
      tbody.appendChild(tr);
    });
  }

  qs('#downloadComplaints').addEventListener('click', ()=>downloadJSON(complaints, 'reclamations.json'));
  qs('#complaintsTable').addEventListener('click', function(e){
    const t = e.target;
    if(t.matches('[data-del-complaint]')){
      const id = t.getAttribute('data-del-complaint');
      complaints = complaints.filter(x=>x.id!==id); save(); renderComplaints();
    }
    if(t.matches('[data-dl-complaint]')){
      const id = t.getAttribute('data-dl-complaint');
      const item = complaints.find(x=>x.id===id); if(item) downloadJSON(item, `reclamation_${item.plate}_${item.date}.json`);
    }
  });

  // Refresh plates in complaint form from vehicles
  function refreshPlateOptions(){
    const set = new Set(vehicles.map(v=>v.plate).filter(Boolean));
    cPlate.innerHTML='';
    set.forEach(p=>{
      const o=document.createElement('option'); o.value=p; o.textContent=p; cPlate.appendChild(o);
    });
  }

  // Export/Import all
  qs('#exportAllBtn').addEventListener('click', function(){
    downloadJSON({exportedAt:new Date().toISOString(), reports, vehicles, complaints}, 'export_portail.json');
  });

  qs('#importFile').addEventListener('change', function(){
    const file = this.files && this.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = function(ev){
      try{
        const j = JSON.parse(String(ev.target.result||'{}'));
        reports = j.reports||[]; vehicles = j.vehicles||[]; complaints = j.complaints||[];
        save();
        renderReports(); renderVehicles(); refreshPlateOptions(); renderComplaints();
        alert('Import réussi');
      }catch(err){
        alert('Fichier invalide');
      }
    };
    reader.readAsText(file);
  });

  // Download helper
  function downloadJSON(data, filename){
    const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  // Initial render
  renderReports(); renderVehicles(); refreshPlateOptions(); renderComplaints();
  if(vehicles[0]) cPlate.value = vehicles[0].plate;
})();
