/* ============ DASHBOARD — لوحة التحكم (مبنية على نفس طبقة api، بدون مكتبات رسوم) ============ */
async function renderDashboard() {
  $('#view').innerHTML = '<div class="head"><h1>لوحة التحكم</h1></div><div id="dash"></div>';
  let sales, purch, cust, supp;
  try { [sales, purch, cust, supp] = await Promise.all(['salesInvoices', 'purchaseInvoices', 'customers', 'suppliers'].map(r => api(r).list())); }
  catch (e) { return toast('تعذّر تحميل البيانات: ' + e.message); }
  const sum = (a, f) => a.reduce((s, x) => s + (+f(x) || 0), 0);
  const st = sum(sales, x => x.total), pt = sum(purch, x => x.total);
  const open = sales.filter(x => x.status !== 'paid');
  const kpis = [
    ['إجمالي المبيعات', money(st)], ['إجمالي المشتريات', money(pt)], ['الصافي', money(st - pt)],
    ['مستحقات لدى العملاء', money(sum(cust, x => x.balance))], ['مستحقات للموردين', money(sum(supp, x => x.balance))],
    ['فواتير مبيعات غير مدفوعة', `${open.length} (${money(sum(open, x => x.total))})`]
  ];
  // آخر 6 شهور
  const now = new Date(), months = [];
  for (let i = 5; i >= 0; i--) {
    const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: m.getFullYear() + '-' + String(m.getMonth() + 1).padStart(2, '0'), label: m.toLocaleDateString('ar-EG', { month: 'short' }), s: 0, p: 0 });
  }
  sales.forEach(x => { const m = months.find(m => String(x.date).startsWith(m.key)); if (m) m.s += +x.total || 0; });
  purch.forEach(x => { const m = months.find(m => String(x.date).startsWith(m.key)); if (m) m.p += +x.total || 0; });
  const max = Math.max(1, ...months.flatMap(m => [m.s, m.p])), W = 600, step = W / 6, base = 190, bw = 24;
  const bars = months.map((m, i) => {
    const cx = W - (step * i + step / 2), hs = m.s / max * 160, hp = m.p / max * 160; // الأقدم على اليمين (RTL)
    return `<rect x="${cx + 2}" y="${base - hs}" width="${bw}" height="${hs}" rx="4" fill="var(--primary)"><title>مبيعات ${m.label}: ${money(m.s)}</title></rect>
      <rect x="${cx - bw - 2}" y="${base - hp}" width="${bw}" height="${hp}" rx="4" fill="var(--warn)"><title>مشتريات ${m.label}: ${money(m.p)}</title></rect>
      <text x="${cx}" y="212" text-anchor="middle" fill="var(--muted)" font-size="13">${m.label}</text>`;
  }).join('');
  // توزيع فواتير المبيعات حسب الحالة
  const rows = Object.entries(STATUS).map(([k, v]) => { const r = sales.filter(x => x.status === k); return { k, v, n: r.length, t: sum(r, x => x.total) }; });
  const status = rows.map(r => `<div class="srow"><div><span><span class="badge b-${r.k}">${r.v}</span> ${r.n} فاتورة</span><b>${money(r.t)}</b></div><div class="track"><div class="fill" style="width:${st ? r.t / st * 100 : 0}%"></div></div></div>`).join('');
  // آخر الفواتير
  const latest = [...sales.map(x => ({ ...x, type: 'مبيعات' })), ...purch.map(x => ({ ...x, type: 'مشتريات' }))].sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 6);
  const latestTbl = `<div class="wrap"><table><thead><tr><th>النوع</th><th>الرقم</th><th>الطرف</th><th>التاريخ</th><th>الإجمالي</th><th>الحالة</th></tr></thead><tbody>${latest.map(x => `<tr><td>${x.type}</td><td>${esc(x.number)}</td><td>${esc(x.partyName)}</td><td>${esc(x.date)}</td><td>${money(x.total)}</td><td><span class="badge b-${x.status}">${STATUS[x.status]}</span></td></tr>`).join('')}</tbody></table></div>`;
  $('#dash').innerHTML = `<div class="kpis">${kpis.map(k => `<div class="card kpi"><span>${k[0]}</span><b>${k[1]}</b></div>`).join('')}</div>
    <div class="dash"><div class="card"><h3>المبيعات والمشتريات – آخر 6 شهور</h3><div class="legend"><span><i style="background:var(--primary)"></i>مبيعات</span><span><i style="background:var(--warn)"></i>مشتريات</span></div>
      <svg viewBox="0 0 ${W} 225" width="100%" role="img" aria-label="رسم بياني للمبيعات والمشتريات"><line x1="0" x2="${W}" y1="${base}" y2="${base}" stroke="var(--border)"/>${bars}</svg></div>
      <div class="card"><h3>فواتير المبيعات حسب الحالة</h3>${status}</div></div>
    <div class="card"><h3 style="padding:16px 16px 0">آخر الفواتير</h3>${latestTbl}</div>`;
}
