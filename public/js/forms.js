(function () {
  if (!document.getElementById("builderRoot")) return;

  let fields = [];
  let savedForm = null;

  const titleEl = document.getElementById("formTitleInput");
  const descEl = document.getElementById("formDescInput");
  const fieldsWrap = document.getElementById("fieldsList");
  const previewWrap = document.getElementById("previewArea");
  const saveMsg = document.getElementById("saveMsg");


  function escapeHtml(s) {
    return (s || "").replace(/[&<>"']/g, (m) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[m]));
  }

  function renderFields() {
    fieldsWrap.innerHTML = "";

    fields.forEach((f, i) => {
      if (Array.isArray(f.options) && typeof f.options[0] === "object") {
        f.options = f.options.map(o => o.value); // convert prisma objects → strings
      }

      const box = document.createElement("div");
      box.className = "field-item";

      box.innerHTML = `
        <div class="field-meta">
          <input class="input" placeholder="Label"
                 value="${escapeHtml(f.label || "")}"
                 data-idx="${i}" data-prop="label"/>

          <div class="form-row" style="margin-top:8px">
            <select class="input" data-idx="${i}" data-prop="type">
              <option value="text">Text</option>
              <option value="email">Email</option>
              <option value="number">Number</option>
              <option value="textarea">Textarea</option>
              <option value="select">Select</option>
            </select>

            <input type="checkbox" data-idx="${i}" data-prop="required"
                   ${f.required ? "checked" : ""}/>
            <span class="small">Required</span>
          </div>

          <div class="small" style="margin-top:8px">Options (comma separated, for select):</div>
          <input class="input" placeholder="opt1,opt2"
                 data-idx="${i}" data-prop="options"
                 value="${(f.options || []).join(",")}"/>
        </div>

        <div class="field-controls">
          <button class="btn ghost" data-action="up" data-idx="${i}">↑</button>
          <button class="btn ghost" data-action="down" data-idx="${i}">↓</button>
          <button class="btn ghost" data-action="del" data-idx="${i}">Delete</button>
        </div>
      `;

      fieldsWrap.appendChild(box);

      box.querySelector(`select[data-prop="type"]`).value = f.type || "text";
    });
  }

  function attachFieldListeners() {
    fieldsWrap.addEventListener("input", (e) => {
      const el = e.target;
      const idx = el.dataset.idx;
      const prop = el.dataset.prop;
      if (!prop || idx == null) return;

      if (prop === "options") {
        fields[idx].options = el.value.split(",").map(s => s.trim()).filter(Boolean);
      } else {
        fields[idx][prop] = el.value;
      }
      renderPreview();
    });

    fieldsWrap.addEventListener("change", (e) => {
      const el = e.target;
      const idx = el.dataset.idx;
      const prop = el.dataset.prop;
      if (!prop || idx == null) return;

      if (prop === "required") {
        fields[idx].required = el.checked;
      } else {
        fields[idx][prop] = el.value;
      }
      renderPreview();
    });

    fieldsWrap.addEventListener("click", (e) => {
      const idx = parseInt(e.target.dataset.idx);
      const action = e.target.dataset.action;
      if (idx == null) return;

      if (action === "del") fields.splice(idx, 1);
      else if (action === "up" && idx > 0)
        fields.splice(idx - 1, 0, fields.splice(idx, 1)[0]);
      else if (action === "down" && idx < fields.length - 1)
        fields.splice(idx + 1, 0, fields.splice(idx, 1)[0]);

      renderFields();
      renderPreview();
    });
  }

  function renderPreview() {
    previewWrap.innerHTML = "";

    if (fields.length === 0) {
      previewWrap.innerHTML = `<div class="kv">No fields yet</div>`;
      return;
    }

    const form = document.createElement("form");
    form.onsubmit = (e) => {
      e.preventDefault();
      alert("Preview only — Use Save to create form.");
    };

    fields.forEach((f) => {
      const q = document.createElement("div");
      q.className = "q";
      q.innerHTML = `<label>${escapeHtml(f.label || "Untitled")}</label>`;

      let inputEl = "";

      if (f.type === "textarea") {
        inputEl = `<textarea class="input"></textarea>`;
      } else if (f.type === "select") {
        inputEl = `
          <select class="input">
            ${(f.options || []).map(o => `<option>${escapeHtml(o)}</option>`).join("")}
          </select>
        `;
      } else {
        inputEl = `<input class="input" type="${f.type || "text"}"/>`;
      }

      q.innerHTML += inputEl;
      form.appendChild(q);
    });

    previewWrap.appendChild(form);
  }


  document.getElementById("addFieldBtn").addEventListener("click", () => {
    const t = document.getElementById("newFieldType").value;

    fields.push({
      label: t.charAt(0).toUpperCase() + t.slice(1) + " field",
      type: t,
      required: false,
      options: t === "select" ? ["Option 1", "Option 2"] : []
    });

    renderFields();
    renderPreview();
  });


  document.getElementById("saveFormBtn").addEventListener("click", async () => {
    const payload = {
      title: titleEl.value || "Untitled",
      description: descEl.value || "",
      fields: fields.map((f, idx) => ({
        label: f.label || `Field ${idx + 1}`,
        type: f.type || "text",
        required: !!f.required,
        order: idx,
        options: f.options || []
      }))
    };

    try {
      const data = await apiFetch("/forms", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      savedForm = data.form || data;

      const formId = savedForm.id;
      const token = savedForm.shareToken;

      localStorage.setItem("currentFormId", formId);

      const shareUrl = `${location.origin}/views/share.html?token=${token}`;

      saveMsg.innerHTML = `
        Saved! Share Link:
        <input class="input" value="${shareUrl}" id="shareUrlInput" readonly
               style="width:70%;display:inline-block"/>
        <button class="copy-btn"
                onclick="copyToClipboard(document.getElementById('shareUrlInput').value)">
          Copy
        </button>
      `;
    } catch (err) {
      console.error(err);
      alert(err.error || err.message || "Failed to save form");
    }
  });


  window.goToSubs = function () {
    const id = localStorage.getItem("currentFormId");
    if (!id) return alert("Save a form first.");
    window.location = `/views/submissions.html?formId=${id}`;
  };

  window.goToLive = function () {
    const id = localStorage.getItem("currentFormId");
    if (!id) return alert("Save a form first.");
    window.location = `/views/dashboard.html?formId=${id}`;
  };


  renderFields();
  renderPreview();
  attachFieldListeners();
})();
