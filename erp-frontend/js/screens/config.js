/* ============ 4) SCREEN DEFINITIONS — إضافة شاشة جديدة = إضافة عنصر هنا ============ */
const nameFields = [
  { key: 'name', label: 'الاسم', required: true }, { key: 'phone', label: 'الهاتف', type: 'tel' },
  { key: 'email', label: 'البريد الإلكتروني', type: 'email' }, { key: 'city', label: 'المدينة' },
  { key: 'balance', label: 'الرصيد الافتتاحي', type: 'number' }
];
const partyCols = [{ key: 'name', label: 'الاسم' }, { key: 'phone', label: 'الهاتف' }, { key: 'email', label: 'البريد' }, { key: 'city', label: 'المدينة' }, { key: 'balance', label: 'الرصيد', fmt: money }];
const SCREENS = {
  dashboard: { title: 'لوحة التحكم', kind: 'dashboard' },
  report: { title: 'التقرير اليومي', kind: 'report' },
  sales: { title: 'فاتورة المبيعات', kind: 'invoice', res: 'salesInvoices', party: 'customers', partyLabel: 'العميل', addLabel: 'فاتورة مبيعات جديدة' },
  purchases: { title: 'فاتورة المشتريات', kind: 'invoice', res: 'purchaseInvoices', party: 'suppliers', partyLabel: 'المورّد', addLabel: 'فاتورة مشتريات جديدة' },
  customers: { title: 'إدارة العملاء', kind: 'entity', res: 'customers', fields: nameFields, cols: partyCols, addLabel: 'عميل جديد', noun: 'العميل' },
  suppliers: { title: 'إدارة الموردين', kind: 'entity', res: 'suppliers', fields: nameFields, cols: partyCols, addLabel: 'مورّد جديد', noun: 'المورّد' }
};
const invoiceCols = pl => [{ key: 'number', label: 'رقم الفاتورة' }, { key: 'date', label: 'التاريخ' }, { key: 'partyName', label: pl }, { key: 'total', label: 'الإجمالي', fmt: money }, { key: 'status', label: 'الحالة', fmt: v => `<span class="badge b-${v}">${STATUS[v]}</span>`, raw: true }];
