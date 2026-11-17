/* ============ DAILY REPORT — التقرير اليومي (قابل للطباعة) ============ */
let reportDate = localISO(new Date());
async function renderDailyReport() {
  let sales, purch;
  try { [sales, purch] = await Promise.all(['salesInvoices', 'purchaseInvoices'].map(r => api(r).list())); }
  catch (e) { toast('تعذّر تحميل البيانات: ' + e.message); sales = []; purch = []; }
  const s = sales.filter(x => x.date === reportDate), p = purch.filter(x => x.date === reportDate);
  const sum = (a, f) => a.reduce((t, x) => t + (+f(x) || 0), 0);
  const st = sum(s, x => x.total), pt = sum(p, x => x.total), paid = sum(s.filter(x => x.status === 'paid'), x => x.total);
  const kpis = [['مبيعات اليوم', money(st)], ['مشتريات اليوم', money(pt)], ['الصافي', money(st - pt)], ['عدد الفواتير', s.length + p.length], ['المحصّل (مبيعات مدفوعة)', money(paid)], ['مبيعات غير محصّلة', money(st - paid)]];
  const dateText = new Date(reportDate + 'T12:00:00').toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const invTable = (list, label) => !list.length ? '<div class="empty">لا توجد فواتير في هذا اليوم.</div>' :
    `<div class="wrap"><table><thead><tr><th>رقم الفاتورة</th><th>${label}</th><th>عدد الأصناف</th><th>الإجمالي</th><th>الحالة</th></tr></thead><tbody>${list.map(x => `<tr><td>${esc(x.number)}</td><td>${esc(x.partyName)}</td><td>${x.lines.length}</td><td>${money(x.total)}</td><td><span class="badge b-${x.status}">${STATUS[x.status]}</span></td></tr>`).join('')}</tbody><tfoot><tr><td colspan="3">الإجمالي</td><td colspan="2">${money(sum(list, x => x.total))}</td></tr></tfoot></table></div>`;
  const items = {};
  s.forEach(inv => inv.lines.forEach(l => { const o = items[l.item] = items[l.item] || { qty: 0, amt: 0 }; o.qty += +l.qty || 0; o.amt += (+l.qty || 0) * (+l.price || 0); }));
  const top = Object.entries(items).sort((a, b) => b[1].amt - a[1].amt);
  const topTable = !top.length ? '<div class="empty">لا توجد مبيعات في هذا اليوم.</div>' :
    `<div class="wrap"><table><thead><tr><th>الصنف</th><th>الكمية المباعة</th><th>القيمة (قبل الخصم والضريبة)</th></tr></thead><tbody>${top.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${v.qty}</td><td>${money(v.amt)}</td></tr>`).join('')}</tbody></table></div>`;
  $('#view').innerHTML = `<div class="head"><h1>التقرير اليومي</h1><div class="rep-bar no-print">
      <button class="btn" data-day="-1" aria-label="اليوم السابق">›</button><input class="in" type="date" id="rd" value="${reportDate}"><button class="btn" data-day="1" aria-label="اليوم التالي">‹</button>
      <button class="btn" data-day="0">اليوم</button><button class="btn pri" id="print">طباعة التقرير</button></div></div>
    <p class="rep-date">${dateText}</p>
    <div class="kpis">${kpis.map(k => `<div class="card kpi"><span>${k[0]}</span><b>${k[1]}</b></div>`).join('')}</div>
    <div class="card rep"><h3>فواتير المبيعات</h3>${invTable(s, 'العميل')}</div>
    <div class="card rep"><h3>فواتير المشتريات</h3>${invTable(p, 'المورّد')}</div>
    <div class="card rep"><h3>الأصناف المباعة</h3>${topTable}</div>`;
  const go = d => { reportDate = d; renderDailyReport(); };
  $('#view').querySelectorAll('[data-day]').forEach(b => b.onclick = () => {
    const n = +b.dataset.day; if (!n) return go(localISO(new Date()));
    const d = new Date(reportDate + 'T12:00:00'); d.setDate(d.getDate() + n); go(localISO(d));
  });
  $('#rd').onchange = e => e.target.value && go(e.target.value);
  $('#print').onclick = () => { try { window.print(); } catch (e) { toast('افتح الصفحة في تبويب مستقل ثم اطبع'); } };
}
