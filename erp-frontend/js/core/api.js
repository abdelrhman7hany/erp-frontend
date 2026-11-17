/* ============ 2) API LAYER — كل الاتصال بالسيرفر هنا فقط ============
   GET /api/{res}  |  POST /api/{res}  |  PUT /api/{res}/{id}  |  DELETE /api/{res}/{id} */
async function http(method, path, body) {
  const r = await fetch(CONFIG.baseUrl + path, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.status === 204 ? null : r.json();
}
const TODAY = localISO(new Date());
const seedInv = (id, p, date, partyId, partyName, status, discount, lines) => ({ id, number: p + String(id).padStart(4, '0'), date, partyId, partyName, status, discount, taxRate: 14, lines, total: (lines.reduce((s, l) => s + l.qty * l.price, 0) - discount) * 1.14 });
const Mock = {
  db: null,
  init() {
    try { this.db = JSON.parse(localStorage.getItem('erp-db')); } catch (e) {}
    if (!this.db) this.db = {
      customers: [{ id: 1, name: 'شركة النيل للتجارة', phone: '01012345678', email: 'info@nile.com', city: 'القاهرة', balance: 12500 }, { id: 2, name: 'مؤسسة الأمل', phone: '01198765432', email: 'amal@mail.com', city: 'الإسكندرية', balance: 0 }, { id: 3, name: 'محمد السيد', phone: '01255544433', email: '', city: 'شبين الكوم', balance: 3200 }],
      suppliers: [{ id: 1, name: 'الشرق للتوريدات', phone: '0233344455', email: 'sales@elsharq.com', city: 'الجيزة', balance: 8000 }, { id: 2, name: 'مصنع الدلتا', phone: '0482233445', email: '', city: 'المنوفية', balance: 1500 }],
      salesInvoices: [
        seedInv(1, 'INV-', '2026-06-14', 1, 'شركة النيل للتجارة', 'paid', 0, [{ item: 'طابعة حرارية', qty: 2, price: 3500 }]),
        seedInv(2, 'INV-', '2026-07-20', 2, 'مؤسسة الأمل', 'paid', 0, [{ item: 'شاشة 24 بوصة', qty: 4, price: 2800 }]),
        seedInv(3, 'INV-', '2026-08-09', 3, 'محمد السيد', 'paid', 200, [{ item: 'ماوس لاسلكي', qty: 10, price: 350 }]),
        seedInv(4, 'INV-', '2026-09-15', 1, 'شركة النيل للتجارة', 'paid', 0, [{ item: 'لابتوب', qty: 3, price: 18000 }]),
        seedInv(5, 'INV-', '2026-10-05', 2, 'مؤسسة الأمل', 'pending', 0, [{ item: 'طابعة حرارية', qty: 3, price: 3500 }]),
        seedInv(6, 'INV-', '2026-11-10', 1, 'شركة النيل للتجارة', 'paid', 0, [{ item: 'طابعة حرارية', qty: 2, price: 3500 }]),
        seedInv(7, 'INV-', '2026-11-14', 3, 'محمد السيد', 'draft', 0, [{ item: 'كيبورد', qty: 5, price: 600 }]),
        seedInv(8, 'INV-', TODAY, 2, 'مؤسسة الأمل', 'paid', 0, [{ item: 'شاشة 24 بوصة', qty: 2, price: 2800 }, { item: 'ماوس لاسلكي', qty: 6, price: 350 }]),
        seedInv(9, 'INV-', TODAY, 3, 'محمد السيد', 'pending', 0, [{ item: 'كيبورد', qty: 4, price: 600 }])],
      purchaseInvoices: [
        seedInv(1, 'PUR-', '2026-06-20', 1, 'الشرق للتوريدات', 'paid', 0, [{ item: 'ورق A4 (كرتونة)', qty: 30, price: 450 }]),
        seedInv(2, 'PUR-', '2026-08-02', 2, 'مصنع الدلتا', 'paid', 0, [{ item: 'قطع غيار', qty: 50, price: 120 }]),
        seedInv(3, 'PUR-', '2026-09-10', 1, 'الشرق للتوريدات', 'paid', 300, [{ item: 'أحبار طباعة', qty: 40, price: 260 }]),
        seedInv(4, 'PUR-', '2026-10-18', 2, 'مصنع الدلتا', 'pending', 0, [{ item: 'شاشات', qty: 10, price: 2200 }]),
        seedInv(5, 'PUR-', '2026-11-12', 1, 'الشرق للتوريدات', 'pending', 100, [{ item: 'ورق A4 (كرتونة)', qty: 20, price: 450 }]),
        seedInv(6, 'PUR-', TODAY, 2, 'مصنع الدلتا', 'pending', 0, [{ item: 'قطع غيار', qty: 30, price: 120 }])]
    };
  },
  save() { try { localStorage.setItem('erp-db', JSON.stringify(this.db)); } catch (e) {} }
};
Mock.init();
const PREFIX = { salesInvoices: 'INV-', purchaseInvoices: 'PUR-' };
const api = res => ({
  async list() { return CONFIG.useMock ? [...Mock.db[res]] : http('GET', `/${res}`); },
  async create(d) {
    if (!CONFIG.useMock) return http('POST', `/${res}`, d);
    const t = Mock.db[res]; d.id = Math.max(0, ...t.map(x => x.id)) + 1;
    if (PREFIX[res]) d.number = PREFIX[res] + String(d.id).padStart(4, '0');
    t.push(d); Mock.save(); return d;
  },
  async update(id, d) {
    if (!CONFIG.useMock) return http('PUT', `/${res}/${id}`, d);
    const t = Mock.db[res], i = t.findIndex(x => x.id === id); t[i] = { ...t[i], ...d }; Mock.save(); return t[i];
  },
  async remove(id) {
    if (!CONFIG.useMock) return http('DELETE', `/${res}/${id}`);
    Mock.db[res] = Mock.db[res].filter(x => x.id !== id); Mock.save();
  }
});
