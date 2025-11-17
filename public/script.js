let fields = [];
let savedForm = null;

const fieldsDiv = document.getElementById('fields');
const addFieldBtn = document.getElementById('addFieldBtn');
const newFieldType = document.getElementById('newFieldType');
const saveFormBtn = document.getElementById('saveFormBtn');
const previewArea = document.getElementById('previewArea');
const saveResult = document.getElementById('saveResult');
const submitResult = document.getElementById('submitResult');

// Fields js starts from here
function renderFields() {
    fieldsDiv.innerHTML = '';
    fields.forEach((f, idx) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'field';

        const labelInput = document.createElement('input');
        labelInput.type = 'text';
        labelInput.value = f.label;
        labelInput.placeholder = 'Label';
        labelInput.oninput = (e) => { f.label = e.target.value; renderPreview(); };

        const req = document.createElement('input');
        req.type = 'checkbox';
        req.checked = !!f.required;
        req.onchange = (e) => { f.required = e.target.checked; };

        const del = document.createElement('button');
        del.textContent = 'Delete';
        del.onclick = () => { fields.splice(idx,1); renderFields(); renderPreview(); };

        wrapper.appendChild(labelInput);
        wrapper.appendChild(document.createTextNode(' Required '));
        wrapper.appendChild(req);

        if(f.type === 'select'){
            const opts = document.createElement('input');
            opts.type = 'text';
            opts.placeholder = 'Comma-separated options';
            opts.value = (f.options || []).join(',');
            opts.oninput = (e) => { f.options = e.target.value.split(',').map(s=>s.trim()).filter(Boolean); renderPreview(); };
            wrapper.appendChild(opts);
        }

        wrapper.appendChild(document.createTextNode(' Type: ' + f.type + ' '));
        wrapper.appendChild(del);

        fieldsDiv.appendChild(wrapper);
    });
}

// Submission form starts from here
function renderPreview(form = null){
    previewArea.innerHTML = '';
    const usedFields = form ? form.fields : fields;
    if(!usedFields || usedFields.length === 0){
        previewArea.textContent = 'No fields yet.';
        return;
    }

    const formEl = document.createElement('form');
    formEl.onsubmit = async (e)=>{
        e.preventDefault();
        const fd = new FormData(formEl);
        if(!form){
            submitResult.textContent = 'Preview mode — not saved.';
            return;
        }
        const answers = usedFields.map(f=>({ fieldId: f.id, value: fd.get(String(f.id)) || '' }));
        try {
            const res = await fetch(`/api/forms/${form.id}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers })
            });
            const json = await res.json();
            submitResult.textContent = `Form submitted! Submission ID: ${json.id}`;
        } catch(err){
            console.error(err);
            submitResult.textContent = 'Error submitting form';
        }
    };

    usedFields.forEach(f=>{
        const wrapper = document.createElement('div');
        wrapper.className = 'preview-field';
        const label = document.createElement('label');
        label.textContent = f.label + (f.required ? ' *' : '');
        const name = String(f.id || f.label);
        let input;

        if(f.type === 'textarea'){
            input = document.createElement('textarea'); input.name = name;
        } else if(f.type === 'select'){
            input = document.createElement('select'); input.name = name;
            (f.options || []).forEach(opt=>{
                const o = document.createElement('option'); o.value = opt; o.textContent = opt; input.appendChild(o);
            });
        } else if(f.type === 'checkbox'){
            input = document.createElement('input'); input.type = 'checkbox'; input.name = name; input.value = 'on';
        } else {
            input = document.createElement('input'); input.type = f.type || 'text'; input.name = name;
        }

        if(f.required) input.required = true;
        wrapper.appendChild(label);
        wrapper.appendChild(document.createElement('br'));
        wrapper.appendChild(input);
        formEl.appendChild(wrapper);
    });

    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.textContent = form ? 'Submit' : 'Preview Submit';
    formEl.appendChild(submitBtn);

    previewArea.appendChild(formEl);
}

// Add field button starts from here
addFieldBtn.onclick = ()=>{
    const t = newFieldType.value;
    fields.push({ label: t + ' field', type: t, required: false, options: t==='select'?['Option 1','Option 2']:[] });
    renderFields();
    renderPreview();
};

// Save form button start from here
saveFormBtn.onclick = async ()=>{
    const title = document.getElementById('formTitle').value || 'Untitled';
    const desc = document.getElementById('formDesc').value || '';
    const payload = {
        title,
        description: desc,
        fields: fields.map((f, idx)=>({
            label: f.label,
            type: f.type,
            required: !!f.required,
            order: idx,
            options: f.options
        }))
    };

    try {
        const res = await fetch('/api/forms', {
            method:'POST',
            headers:{ 'Content-Type':'application/json' },
            body: JSON.stringify(payload)
        });
        const json = await res.json();
        savedForm = json;
        saveResult.innerHTML = `Saved form! ID: <strong>${json.id}</strong>`;
        renderPreview(json);
    } catch(err){
        console.error(err);
        saveResult.textContent = 'Error saving form';
    }
};

renderFields();
renderPreview();
