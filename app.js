const DATA = window.KPI_DATA;
const state = { view: 'overview', team: '', rep: '', ward: '', search: '', mcpUnpurchased: true, growthProgram: 'seasoning' };
const titles = { overview:'Tổng quan KPI', growth:'Tăng doanh số', mbs:'Tracking MBS', display:'Tracking trưng bày', mcp:'Danh sách MCP', aso:'Doanh số & ASO' };
const el = id => document.getElementById(id);
const fmtNumber = n => new Intl.NumberFormat('vi-VN',{maximumFractionDigits:0}).format(Math.ceil(Number(n)||0));
const fmtMoney = n => fmtNumber(n)+' đ';
const fmtFull = fmtMoney;
const fmtPct = n => new Intl.NumberFormat('vi-VN',{style:'percent',minimumFractionDigits:0,maximumFractionDigits:2}).format(Number.isFinite(n)?n:0);
const esc = s => String(s??'—').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const uniq = a => [...new Set(a.filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b),'vi'));
const paceTarget = DATA.meta.progress || (DATA.meta.elapsedDays / DATA.meta.workingDays);
const color = ach => ach >= 1 ? 'green' : ach >= paceTarget*.8 ? 'amber' : 'red';
const progress = ach => `<div class="progress"><i style="width:${Math.min(Math.max(ach,0)*100,100)}%"></i></div>`;
const status = ach => `<span class="status-pill ${color(ach)}">${ach>=1?'Đạt KPI':ach>=paceTarget*.8?'Đúng tiến độ':'Cần chú ý'}</span>`;

function greeting(){
  const scope=DATA.kpis.filter(d=>(!state.team||d.team===state.team)&&(!state.rep||d.rep===state.rep));
  const actual=scope.reduce((s,d)=>s+d.actual,0),target=scope.reduce((s,d)=>s+d.target,0),ach=target?actual/target:0;
  const who=state.rep?state.rep:(state.team?`Team SS ${state.team}`:'đội ngũ kinh doanh');
  return `<section class="welcome"><div><span class="welcome-kicker">KPI THÁNG 09/2026</span><h2>Xin chào, ${esc(who)} <b>👋</b></h2><p>Doanh số thực hiện <strong>${fmtMoney(actual)}</strong>, đạt <strong>${fmtPct(ach)}</strong> trên chỉ tiêu <strong>${fmtMoney(target)}</strong>.</p></div><div class="welcome-stat"><span>Nhịp độ hiện tại</span><strong class="${color(ach)}">${ach>=paceTarget?'Đúng tiến độ':'Cần tăng tốc'}</strong><small>${DATA.meta.elapsedDays}/${DATA.meta.workingDays} ngày làm việc</small></div></section>`;
}

function sourceForView(){ return state.view==='overview' ? DATA.kpis : DATA[state.view]; }
function matches(d){
  if(state.team && d.team!==state.team) return false;
  if(state.rep && d.rep!==state.rep) return false;
  if(state.ward && d.ward!==state.ward) return false;
  if(state.search){
    const q=state.search.toLocaleLowerCase('vi');
    if(![d.rep,d.customer,d.customerCode,d.ward,d.program].some(v=>String(v||'').toLocaleLowerCase('vi').includes(q))) return false;
  }
  return true;
}
function filtered(){ return sourceForView().filter(matches); }

