// public.js - public share page logic
(async function(){
  if(!document.getElementById('publicRoot')) return;

  const params = new URLSearchParams(location.search);
  const token = params.get('token');

  if(!token){
    document.getElementById('publicRoot').innerHTML =
      '<div class="card center">Invalid link</div>';
    return;
  }

  try{
    const data = await apiFetch(`/forms/share/${token}`);

    document.getElementById('pubTitle').innerText =
      data.title || 'Untitled Form';

    document.getElementById('pubDesc').innerText =
      data.description || '';

    const fieldsWrap = document.getElementById('pubFields');
    fieldsWrap.innerHTML = '';

    data.fields.forEach(field => {
      const el = document.createElement('div');
      el.className = 'field';

      let input;

      if (field.type === 'textarea') {
        input = `<textarea id="f_${field.id}" class="input" rows="3"></textarea>`;
      }
      else if (field.type === 'select') {
        const opts = (field.options || [])
          .map(o => {
            let text = typeof o === "string" ? o : o.value || o.label || "";
            return `<option value="${text}">${text}</option>`;
          })
          .join('');
        input = `<select id="f_${field.id}" class="input">${opts}</select>`;
      }
      else {
        input = `<input id="f_${field.id}" class="input" type="${field.type||'text'}" />`;
      }

      el.innerHTML =
        `<label>${field.label}${field.required ? ' *' : ''}</label>${input}`;

      fieldsWrap.appendChild(el);
    });

    // — Submit handler —
    document.getElementById('pubSubmit').addEventListener('click', async ()=>{

      const answers = {};
      data.fields.forEach(f => {
        answers[f.label] =
          (document.getElementById("f_"+f.id).value || "").toString();
      });

      try {
        const out = await fetch(`/api/forms/${data.id}/submit`, {
          method:"POST",
          headers: {"Content-Type":"application/json"},
          body: JSON.stringify({ answers })
        });

        const json = await out.json();

        document.getElementById('pubFields').innerHTML =
          `<div class="card center">
             <strong>Your response has been recorded.</strong>
           </div>`;
      } catch(e){
        console.error(e);
        alert("Submit failed.");
      }
    });

  } catch(err){
    console.error(err);
    document.getElementById('publicRoot').innerHTML =
      `<div class="card center">Form not found</div>`;
  }
})();
