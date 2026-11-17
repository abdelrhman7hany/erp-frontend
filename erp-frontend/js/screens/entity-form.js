/* ---- Entity form (عملاء / موردين) ---- */
function entityForm(S, rec, A, reload) {
  const body = `<div class="grid">${S.fields.map(f => `<div><label>${f.label}${f.required ? ' *' : ''}</label><input class="in" name="${f.key}" type="${f.type || 'text'}" ${f.required ? 'required' : ''} ${f.type === 'number' ? 'step="0.01"' : ''} value="${esc(rec ? rec[f.key] : '')}"></div>`).join('')}</div>`;
  modal(rec ? `تعديل ${S.noun}` : S.addLabel, body, async form => {
    const d = Object.fromEntries(new FormData(form));
    d.balance = +d.balance || 0;
    rec ? await A.update(rec.id, d) : await A.create(d);
    toast('تم الحفظ'); reload();
  });
}
