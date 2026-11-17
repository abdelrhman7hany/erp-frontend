/* ---- Invoice form (مبيعات / مشتريات) ---- */
async function invoiceForm(S, rec, A, reload) {
  let parties = [];
  try { parties = await api(S.party).list(); } catch (e) { toast('تعذّر تحميل ' + S.partyLabel); }
  const inv = rec ? structuredClone(rec) : { date: new Date().toISOString().slice(0, 10), status: 'draft', discount: 0, taxRate: CONFIG.taxRate, lines: [{ item: '', qty: 1, price: 0 }] };
  const body = `<div class="grid">
    <div><label>${S.partyLabel} *</label><select class="in" name="partyId" required><option value="">اختر...</option>${parties.map(p => `<option value="${p.id}" ${p.id === inv.partyId ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select></div>
    <div><label>التاريخ</label><input class="in" type="date" name="date" required value="${inv.date}"></div>
    <div><label>الحالة</label><select class="in" name="status">${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${k === inv.status ? 'selected' : ''}>${v}</option>`).join('')}</select></div></div>
    <div class="lines wrap"><table><thead><tr><th>الصنف</th><th style="width:90px">الكمية</th><th style="width:130px">السعر</th><th style="width:130px">الإجمالي</th><th></th></tr></thead><tbody id="ln"></tbody></table></div>
    <button type="button" class="btn sm" id="addln" style="margin-top:8px">+ إضافة صنف</button>
    <div class="grid" style="margin-top:14px"><div><label>الخصم</label><input class="in" type="number" min="0" step="0.01" name="discount" value="${inv.discount}"></div><div><label>الضريبة %</label><input class="in" type="number" min="0" step="0.01" name="taxRate" value="${inv.taxRate}"></div></div>
    <div class="tot"><div><span>المجموع</span><span id="t-sub"></span></div><div><span>الضريبة</span><span id="t-tax"></span></div><div class="g"><span>الإجمالي</span><span id="t-tot"></span></div></div>`;
  const ov = modal(rec ? `تعديل ${rec.number}` : S.addLabel, body, async form => {
    const f = Object.fromEntries(new FormData(form));
    const lines = inv.lines.filter(l => l.item.trim());
    if (!lines.length) throw new Error('أضف صنفًا واحدًا على الأقل');
    const p = parties.find(x => x.id == f.partyId);
    const d = { date: f.date, status: f.status, partyId: p.id, partyName: p.name, discount: +f.discount || 0, taxRate: +f.taxRate || 0, lines, total: calc(lines, f.discount, f.taxRate).total };
    rec ? await A.update(rec.id, d) : await A.create(d);
    toast('تم الحفظ'); reload();
  });
  const calc = (lines, disc, rate) => {
    const sub = lines.reduce((s, l) => s + (+l.qty || 0) * (+l.price || 0), 0), net = Math.max(0, sub - (+disc || 0)), tax = net * (+rate || 0) / 100;
    return { sub, tax, total: net + tax };
  };
  const totals = () => {
    const f = ov.querySelector('form'), c = calc(inv.lines, f.elements.discount.value, f.elements.taxRate.value);
    ov.querySelector('#t-sub').textContent = money(c.sub); ov.querySelector('#t-tax').textContent = money(c.tax); ov.querySelector('#t-tot').textContent = money(c.total);
    ov.querySelectorAll('[data-lt]').forEach((el, i) => el.textContent = money((+inv.lines[i].qty || 0) * (+inv.lines[i].price || 0)));
  };
  const drawLines = () => {
    ov.querySelector('#ln').innerHTML = inv.lines.map((l, i) => `<tr><td><input class="in" data-i="${i}" data-k="item" value="${esc(l.item)}" placeholder="اسم الصنف"></td><td><input class="in" type="number" min="0" step="any" data-i="${i}" data-k="qty" value="${l.qty}"></td><td><input class="in" type="number" min="0" step="0.01" data-i="${i}" data-k="price" value="${l.price}"></td><td data-lt></td><td><button type="button" class="btn sm del" data-rm="${i}" aria-label="حذف الصنف">✕</button></td></tr>`).join('');
    totals();
  };
  ov.addEventListener('input', e => { const d = e.target.dataset; if (d.k) inv.lines[d.i][d.k] = e.target.value; totals(); });
  ov.addEventListener('click', e => {
    if (e.target.id === 'addln') { inv.lines.push({ item: '', qty: 1, price: 0 }); drawLines(); }
    if (e.target.dataset.rm !== undefined && inv.lines.length > 1) { inv.lines.splice(+e.target.dataset.rm, 1); drawLines(); }
  });
  drawLines();
}
