// submissions.js - admin list view
(async function(){
  if(!document.getElementById('submissionsRoot')) return;
  // require token
  const token = getToken();
  if(!token) window.location = '/views/index.html';

  const params = new URLSearchParams(location.search);
  const id = params.get('formId');
  if(!id){ document.getElementById('submissionsRoot').innerHTML='Invalid form id'; return; }

  async function load(){
    try{
      const data = await apiFetch(`/forms/${id}/submissions`);
      const table = document.getElementById('subsTable');
      table.innerHTML = `<tr><th>ID</th><th>Created</th><th>Answers (fieldId:value)</th></tr>`;
      data.forEach(s=>{
        const ans = s.answers.map(a=>`${a.fieldId}: ${escapeHtml(a.value)}`).join('<br>');
        const row = `<tr><td>${s.id}</td><td>${new Date(s.createdAt).toLocaleString()}</td><td>${ans}</td></tr>`;
        table.innerHTML += row;
      });
    }catch(err){
      console.error(err);
      alert('Failed to load submissions');
    }
  }
  function escapeHtml(s){ return (s||'').replace(/[&<>"']/g, (m)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[m]); }

  document.getElementById('refreshSubs').addEventListener('click', load);
  load();
})();
