/* ============ 6) PAGE CONTROLLER (يخدم الشاشات الأربعة) ============ */
const state = { q: '', sort: { key: '', dir: 1 } };
async function showScreen(id) {
  const S = SCREENS[id] || SCREENS.dashboard; id = SCREENS[id] ? id : 'dashboard';
  document.querySelectorAll('#nav a').forEach(a => a.classList.toggle('on', a.dataset.id === id));
  if (S.kind === 'dashboard') return renderDashboard();
  if (S.kind === 'report') return renderDailyReport();
  const cols = S.kind === 'invoice' ? invoiceCols(S.partyLabel) : S.cols;
  const A = api(S.res);
  let all = [];
  try { all = await A.list(); } catch (e) { toast('تعذّر تحميل البيانات: ' + e.message); }
  const draw = () => {
    const q = state.q.trim().toLowerCase();
    let rows = all.filter(r => !q || cols.some(c => String(r[c.key] ?? '').toLowerCase().includes(q)));
    const { key, dir } = state.sort;
    if (key) rows.sort((a, b) => (a[key] > b[key] ? 1 : a[key] < b[key] ? -1 : 0) * dir);
    const sum = all.reduce((s, r) => s + (+(S.kind === 'invoice' ? r.total : r.balance) || 0), 0);
    $('#tbl').innerHTML = dataTable(cols, rows, state.sort);
    $('#stats').innerHTML = `<div class="card stat"><b>${all.length}</b><span>إجمالي السجلات</span></div><div class="card stat"><b>${money(sum)}</b><span>${S.kind === 'invoice' ? 'إجمالي الفواتير' : 'إجمالي الأرصدة'}</span></div>`;
  };
  $('#view').innerHTML = `<div class="head"><h1>${S.title}</h1><input class="search" id="q" type="search" placeholder="بحث..." value="${esc(state.q)}"><button class="btn pri" id="add">+ ${S.addLabel}</button></div><div class="stats" id="stats"></div><div class="card" id="tbl"></div>`;
  draw();
  const reload = () => showScreen(id);
  const open = rec => (S.kind === 'invoice' ? invoiceForm(S, rec, A, reload) : entityForm(S, rec, A, reload));
  $('#q').oninput = e => { state.q = e.target.value; draw(); };
  $('#add').onclick = () => open(null);
  $('#tbl').onclick = e => {
    const t = e.target, th = t.closest('[data-sort]');
    if (th) { const k = th.dataset.sort; state.sort = { key: k, dir: state.sort.key === k ? -state.sort.dir : 1 }; return draw(); }
    if (t.dataset.edit) open(all.find(r => r.id == t.dataset.edit));
    if (t.dataset.del) confirmBox('سيتم حذف هذا السجل نهائيًا. هل تريد المتابعة؟', async () => { await A.remove(+t.dataset.del); toast('تم الحذف'); reload(); });
  };
}