function optionHTML(values,current,all){return `<option value="">${all}</option>`+values.map(v=>`<option ${v===current?'selected':''}>${esc(v)}</option>`).join('')}
function syncFilters(){
  const src=sourceForView();
  const teams=uniq(src.map(d=>d.team)).sort((a,b)=>(/Pháp/i.test(b)?1:0)-(/Pháp/i.test(a)?1:0)||a.localeCompare(b,'vi'));
  if(state.team&&!teams.includes(state.team)) state.team='';
  el('teamFilter').innerHTML=optionHTML(teams,state.team,'Tất cả team');
  const reps=uniq(src.filter(d=>!state.team||d.team===state.team).map(d=>d.rep));
  if(state.rep&&!reps.includes(state.rep)) state.rep='';
  el('repFilter').innerHTML=optionHTML(reps,state.rep,'Tất cả DDKD');
  const wards=uniq(src.filter(d=>(!state.team||d.team===state.team)&&(!state.rep||d.rep===state.rep)).map(d=>d.ward));
  if(state.ward&&!wards.includes(state.ward)) state.ward='';
  el('wardFilter').innerHTML=optionHTML(wards,state.ward,'Tất cả khu vực');
  el('wardFilter').disabled=state.view==='overview';
}
function metricCard(label,value,sub,ach,icon='◆'){
 return `<article class="metric-card"><div class="metric-top"><span>${label}</span><b class="metric-icon">${icon}</b></div><div class="metric-value">${value}</div><div class="metric-sub">${sub}</div>${ach==null?'':progress(ach)}</article>`;
}
function intro(title,desc,count){return `<div class="section-intro"><div><h2>${title}</h2><p>${desc}</p></div><span class="badge">${new Intl.NumberFormat('vi-VN').format(count)} bản ghi</span></div>`}
function table(headers,rows){return `<section class="panel table-panel"><div class="table-head"><h3>Chi tiết</h3><span class="panel-note">Cuộn ngang để xem thêm</span></div><div class="table-scroll"><table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div></section>`}

