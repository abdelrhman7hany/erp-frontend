# ERP Front-End

واجهات نظام ERP: لوحة التحكم، فاتورة المبيعات، فاتورة المشتريات، إدارة العملاء، إدارة الموردين، التقرير اليومي.
HTML + CSS + JavaScript (بدون مكتبات أو build). افتح `index.html` مباشرة في المتصفح.

## هيكل الملفات
```
erp-frontend/
├── index.html
├── css/style.css                 التصميم الموحد (متغيرات الألوان + الوضع الداكن + الطباعة)
└── js/
    ├── core/
    │   ├── config.js             إعدادات: عنوان الـ API، الضريبة، العملة، وضع البيانات التجريبية
    │   ├── helpers.js            دوال مساعدة (تنسيق العملة، الحماية من XSS، التنبيهات، التاريخ)
    │   └── api.js                كل الاتصال بالسيرفر هنا + بيانات تجريبية (Mock)
    ├── components/
    │   └── ui.js                 مكوّنات مشتركة: المودال، نافذة التأكيد، الجدول
    ├── screens/
    │   ├── config.js             تعريف الشاشات (SCREENS) وأعمدة الجداول
    │   ├── list-page.js          صفحة القائمة العامة (بحث، ترتيب، إضافة، تعديل، حذف)
    │   ├── entity-form.js        نموذج العميل / المورّد
    │   ├── invoice-form.js       نموذج فاتورة المبيعات / المشتريات (أصناف، خصم، ضريبة)
    │   ├── dashboard.js          لوحة التحكم
    │   └── report.js             التقرير اليومي (قابل للطباعة)
    └── app.js                    القائمة الجانبية والتنقل (hash routing)
```
> الترتيب في `index.html` مهم: كل ملف يعتمد على اللي قبله.

## الربط مع ASP.NET Core Web API
1. في `js/core/config.js`: غيّر `baseUrl` واجعل `useMock: false`.
2. فعّل CORS في الـ API.
3. الـ Endpoints المطلوبة (لكل resource):

```
GET    /api/{resource}        -> قائمة
POST   /api/{resource}        -> إنشاء (يرجع السجل)
PUT    /api/{resource}/{id}   -> تعديل
DELETE /api/{resource}/{id}   -> حذف (204)
```
الـ resources: `customers`, `suppliers`, `salesInvoices`, `purchaseInvoices`

> الـ JSON بالشكل camelCase (الافتراضي في ASP.NET Core). رقم الفاتورة (`number`) يُولَّد من السيرفر.
> لوحة التحكم والتقرير اليومي يقرآن من نفس الـ endpoints؛ للبيانات الكبيرة يُفضّل endpoint مخصص للإحصائيات / لفواتير يوم محدد (التعديل في `screens/dashboard.js` و`screens/report.js`).

### شكل بيانات الفاتورة
```json
{ "id": 1, "number": "INV-0001", "date": "2026-11-10", "partyId": 1, "partyName": "...",
  "status": "paid|pending|draft", "discount": 0, "taxRate": 14, "total": 7980,
  "lines": [{ "item": "...", "qty": 2, "price": 3500 }] }
```
### شكل بيانات العميل/المورّد
```json
{ "id": 1, "name": "...", "phone": "...", "email": "...", "city": "...", "balance": 0 }
```

## إضافة شاشة جديدة
1. أضف عنصر في `SCREENS` داخل `js/screens/config.js` (نوعه `entity` أو `invoice`).
2. أضف رابطها في القائمة داخل `js/app.js`.
