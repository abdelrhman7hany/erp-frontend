/* ============ 7) ROUTER ============ */
$('#nav').innerHTML = `<a href="#dashboard" data-id="dashboard">${SCREENS.dashboard.title}</a>` + '<small>العمليات</small>' + ['sales', 'purchases'].map(k => `<a href="#${k}" data-id="${k}">${SCREENS[k].title}</a>`).join('') + '<small>الأطراف</small>' + ['customers', 'suppliers'].map(k => `<a href="#${k}" data-id="${k}">${SCREENS[k].title}</a>`).join('') + '<small>التقارير</small>' + `<a href="#report" data-id="report">${SCREENS.report.title}</a>`;
const route = () => { state.q = ''; state.sort = { key: '', dir: 1 }; showScreen(location.hash.slice(1)); };
addEventListener('hashchange', route);
route();