function renderOverview(){
 const rows=filtered(); const target=rows.reduce((s,d)=>s+d.target,0), actual=rows.reduce((s,d)=>s+d.actual,0), ach=target?actual/target:0, gap=Math.max(target-actual,0);
 const reached=rows.filter(d=>d.achievement>=1).length, onTrack=rows.filter(d=>d.achievement>=paceTarget).length, warning=rows.filter(d=>d.achievement<paceTarget*.8).length;
 const sum=k=>rows.reduce((s,d)=>s+(d[k]||0),0), metric=(name,t,a,unit='money')=>[name,sum(t),sum(a),unit];
 const foundation=[
  ['Doanh số & tiến độ',target,actual,'money'],metric('Active ASO MCP','activeTarget','activeActual','number'),metric('ASO Chanté Active','chanteActiveTarget','chanteActiveActual','number'),
  metric('ASO Omachi trộn','omachiMixTarget','omachiMixActual','number'),metric('Tổng số PC','pcTarget','pcActual','number'),metric('PC OFF 4 Line','pcOffTarget','pcOffActual','number'),metric('Active ON Tea365','activeOnTarget','activeOnTea','number')
 ];
 const categories=[metric('Seasoning','selloutSeasoningTarget','selloutSeasoningActual'),metric('Convenience Foods','selloutConvenienceTarget','selloutConvenienceActual'),metric('Home Care','selloutHomeCareTarget','selloutHomeCareActual'),metric('Refreshment Drinks','selloutRefreshmentTarget','selloutRefreshmentActual'),metric('Processed Meats','selloutProcessedTarget','selloutProcessedActual'),metric('Nutrition','selloutNutritionTarget','selloutNutritionActual'),metric('Coffee','selloutCoffeeTarget','selloutCoffeeActual'),metric('Rice base','selloutRiceTarget','selloutRiceActual'),metric('Beer','selloutBeerTarget','selloutBeerActual')];
 const ranking=[...rows].sort((a,b)=>b.achievement-a.achievement);
 const topFive=[...rows].sort((a,b)=>b.actual-a.actual).slice(0,6),maxScale=Math.max(...topFive.map(d=>d.target),1);
 el('content').innerHTML=intro('KPI nền tảng & Sell Out',`Nguồn dữ liệu cột D–BU, sheet KPI THÁNG • Đã qua ${DATA.meta.elapsedDays}/${DATA.meta.workingDays} ngày làm việc`,rows.length)+
 `<div class="cards">${metricCard('SELL OUT TARGET',fmtMoney(target),`${rows.length} đại diện kinh doanh`,null,'◎')}${metricCard('SELL OUT THỰC HIỆN',fmtMoney(actual),`Tiến độ trong file <strong>${fmtPct(paceTarget)}</strong>`,ach,'↗')}${metricCard('TỶ LỆ HOÀN THÀNH',fmtPct(ach),`${status(ach)}`,ach,'%')}${metricCard('LPPC BÌNH QUÂN',fmtNumber(sum('lppc')/(rows.length||1)),`Mức chuẩn tối thiểu <strong>4,3</strong>`,Math.min((sum('lppc')/(rows.length||1))/4.3,1),'◫')}</div>`+
 `<div class="chart-grid"><section class="panel donut-panel"><div class="panel-head"><h3>Tiến độ Sell Out</h3><span class="panel-note">Tiến độ lấy trực tiếp từ file: ${fmtPct(paceTarget)}</span></div><div class="donut-wrap"><div class="donut" style="--value:${Math.min(ach*100,100)}"><div><strong>${fmtPct(ach)}</strong><span>hoàn thành</span></div></div><div class="donut-legend"><p><i class="actual-dot"></i><span>Thực hiện</span><strong>${fmtMoney(actual)}</strong></p><p><i class="target-dot"></i><span>Còn lại</span><strong>${fmtMoney(gap)}</strong></p><small>Chỉ tiêu: ${fmtMoney(target)}</small></div></div></section><section class="panel comparison-panel"><div class="panel-head"><div><h3>Target – Actual theo DDKD</h3><span class="panel-note">Top 6 theo doanh số • giá trị gốc</span></div><div class="chart-legend"><span><i class="target-swatch"></i>Target</span><span><i class="actual-swatch"></i>Actual</span></div></div><div class="comparison-chart">${topFive.map((d,i)=>`<div class="compare-row"><div class="compare-name"><b>${i+1}</b><span>${esc(d.rep)}</span></div><div class="compare-bars"><div class="compare-line target-line"><i style="width:${Math.max(d.target/maxScale*100,2)}%"></i><strong>${fmtMoney(d.target)}</strong></div><div class="compare-line actual-line"><i style="width:${Math.max(d.actual/maxScale*100,2)}%"></i><strong>${fmtMoney(d.actual)}</strong></div></div></div>`).join('')}</div></section></div>`+
 `<div class="grid-2"><section class="panel"><div class="panel-head"><h3>KPI nền tảng</h3><span class="panel-note">D–BU • thực hiện / chỉ tiêu</span></div><div class="performance-list">${foundation.map(([n,t,a,u])=>{const p=t?a/t:0;return `<div class="perf-row"><span>${n}</span><div class="bar"><i style="width:${Math.min(p*100,100)}%"></i></div><strong class="${color(p)}">${fmtPct(p)}</strong></div>`}).join('')}</div></section><section class="panel"><div class="panel-head"><h3>Sức khỏe đội ngũ</h3><span class="panel-note">Theo nhịp độ tháng</span></div><div class="status-grid"><div class="status-card green"><span>Đã đạt 100% KPI</span><strong>${reached}</strong></div><div class="status-card green"><span>Đúng / vượt tiến độ</span><strong>${onTrack}</strong></div><div class="status-card amber"><span>Chưa đạt 100%</span><strong>${rows.length-reached}</strong></div><div class="status-card red"><span>Cần chú ý</span><strong>${warning}</strong></div></div></section></div>`+
 `<section class="panel"><div class="panel-head"><h3>Sell Out theo ngành hàng</h3><span class="panel-note">Cột O–AO • thực hiện / chỉ tiêu</span></div><div class="sellout-grid">${categories.map(([n,t,a])=>{const p=t?a/t:0;return `<div class="sellout-item"><div><span>${n}</span><strong class="${color(p)}">${fmtPct(p)}</strong></div><small>${fmtMoney(a)} / ${fmtMoney(t)}</small>${progress(p)}</div>`}).join('')}</div></section>`+
 table(['Hạng','Đại diện KD','Team / SS','Target Sell Out','Actual Sell Out','% Sell Out','Active MCP','PC OFF','LPPC','Tiến độ'],ranking.map((d,i)=>`<tr><td><span class="rank ${i<3?'top':''}">${i+1}</span></td><td class="person">${esc(d.rep)}</td><td class="muted">${esc(d.team)}</td><td class="money">${fmtFull(d.target)}</td><td class="money">${fmtFull(d.actual)}</td><td><strong class="${color(d.achievement)}">${fmtPct(d.achievement)}</strong></td><td>${fmtNumber(d.activeActual)} / ${fmtNumber(d.activeTarget)}</td><td>${fmtNumber(d.pcOffActual)} / ${fmtNumber(d.pcOffTarget)}</td><td>${fmtNumber(d.lppc)}</td><td>${status(d.achievement)}</td></tr>`));
}

