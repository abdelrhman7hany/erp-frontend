/* ============ 5) UI COMPONENTS ============ */
function modal(title, body, onSubmit) {
  const ov = document.createElement('div'); ov.className = 'ov';
  ov.innerHTML = `<form class="card modal"><h2>${esc(title)}</h2>${body}<div class="foot"><button type="button" class="btn" data-x>إلغاء</button><button class="btn pri">حفظ</button></div></form>`;
  document.body.append(ov);
  const close = () => ov.remove();
  ov.querySelector('[data-x]').onclick = close;
  ov.addEventListener('mousedown', e => { if (e.target === ov) close(); });
  ov.querySelector('form').onsubmit = async e => { e.preventDefault(); try { await onSubmit(ov.querySelector('form')); close(); } catch (err) { toast('حدث خطأ: ' + err.message); } };
  const f = ov.querySelector('input,select'); f && f.focus();
  return ov;
}
function confirmBox(text, onYes) {
  const ov = document.createElement('div'); ov.className = 'ov';
  ov.innerHTML = `<div class="card modal" style="width:380px"><h2>تأكيد الحذف</h2><p>${esc(text)}</p><div class="foot"><button class="btn" data-n>إلغاء</button><button class="btn pri" data-y>حذف</button></div></div>`;
  document.body.append(ov);
  ov.querySelector('[data-n]').onclick = () => ov.remove();
  ov.querySelector('[data-y]').onclick = async () => { await onYes(); ov.remove(); };
}
function dataTable(cols, rows, sort) {
  if (!rows.length) return '<div class="empty">لا توجد بيانات مطابقة. ابدأ بإضافة سجل جديد.</div>';
  const arrow = k => sort.key === k ? (sort.dir > 0 ? ' ▲' : ' ▼') : '';
  return `<div class="wrap"><table><thead><tr>${cols.map(c => `<th data-sort="${c.key}">${c.label}${arrow(c.key)}</th>`).join('')}<th></th></tr></thead><tbody>${rows.map(r => `<tr>${cols.map(c => `<td>${c.fmt ? (c.raw ? c.fmt(r[c.key]) : esc(c.fmt(r[c.key]))) : esc(r[c.key])}</td>`).join('')}<td class="act"><button class="btn sm" data-edit="${r.id}">تعديل</button><button class="btn sm del" data-del="${r.id}">حذف</button></td></tr>`).join('')}</tbody></table></div>`;
}
