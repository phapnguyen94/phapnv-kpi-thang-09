/* ===== BÁO CÁO NGÀY · BẢN MỚI THEO MẪU EXCEL (tính từ DT Onetech) ===== */
function rvCss3(){if(document.getElementById('rv-css3'))return;const s=document.createElement('style');s.id='rv-css3';s.textContent=`
#v11 .rvx-banner{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:10px;border-radius:16px;padding:16px 22px;margin:0 0 12px;background:linear-gradient(115deg,#142a8f,#1b3fc2 60%,#0f766e);color:#fff}
#v11 .rvx-banner b{font-size:19px;letter-spacing:.01em}#v11 .rvx-banner span{background:rgba(255,255,255,.18);padding:6px 14px;border-radius:99px;font-weight:800;font-size:14px}
#v11 .rvx-src{font-size:12px;color:#5b6a95;margin:0 0 12px}#v11 .rvx-src em{font-style:normal;font-weight:800;color:#15803d;margin-left:8px}#v11 .rvx-src em.w{color:#b45309}
#v11 .rvx-info{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px 14px;background:#f5f7fd;border:1px solid #dfe6f7;border-radius:14px;padding:12px 16px;margin:0 0 16px}
#v11 .rvx-info div{display:flex;justify-content:space-between;gap:8px;font-size:12.5px;border-bottom:1px dashed #e0e6f5;padding:3px 0}#v11 .rvx-info div span{color:#6a7596}#v11 .rvx-info div b{color:#14206b;text-align:right}
#v11 table.rvx{border-collapse:separate;border-spacing:0;font-size:12px;background:#fff}
#v11 table.rvx th{background:var(--g,#14206b)!important;padding:7px 8px;color:#fff!important;font-weight:800;text-align:center;border-right:1px solid rgba(255,255,255,.25);line-height:1.25;white-space:normal}
#v11 table.rvx td{padding:6px 8px;text-align:right;border-bottom:1px solid #edf0f8;border-right:1px solid #f1f3fa;white-space:nowrap;background:#fff!important;color:#1f2a4d!important}
#v11 table.rvx td.l,#v11 table.rvx th.l{text-align:left}
#v11 table.rvx tr.tot td{background:#eef2ff!important;font-weight:900;border-top:2px solid #c7d2f5}
#v11 table.rvx td.kq{font-weight:800}
#v11 table.rvx td.grpL{border-left:2px solid #c7d2f5}
#v11 table.rvx .rvp{display:inline-block;min-width:54px;padding:2px 8px;border-radius:99px;font-weight:800;text-align:center}
#v11 table.rvx .up{color:#15803d!important;font-weight:800}#v11 table.rvx .dn{color:#dc2626!important;font-weight:800}#v11 table.rvx td.l{white-space:normal;min-width:230px}#v11 table.rvx td small{color:#8a95b8!important}
#v11 .rvx-det{overflow:auto;border:1px solid #dfe6f7;border-radius:14px;max-height:78vh}
#v11 .rvx-det table.rvx{min-width:4300px}
#v11 .rvx-det td.stk{position:sticky;left:0;z-index:2;background:#fff!important;text-align:left;min-width:170px;box-shadow:2px 0 0 #dfe6f7}
#v11 .rvx-det th.stk{position:sticky;left:0;text-align:left;min-width:170px}#v11 .rvx-det tr.tot td.stk{background:#eef2ff!important}
#v11 .rvx-det thead th{position:sticky;top:0;z-index:3}#v11 .rvx-det thead tr:nth-child(2) th{top:34px;z-index:3}
#v11 .rvx-det thead th.stk{z-index:5}
#v11 .rvx-det small{display:block;color:#8a95b8;font-size:10px;font-weight:600}
#v11 .rvx-leg{display:flex;flex-wrap:wrap;gap:14px;font-size:12px;color:#5b6a95;margin:8px 2px 0}#v11 .rvx-leg i{display:inline-block;width:12px;height:12px;border-radius:3px;margin-right:5px;vertical-align:-2px}
#v11 .rvx-sum{overflow:auto;border:1px solid #dfe6f7;border-radius:14px}#v11 .rvx-sum table.rvx{min-width:1150px;width:100%}
#v11 .rvx-notes{font-size:12.5px;line-height:1.6;color:#44507a;background:#fafbff;border:1px solid #e3e8f7;border-radius:12px;padding:12px 16px;margin-top:10px}
`;document.head.appendChild(s)}
function rvPhap(R,tg,n){
 rvCss3();
 const nf=(x,d)=>x==null||typeof x==='string'?(x||'–'):x.toLocaleString('vi-VN',{minimumFractionDigits:d,maximumFractionDigits:d});
 const au=x=>x==null?'–':(Math.abs(x-Math.round(x))<1e-9?nf(x,0):nf(x,1));
 const P=x=>x==null?'–':(x*100).toLocaleString('vi-VN',{minimumFractionDigits:1,maximumFractionDigits:1})+'%';
 const c4=r=>r>=1.1?['#ede0ff','#5b21b6']:r>=1?['#d7f5e1','#15803d']:r>=.9?['#fdf0b8','#a16207']:['#fee0e0','#dc2626'];
 const pill=(p,rel)=>p==null?'<span style="color:#9aa5c4">–</span>':(()=>{const k=c4(rel?p/(tg||1):p);return `<span class="rvp" style="background:${k[0]};color:${k[1]}">${P(p)}</span>`})();
 const gap=(x,d)=>{if(x==null)return '<span style="color:#9aa5c4">–</span>';const t=d==null?au(x):nf(x,d),z=Math.abs(x)<1e-9||/^-?0([,.]0+)?$/.test(t);return `<span class="${z?'':x>0?'up':'dn'}">${z?'0':(x>0?'+':'')+t}</span>`};
 const dmy=s=>{const m=String(s||'').match(/(\d{4})-(\d{2})-(\d{2})/);return m?m[3]+'/'+m[2]+'/'+m[1]:s};
 const I=R.info,pc=k=>P(parseFloat(I[k]));
 const c=R.cards,cc=['#1c3fb5','#6a2fe0','#c2500c','#0f766e'];
 const col=r=>r>=1.1?'#7c3aed':r>=1?'#16a34a':r>=.9?'#d99a06':'#dc2626';
 const bar=p=>`<div class="pbar" style="--pc:${col(p/(tg||1))}"><i style="width:${Math.max(0,Math.min(100,(p||0)*100))}%"></i><u style="left:${tg*100}%" title="Tiến độ thời gian ${P(tg)}"></u></div>`;
 let out='';
 const warn=/⚠|ℹ/.test(R.ok||'');
 out+=`<div class="rvx-banner"><b>${esc2(R.title)}</b><span>${esc2(R.date)}</span></div><div class="rvx-src">${esc2(R.src)}<em class="${warn?'w':''}">${esc2(R.ok)}</em></div>`;
 const items=[['Giám sát',I['Giám sát']],['Ngày báo cáo',dmy(I['Ngày báo cáo'])],['Chuỗi ngày DT Onetech',I['Chuỗi ngày DT Onetech']],['CT LPPC (không Meat/Bia)',I['CT LPPC (không Meat/Bia)']],
  ['Tổng ĐDKD',I['Tổng ĐDKD']],['Ngày đã qua',I['Ngày đã qua']],['Thứ (lịch Visit MCP)',I['Thứ (lịch Visit MCP)']],['% Target Hội viên / tổng HV',pc('% Target Hội viên / tổng HV')],
  ['% Times gone',P(tg)],['Tổng ngày kỳ',I['Tổng ngày kỳ']],['Ngày công còn lại*',I['Ngày công còn lại*']],['Tuần MCP',I['Tuần MCP']],
  ['Đơn mới nhất',dmy(I['Đơn mới nhất'])],['% Target PC / call',pc('% Target PC / call')],['% Target ASO OFF+ON / call',pc('% Target ASO OFF+ON / call')],['% Target Combo OFF / mục tiêu',pc('% Target Combo OFF / mục tiêu')]];
 out+=`<div class="rvx-info">${items.map(x=>`<div><span>${esc2(x[0])}</span><b>${esc2(x[1])}</b></div>`).join('')}</div>`;
 n++;out+=`<div class="sec"><b>${n}</b>TỔNG QUAN BÁO CÁO NGÀY · TEAM SS PHÁP</div><div class="rvk4">`+c.map((x,i)=>{const m=x.s.match(/TH ([\d.,]+) \/ CT ([\d.,]+)/),d=x.s.match(/TH ngày ([\d.,]+)/),t=x.t.split('·');
  return `<div class="rvk" style="--c:${cc[i]};--pc:${col(x.p/(tg||1))}"><div class="t">${esc2(t[0].trim())}${t[1]?' · '+esc2(t[1].trim()):''}</div><div class="p">${P(x.p)}</div><div class="v">TH cộng dồn <b>${m?m[1]:'–'}</b> / CT <b>${m?m[2]:'–'}</b></div>${bar(x.p)}<div class="ft"><span>${d?'TH ngày <b>'+d[1]+'</b>':''}</span><span>vạch = ${P(tg)} thời gian</span></div></div>`}).join('')+`</div>`;
 /* bảng KPI trong ngày / cộng dồn / đánh giá */
 const dec=r=>String(r[0]).startsWith('4/')?2:(String(r[0]).startsWith('1/')?1:0);
 const sr=R.summ.map((r,i)=>{const d=dec(r),f=x=>d===0&&x!=null&&typeof x==='number'?au(x):nf(x,d),st=String(r[13]||''),ok=st.includes('▲');
  return `<tr><td class="l" style="font-weight:800">${esc2(r[0])}</td><td>${f(r[1])}</td><td>${f(r[2])}</td><td class="kq">${f(r[3])}</td><td>${pill(r[4])}</td><td class="up">${nf(r[5],0)}</td><td class="dn">${nf(r[6],0)}</td>
   <td class="grpL kq">${f(r[7])}</td><td>${f(r[8])}</td><td>${pill(r[9],1)}</td><td>${P(r[10])}</td><td class="up">${nf(r[11],0)}</td><td class="dn">${nf(r[12],0)}</td>
   <td class="grpL" style="text-align:center"><span class="rvp" style="background:${ok?'#d7f5e1':'#fee0e0'};color:${ok?'#15803d':'#dc2626'};min-width:110px">${esc2(st)}</span></td></tr>`}).join('');
 n++;out+=`<div class="sec"><b>${n}</b>KPI TRONG NGÀY · CỘNG DỒN (MTD) · ĐÁNH GIÁ</div><div class="rvx-sum"><table class="rvx"><thead><tr><th rowspan="2" class="l" style="--g:#14206b">Chỉ tiêu</th><th colspan="6" style="--g:#1c3fb5">TRONG NGÀY</th><th colspan="6" style="--g:#0f766e">CỘNG DỒN (MTD)</th><th rowspan="2" style="--g:#9d174d">ĐÁNH GIÁ<br>Trạng thái</th></tr>
  <tr>${['CT ngày','Mục tiêu fix','TH','% Đạt','SL ĐDKD đạt','Rớt'].map(t=>`<th style="--g:#2f55d4">${t}</th>`).join('')}${['TH cộng dồn','Chỉ tiêu','% TH','% Times gone','SL ĐDKD đạt tiến độ','Rớt'].map(t=>`<th style="--g:#14948a">${t}</th>`).join('')}</tr></thead><tbody>${sr}</tbody></table></div>
  <div class="rvx-notes">${R.notes.map(esc2).join('<br>')}</div>`;
 /* chi tiết theo ĐDKD – đầy đủ 68 cột như sheet */
 const GC=['#1c3fb5','#6a2fe0','#c2500c','#0e7490','#0f766e','#9d174d','#15803d','#a16207'],GD=[1,0,null,2,0,null,null,null];
 const rows=R.det,T=rows.find(x=>/TỔNG/.test(x.n)),RP=rows.filter(x=>x!==T);
 const A=R.aux||[];
 const head1=`<tr><th rowspan="2" class="stk" style="--g:#14206b">ĐDKD</th>${R.heads.map((h,i)=>`<th colspan="7" style="--g:${GC[i]}">${esc2(h)}</th>`).join('')}<th colspan="4" style="--g:#475569">Phụ trợ LPPC</th><th colspan="7" style="--g:#334155">Phụ trợ Combo / Trận Vàng / Hội viên</th></tr>`;
 const head2=`<tr>${R.sub.map((t,k)=>`<th title="${esc2(t)}" style="--g:${GC[Math.floor(k/7)]};opacity:.9;font-size:10.5px;min-width:78px">${esc2(t.replace(/\s*\((quầy OFF\+ON đi hôm nay|call hôm nay × %|call tháng × %)\)/,''))}</th>`).join('')}${A.map((t,k)=>`<th title="${esc2(t)}" style="--g:${k<4?'#64748b':'#475569'};font-size:10.5px;min-width:96px">${esc2(t.replace(/\s*\(.*$/,''))}</th>`).join('')}</tr>`;
 const cell=(r,g,j)=>{const v=r.v,i=g*7+j,x=v[i],d=GD[g],tot=r===T;let cls=j===1?'kq':'';if(j===0)cls+=' grpL';
  let h;
  if(j===5||(g===4&&j===5))h=pill(x,1);
  else if(j===2&&g!==4)h=gap(x,d);
  else if(j===6)h=gap(x,d);
  else if(j===2&&g===4)h=x==null?'–':`<b class="${x>0?'up':''}">${nf(x,0)}</b>`;
  else {const base=x==null?'–':(d===2?nf(x,2):d===1?nf(x,1):au(x));
   if(j===1&&g!==4&&v[g*7]!=null&&x!=null)h=`<span class="${x>=v[g*7]-1e-9?'up':'dn'}">${base}</span>`;else h=base}
  return `<td class="${cls}">${h}</td>`};
 const body=[T,...RP.filter(Boolean)].filter(Boolean).map(r=>`<tr class="${r===T?'tot':''}"><td class="stk"><b>${esc2(r.n)}</b>${r.pos?`<small>${esc2(r.pos)}</small>`:''}</td>${R.heads.map((h,g)=>[0,1,2,3,4,5,6].map(j=>cell(r,g,j)).join('')).join('')}${r.v.slice(57,68).map((x,k)=>`<td class="${k===0||k===4?'grpL':''}">${x==null?'–':au(x)}</td>`).join('')}</tr>`).join('');
 n++;out+=`<div class="sec"><b>${n}</b>CHI TIẾT THEO ĐDKD · SS NGUYỄN VĂN PHÁP (${RP.length} ĐDKD)</div><div class="rvx-det"><table class="rvx"><thead>${head1}${head2}</thead><tbody>${body}</tbody></table></div>
  <div class="rvx-leg"><span><i style="background:#16a34a"></i>Xanh = đạt mục tiêu ngày / đạt nhịp (≥ ${P(tg)} thời gian)</span><span><i style="background:#dc2626"></i>Đỏ = thiếu / chậm nhịp</span><span><i style="background:#d99a06"></i>% TH: vàng 90–99% mốc · xanh 100–109% · tím ≥110% · đỏ &lt;90%</span><span>Cột đậm = KQ ngày · Trượt ngang để xem đủ 8 nhóm KPI + cột phụ trợ</span></div>`;
 return [out,n]}