function renderGrowth(){
 const rows=filtered(); const programs={seasoning:{label:'Nhóm Gia vị',key:'seasoning'},chante:{label:'Nhãn Chanté',key:'chante'},omachi:{label:'Mì Omachi',key:'omachi'}},p=programs[state.growthProgram],K=p.key[0].toUpperCase()+p.key.slice(1),tk=p.key+'Target',ak=p.key+'Actual',pk=p.key+'Achievement';
 const t=rows.reduce((s,d)=>s+d[tk],0),a=rows.reduce((s,d)=>s+d[ak],0),ach=t?a/t:0,passed=rows.filter(d=>d[pk]>=1).length;
 el('content').innerHTML=intro('Tăng doanh số','Ba chương trình được tách riêng để theo dõi đến từng cửa hàng',rows.length)+`<div class="subtabs">${Object.entries(programs).map(([k,v])=>`<button data-program="${k}" class="${state.growthProgram===k?'active':''}">${v.label}</button>`).join('')}</div><div class="cards">${metricCard('CHỈ TIÊU '+p.label.toUpperCase(),fmtMoney(t),`${rows.length} cửa hàng`,null,'◎')}${metricCard('THỰC HIỆN',fmtMoney(a),status(ach),ach,'↗')}${metricCard('KH ĐẠT',passed,`${rows.length-passed} KH chưa đạt`,passed/(rows.length||1),'✓')}${metricCard('CÒN LẠI',fmtMoney(Math.max(t-a,0)),'Khoảng cách đến mục tiêu',null,'◷')}</div>`+table(['Mã KH','Khách hàng','Đại diện KD','Khu vực','Chỉ tiêu','Thực hiện','Còn lại','% đạt'],rows.slice(0,1500).map(d=>`<tr><td>${esc(d.customerCode)}</td><td class="person">${esc(d.customer)}</td><td>${esc(d.rep)}</td><td class="muted">${esc(d.ward)}</td><td class="money">${fmtFull(d[tk])}</td><td class="money">${fmtFull(d[ak])}</td><td class="money">${fmtFull(Math.max(d[tk]-d[ak],0))}</td><td><strong class="${color(d[pk])}">${fmtPct(d[pk])}</strong></td></tr>`));
 document.querySelectorAll('[data-program]').forEach(b=>b.onclick=()=>{state.growthProgram=b.dataset.program;render()});
}
function renderMbs(){
 const rows=filtered(),t=rows.reduce((s,d)=>s+d.target,0),a=rows.reduce((s,d)=>s+d.actual,0),ach=t?a/t:0,reward=rows.reduce((s,d)=>s+d.estimatedReward,0),passed=rows.filter(d=>/đạt(?!.*chưa)/i.test(d.rewardStatus||'')).length;
 el('content').innerHTML=intro('Tracking chương trình MBS','Doanh số nền tảng, thực hiện, điều kiện ngành hàng và thưởng dự kiến',rows.length)+`<div class="cards">${metricCard('DOANH SỐ NỀN TẢNG',fmtMoney(t),`${rows.length} hội viên`,null,'◎')}${metricCard('DOANH SỐ THỰC HIỆN',fmtMoney(a),status(ach),ach,'↗')}${metricCard('KH ĐẠT THƯỞNG',passed,`${rows.length-passed} KH còn thiếu điều kiện`,passed/(rows.length||1),'◇')}${metricCard('THƯỞNG DỰ KIẾN',fmtMoney(reward),'Theo điều kiện hiện tại',null,'₫')}</div>`+table(['Mã CH','Khách hàng','DDKD','Loại HV','DS nền tảng','DS thực hiện','% DS','Duy trì','Mở mới','Kết quả','Điều kiện còn thiếu'],rows.map(d=>`<tr><td>${esc(d.customerCode)}</td><td class="person">${esc(d.customer)}</td><td>${esc(d.rep)}</td><td>${esc(d.memberType)}</td><td class="money">${fmtFull(d.target)}</td><td class="money">${fmtFull(d.actual)}</td><td><strong class="${color(d.achievement)}">${fmtPct(d.achievement)}</strong></td><td>${esc(d.maintenance)}</td><td>${esc(d.newBrand)}</td><td>${esc(d.rewardStatus)}</td><td class="muted">${esc(d.missing)}</td></tr>`));
}
function renderDisplay(){
 const rows=filtered(),t=rows.reduce((s,d)=>s+d.target,0),a=rows.reduce((s,d)=>s+d.actual,0),ach=t?a/t:0,done=rows.filter(d=>d.actual>=d.target&&d.target>0).length,photos=rows.reduce((s,d)=>s+d.photoCaptured,0),six=rows.filter(d=>d.photoCaptured>=6||/đạt/i.test(d.photoSixStatus||'')).length,reward=rows.reduce((s,d)=>s+d.earnedReward,0);
 el('content').innerHTML=intro('Tracking trưng bày','Tích lũy doanh số, bộ hình đã chụp và tiền thưởng đủ điều kiện',rows.length)+`<div class="cards">${metricCard('THỰC HIỆN / CHỈ TIÊU',fmtPct(ach),`${fmtMoney(a)} / ${fmtMoney(t)}`,ach,'↗')}${metricCard('BỘ HÌNH ĐÃ CHỤP',new Intl.NumberFormat('vi-VN').format(photos),`${six} điểm đạt từ 6 bộ`,null,'◫')}${metricCard('ĐIỂM ĐẠT TÍCH LŨY',done,`${rows.length-done} điểm chưa đạt`,done/(rows.length||1),'✓')}${metricCard('THƯỞNG ĐỦ ĐIỀU KIỆN',fmtMoney(reward),'Tính theo mức thưởng tối đa',null,'₫')}</div>`+table(['Chương trình','Mức','Mã KH','Khách hàng','DDKD','Chỉ tiêu','Thực hiện','Bộ hình đã chụp','≥ 6 bộ','Thưởng nếu đạt tích lũy'],rows.map(d=>{const p=d.target?d.actual/d.target:0,photoOk=d.photoCaptured>=6||/đạt/i.test(d.photoSixStatus||'');return `<tr><td>${esc(d.program)}</td><td>${esc(d.level)}</td><td>${esc(d.customerCode)}</td><td class="person">${esc(d.customer)}</td><td>${esc(d.rep)}</td><td class="money">${fmtFull(d.target)}</td><td class="money">${fmtFull(d.actual)}</td><td>${d.photoCaptured}</td><td><span class="status-pill ${photoOk?'green':'red'}">${photoOk?'Đạt':'Chưa đạt'}</span></td><td class="money"><strong class="${d.earnedReward?'green':'muted'}">${fmtFull(d.earnedReward)}</strong></td></tr>`}));
}
function renderMcp(){
 let rows=filtered(); if(state.mcpUnpurchased) rows=rows.filter(d=>!d.purchased); const purchased=filtered().filter(d=>d.purchased).length,total=filtered().length,active=rows.reduce((s,d)=>s+d.activeTotal,0),sales=rows.reduce((s,d)=>s+d.totalSales,0);
 el('content').innerHTML=`<div class="section-intro"><div><h2>MCP theo trạng thái mua hàng</h2><p>Ưu tiên danh sách cửa hàng chưa phát sinh doanh số trong tháng</p></div><button id="purchaseToggle" class="badge" style="border:0;cursor:pointer">${state.mcpUnpurchased?'Đang lọc: Chưa mua':'Hiển thị: Tất cả'}</button></div><div class="cards">${metricCard('TỔNG KH',fmtNumber(total),'Trong phạm vi bộ lọc',null,'◎')}${metricCard('CHƯA MUA',fmtNumber(total-purchased),`${fmtPct((total-purchased)/(total||1))} tổng KH`,(total-purchased)/(total||1),'!')}${metricCard('ĐÃ MUA',fmtNumber(purchased),`${fmtPct(purchased/(total||1))} tổng KH`,purchased/(total||1),'✓')}${metricCard('DOANH SỐ NHÓM ĐANG XEM',fmtMoney(sales),`${fmtNumber(active)} lượt active`,null,'₫')}</div>`+table(['Mã KH','Khách hàng','Team / SS','DDKD','Khu vực','Tuyến','DS 3 tháng','DS tháng','Trạng thái'],rows.map(d=>`<tr><td>${esc(d.customerCode)}</td><td class="person">${esc(d.customer)}</td><td>${esc(d.team)}</td><td>${esc(d.rep)}</td><td class="muted">${esc(d.ward)}</td><td>${esc(d.routeDay)}</td><td class="money">${fmtFull(d.threeMonthSales)}</td><td class="money">${fmtFull(d.totalSales)}</td><td><span class="status-pill ${d.purchased?'green':'red'}">${d.purchased?'Đã mua':'Chưa mua'}</span></td></tr>`));
 el('purchaseToggle').onclick=()=>{state.mcpUnpurchased=!state.mcpUnpurchased;render()};
}
function renderAso(){
 const rows=filtered(),target=rows.reduce((s,d)=>s+d.target,0),actual=rows.reduce((s,d)=>s+d.actual,0),ach=target?actual/target:0,mcpOff=rows.reduce((s,d)=>s+d.mcpOff,0),mcpOn=rows.reduce((s,d)=>s+d.mcpOn,0),pcTarget=rows.reduce((s,d)=>s+d.pcTarget,0),pcActual=rows.reduce((s,d)=>s+d.pcActual,0),pcAch=pcTarget?pcActual/pcTarget:0;
 const groups=Object.entries(rows.reduce((acc,d)=>{(acc[d.ward||'Chưa xác định']??=[]).push(d);return acc},{})).map(([ward,reps])=>{const wt=reps.reduce((s,d)=>s+d.target,0),wa=reps.reduce((s,d)=>s+d.actual,0),wpt=reps.reduce((s,d)=>s+d.pcTarget,0),wpa=reps.reduce((s,d)=>s+d.pcActual,0);return{ward,reps,target:wt,actual:wa,achievement:wt?wa/wt:0,mcpOff:reps.reduce((s,d)=>s+d.mcpOff,0),mcpOn:reps.reduce((s,d)=>s+d.mcpOn,0),pcTarget:wpt,pcActual:wpa,pcAchievement:wpt?wpa/wpt:0,lppc:reps.reduce((s,d)=>s+d.lppc,0)/(reps.length||1)}}).sort((a,b)=>b.actual-a.actual);
 const maxScale=Math.max(...groups.map(d=>d.target),1);
 const wardDetails=groups.map((g,gi)=>`<details class="ward-group" open><summary><div class="ward-title"><span class="ward-icon">⌖</span><div><strong>${esc(g.ward)}</strong><small>${g.reps.length} DDKD • MCP ${fmtNumber(g.mcpOff+g.mcpOn)}</small></div></div><div class="ward-kpis"><span><small>Chỉ tiêu</small><strong>${fmtMoney(g.target)}</strong></span><span><small>Thực hiện</small><strong>${fmtMoney(g.actual)}</strong></span><span><small>Tiến độ</small><strong class="${color(g.achievement)}">${fmtPct(g.achievement)}</strong></span><b class="chevron">⌄</b></div></summary><div class="ward-table"><table><thead><tr><th>DDKD</th><th>Mã</th><th>MCP OFF</th><th>MCP ON</th><th>Chỉ tiêu DS</th><th>Thực hiện DS</th><th>% DS</th><th>PC 4 Line</th><th>% PC</th><th>LPPC</th><th>Mức LPPC</th></tr></thead><tbody>${[...g.reps].sort((a,b)=>b.actual-a.actual).map(d=>`<tr><td class="person">${esc(d.rep)}</td><td>${esc(d.code)}</td><td>${fmtNumber(d.mcpOff)}</td><td>${fmtNumber(d.mcpOn)}</td><td class="money">${fmtMoney(d.target)}</td><td class="money">${fmtMoney(d.actual)}</td><td><strong class="${color(d.achievement)}">${fmtPct(d.achievement)}</strong></td><td>${fmtNumber(d.pcActual)} / ${fmtNumber(d.pcTarget)}</td><td>${fmtPct(d.pcAchievement)}</td><td>${fmtNumber(d.lppc)}</td><td>${esc(d.lppcLevel)}</td></tr>`).join('')}</tbody></table></div></details>`).join('');
 el('content').innerHTML=intro('Dashboard Doanh số & ASO','Phân cấp Phường → DDKD, nhấn từng phường để thu gọn hoặc mở chi tiết',rows.length)+`<div class="cards">${metricCard('MCP OFF',fmtNumber(mcpOff),`${fmtNumber(mcpOn)} MCP ON`,null,'◎')}${metricCard('CHỈ TIÊU DOANH SỐ',fmtMoney(target),`${groups.length} phường • ${rows.length} DDKD`,null,'◫')}${metricCard('THỰC HIỆN DOANH SỐ',fmtMoney(actual),status(ach),ach,'↗')}${metricCard('PC 4 LINE',`${fmtNumber(pcActual)} / ${fmtNumber(pcTarget)}`,`Hoàn thành ${fmtPct(pcAch)}`,pcAch,'◇')}</div><section class="panel aso-chart"><div class="panel-head"><div><h3>Phân tích Target – Actual theo phường</h3><span class="panel-note">Tỷ lệ giữ số thập phân từ dữ liệu nguồn</span></div><div class="chart-legend"><span><i class="target-swatch"></i>Chỉ tiêu</span><span><i class="actual-swatch"></i>Thực hiện</span></div></div><div class="comparison-chart">${groups.map((g,i)=>`<div class="compare-row"><div class="compare-name"><b>${i+1}</b><span>${esc(g.ward)}</span></div><div class="compare-bars"><div class="compare-line target-line"><i style="width:${Math.max(g.target/maxScale*100,2)}%"></i><strong>${fmtMoney(g.target)}</strong></div><div class="compare-line actual-line"><i style="width:${Math.max(g.actual/maxScale*100,2)}%"></i><strong>${fmtMoney(g.actual)} • ${fmtPct(g.achievement)}</strong></div></div></div>`).join('')}</div></section><section class="ward-section"><div class="ward-section-head"><div><span class="section-icon">⌖</span><div><h3>Chi tiết theo phường</h3><p>Mở từng phường để xem DDKD và toàn bộ chỉ số</p></div></div><span>${groups.length} phường</span></div>${wardDetails}</section>`;
}
function render(){ syncFilters(); el('pageTitle').textContent=titles[state.view]; ({overview:renderOverview,growth:renderGrowth,mbs:renderMbs,display:renderDisplay,mcp:renderMcp,aso:renderAso}[state.view])(); el('content').insertAdjacentHTML('afterbegin',greeting()); }

document.querySelectorAll('.nav-item').forEach(b=>b.onclick=()=>{document.querySelectorAll('.nav-item').forEach(x=>x.classList.remove('active'));b.classList.add('active');state.view=b.dataset.view;state.rep='';state.ward='';state.search='';el('searchInput').value='';document.querySelector('.sidebar').classList.remove('open');render()});
el('teamFilter').onchange=e=>{state.team=e.target.value;state.rep='';state.ward='';render()};
el('repFilter').onchange=e=>{state.rep=e.target.value;state.ward='';render()};
el('wardFilter').onchange=e=>{state.ward=e.target.value;render()};
el('searchInput').oninput=e=>{state.search=e.target.value;render()};
el('resetFilters').onclick=()=>{state.team='';state.rep='';state.ward='';state.search='';el('searchInput').value='';render()};
el('menuButton').onclick=()=>document.querySelector('.sidebar').classList.toggle('open');

const preferredTeam=uniq(DATA.kpis.map(d=>d.team)).find(t=>/Nguyễn Văn Pháp|SS Pháp/i.test(t));
if(preferredTeam) state.team=preferredTeam;
render();
