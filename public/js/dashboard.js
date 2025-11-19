(function(){
  if(!document.getElementById('dashboardRoot')) return;

  let ws;
  const out = document.getElementById('wsOutput');
  const input = document.getElementById('listenFormId');
  const startBtn = document.getElementById('startWs')
  const params = new URLSearchParams(location.search);
  const autoFormId = params.get("formId");

  if (autoFormId) {
    input.value = autoFormId;
    connectWS(autoFormId);
  }

  startBtn.addEventListener('click', () => {
    const id = input.value;
    if (!id) return alert('Enter form id');
    connectWS(id);
  });

  function connectWS(formId){
    const port = window.__WS_PORT__ || 4001;
    const wsUrl = `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.hostname}:${port}/?formId=${formId}`;
    out.innerHTML = '';

    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      out.innerHTML += `<div class="kv">Connected to realtime stream for form #${formId}</div>`;
    };

    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);

        const box = document.createElement('div');
        box.className = 'ws-entry';

        box.innerHTML = `
          <div class="kv">${new Date().toLocaleString()}</div>
          <pre>${escapeHtml(JSON.stringify(data, null, 2))}</pre>
        `;

        out.prepend(box);
      } catch (err) {
        console.error("Bad WS message", evt.data);
      }
    };

    ws.onclose = () => out.innerHTML += `<div class="kv">Disconnected</div>`;
    ws.onerror = (e) => console.error('ws error', e);
  }

  function escapeHtml(s){
    return (s||'').replace(/[&<>"']/g, (m)=>({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[m]);
  }
})();
