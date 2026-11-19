#!/usr/bin/env python3
"""Dựng tab BÁO CÁO NGÀY trực tiếp từ DT Onetech (không cần sheet BÁO CÁO NGÀY).
Cách dùng:  python3 tools/rv_from_dt.py <T11_26_Tracking_KPI_xxx.xlsx> [dd/mm/yyyy]
  - Ngày báo cáo mặc định = ngày đơn mới nhất trong DT Onetech.
  - KQ ngày tính từ DT Onetech (TO, PC, LPPC, hội viên, combo OFF, Trận Xanh/Vàng);
    chỉ tiêu / cộng dồn lấy từ KPI THÁNG, MCP, HỘI VIÊN trong cùng file.
  - Trận Xanh 'MT ngày' là số nhập tay (giữ giá trị cũ trong rv.manual.xanh).
  - Ghi vào window.T11_DATA.rv của index.html ở thư mục gốc repo này (và repo Data SO nếu truyền --so <đường dẫn index.html>).
Đã đối chiếu với sheet BÁO CÁO NGÀY ngày 18/11: khớp toàn bộ (trừ cột phụ trợ BL lệch 1 ở 2 ĐDKD).
"""
import sys,json,datetime,collections,math,os
def L(c):
    n=0
    for ch in c: n=n*26+ord(ch)-64
    return n-1
BRANDS4=('Nam Ngư','Chinsu','Kokomi','Chanté')
def wd_name(d): 
    w=d.isoweekday()  # Mon=1..Sun=7
    return 'Chủ nhật' if w==7 else 'Thứ %d'%(w+1)
def workdays(a,b):
    n=0;d=a
    while d<=b:
        if d.isoweekday()!=7:n+=1
        d+=datetime.timedelta(1)
    return n
def compute(S,day,params=None,manual=None,hist=False):
    """day 'dd/mm/yyyy'. S: dict of sheets (RAW_KPI = KPI THÁNG new layout)."""
    P=dict(lppc=4.7,hv=0.8,combo=0.8,aso=0.8,pc=0.75)
    if params:P.update(params)
    dd=datetime.datetime.strptime(day,'%d/%m/%Y').date()
    first=dd.replace(day=1)
    nm=(dd.replace(day=28)+datetime.timedelta(4)).replace(day=1)
    last=nm-datetime.timedelta(1)
    F4=workdays(first,dd);F5=workdays(first,last);I5=F5-F4+1
    wd=wd_name(dd);wk='Even Week' if dd.isocalendar()[1]%2==0 else 'Odd Week'
    DT=[r for r in S['DT Onetech'] if len(r)>55 and (r[6]!='' and str(r[44]).count('/')==2)]
    mon='/%s/%s'%(day[3:5],day[6:])
    _dt=lambda x:datetime.datetime.strptime(x,'%d/%m/%Y').date()
    mrows=[r for r in DT if r[44].endswith(mon) and _dt(r[44])<=dd]
    today=[r for r in mrows if r[44]==day]
    lastday=max((datetime.datetime.strptime(r[44],'%d/%m/%Y').date() for r in DT if r[44]),default=None)
    MCP=[r for r in S['MCP'] if len(r)>L('BT') and r[0]!='' and str(r[L('C')]).startswith('SM-')]
    mcpm={str(r[0]):r for r in MCP}
    kp={}
    for r in S['RAW_KPI']:
        if r[0] and str(r[0]).startswith('SM-FM') and r[2]: kp[r[2]]=r
    # rep list: from previous rv (sheet) order else KPI Pháp reps
    reps=S['_reps']
    def g(r,c):
        v=r[L(c)]; return float(v) if isinstance(v,(int,float)) else 0.0
    # PC / lines by (pos,cust) for day
    byo=collections.defaultdict(list)
    for r in today: byo[r[6]].append(r)
    cd=collections.defaultdict(lambda:[0.0])
    for k,rs in byo.items():
        c=str(rs[0][16]);m=mcpm.get(c)
        if not m or (m[L('BI')] or 0)==1: continue
        key=(rs[0][5],c)
        cd[key][0]+=sum(r[55] or 0 for r in rs if r[21]!='Processed Meats')
    pcd=collections.Counter();lnd=collections.Counter()
    for (ps,c),(l,) in cd.items():
        if l>0: pcd[ps]+=1;lnd[ps]+=l
    to=collections.defaultdict(float)
    for r in today: to[r[5]]+=r[32] or 0
    def is_call(m,rule_week=True):
        return wd in str(m[L('N')]) and m[L('Q')] in('Both',wk)
    # HV
    HV=[r for r in S['HỘI VIÊN'] if len(r)>34 and r[1] not in ('','Mã CH') and r[4] not in ('','ĐDKD')]
    cust_day=collections.defaultdict(lambda:collections.defaultdict(float))
    for r in today:
        if r[21]=='Beer' or r[43]=='NET': continue
        c=str(r[16]);cust_day[c]['all']+=r[35] or 0
        if r[43] in BRANDS4: cust_day[c][r[43]]+=r[35] or 0
    ao4,ao10,ao11=0.95,150000.0,500000.0
    hvstat=collections.defaultdict(lambda:dict(n=0,go=0,done=0,newdone=0,reach=0,buy=0))
    for r in HV:
        rep=r[4];s=hvstat[rep];c=str(r[1]);s['n']+=1
        m=mcpm.get(c);q=m[L('Q')] if m else 'Both'
        co=(wd in str(r[3])) and q in('Both',wk)
        cn=cust_day[c]['all'];
        s['go']+=1 if co else 0
        s['done']+=1 if cn>0 else 0
        ai=1 if (r[34] or 0)==1 else 0
        s['reach']+=ai
        if (r[10] or 0)>0: s['buy']+=1
        if ai:
            J=r[9] or 0;K=r[10] or 0
            nv1=(J>0) and ((K-cn)/J>=ao4)
            b=[(r[16+i] or 0)-cust_day[c][BRANDS4[i]] for i in range(4)]
            if r[8]=='BRAND_VIPDAISU': nv2=min(b)>=ao10
            else: nv2=((r[20] or 0)-sum(cust_day[c][x] for x in BRANDS4))>=ao11
            cu=nv1 and nv2
            if not cu: s['newdone']+=1
    # Combo OFF today / excluding today
    gifts={'03OT00362','03OT00547'}
    def combo_cnt(rows,rep_name):
        cu=collections.defaultdict(lambda:dict(all=0.0,key=0.0,gq=0.0))
        for r in rows:
            if r[47]!=rep_name or r[39]!='Kênh Off Premise': continue
            o=cu[str(r[16])]
            if r[37]=='N':
                v=r[36] or 0
                if r[21]!='Beer' and r[43]!='NET': o['all']+=v
                if r[43] in BRANDS4: o['key']+=v
            elif r[37]=='Y' and r[23] in gifts: o['gq']+=r[30] or 0
        n=0
        for c,o in cu.items():
            m=mcpm.get(c);ct=(m[L('T')] if m else 0);nw=(m[L('BI')] if m else 0) or 0
            if o['gq']>0 and o['all']>=800000 and o['key']>=100000 and isinstance(ct,(int,float)) and ct<3000000 and nw==0: n+=1
        return n
    rows_not_today=[r for r in mrows if r[44]!=day]
    # Xanh
    CHT={'04HP00636','04HP00637','04HP00638'};TEA={'08TR00055','08TR00056','08TR00057'}
    def xanh_set(rows):
        a=collections.defaultdict(float);b=collections.defaultdict(float)
        for r in rows:
            if (r[25] or 0)<=0: continue
            c=str(r[16])
            if r[23] in CHT: a[c]+=r[29] or 0
            if r[23] in TEA: b[c]+=r[29] or 0
        return {c for c in a if a[c]>=0.5 and b.get(c,0)>=1.0}
    xa=xanh_set(mrows);xb=xanh_set(rows_not_today)
    newq={str(r[L('BK')]) for r in MCP if r[L('BK')]!=''} 
    cum={}
    if hist:
        days=sorted({r[44] for r in mrows},key=_dt)
        cto=collections.defaultdict(float);cpc=collections.Counter();cln=collections.Counter();ccb=collections.Counter()
        seen=collections.defaultdict(set);hvbuy=collections.defaultdict(set)
        hvset={str(r[1]):r[4] for r in HV}
        for dday in days:
            rs=[r for r in mrows if r[44]==dday]
            bo=collections.defaultdict(list)
            for r in rs: bo[r[6]].append(r)
            cdd=collections.defaultdict(float)
            for k_,x in bo.items():
                c=str(x[0][16]);m=mcpm.get(c)
                if not m or (m[L('BI')] or 0)==1: continue
                cdd[(x[0][5],c)]+=sum(r[55] or 0 for r in x if r[21]!='Processed Meats')
            for (ps,c),l in cdd.items():
                if l>0: cpc[ps]+=1;cln[ps]+=l
            for r in rs:
                cto[r[5]]+=r[32] or 0
                c=str(r[16]);m=mcpm.get(c)
                if m and (m[L('BI')] or 0)==0 and (r[35] or 0)>0: seen[r[5]].add(c)
                if c in hvset and r[21]!='Beer' and r[43]!='NET' and (r[35] or 0)>0: hvbuy[hvset[c]].add(c)
            for rep_,pos_ in reps:
                ccb[rep_]+=combo_cnt(rs,rep_)
        cum=dict(to=cto,pc=cpc,ln=cln,cb=ccb,seen=seen,hvbuy=hvbuy)
    out={}
    for rep,pos in reps:
        r=kp[rep];k={}
        # TO
        ct=g(r,'J')/1e6;th=g(r,'K')/1e6
        k['C']=max(0,ct-(th-to[pos]/1e6))/I5;k['D']=to[pos]/1e6;k['F']=th;k['G']=ct
        mm=[m for m in MCP if m[L('C')]==pos and (m[L('BI')] or 0)==0]
        BR=sum(1 for m in mm if is_call(m))
        k['J']=BR;k['K']=pcd[pos];k['M']=sum(1 for m in mm if (m[L('AE')] or 0)>0);k['N']=len(mm)*P['aso']
        k['Q']=BR*P['pc'];k['R']=pcd[pos];k['T']=g(r,'BQ')
        k['U']=(g(r,'BI')*8+g(r,'BJ')*4+g(r,'BK')*2+g(r,'BZ')*8+g(r,'CA')*4+g(r,'CB')*2)*P['pc']
        k['X']=P['lppc'];k['BH']=pcd[pos];k['BI']=lnd[pos];k['Y']=(lnd[pos]/pcd[pos]) if pcd[pos] else None
        k['BJ']=g(r,'BQ');k['BK']=g(r,'BR');k['AA']=(k['BK']/k['BJ']) if k['BJ'] else None;k['AB']=P['lppc']
        s=hvstat[rep]
        k['AE']=s['go'];k['AF']=s['done'];k['AG']=s['newdone'];k['AH']=s['reach'];k['AI']=round(s['n']*P['hv']+1e-9);k['BQ']=s['buy']
        # combo
        offm=[m for m in MCP if m[L('M')]==rep and m[L('H')]=='Kênh Off Premise' and isinstance(m[L('T')],(int,float)) and m[L('T')]<3000000 and (m[L('BI')] or 0)==0]
        k['BO']=sum(1 for m in offm if wd in str(m[L('N')]) and m[L('Q')] in('Both',wk))
        k['BP']=sum({'F8':8,'F4':4,'F2':2}.get(m[L('O')],0) for m in offm)
        k['BN']=combo_cnt(today,rep);k['AM']=k['BN']
        k['AO']=g(r,'DT');k['AP']=round(k['BP']*P['combo']);k['AL']=max(0,k['AP']-(k['AO']-k['AM']))/I5
        # BL: customers ok on month excl today (cumulative merged)
        cu=collections.defaultdict(lambda:dict(all=0.0,key=0.0,gq=0.0))
        for rr in rows_not_today:
            if rr[47]!=rep or rr[39]!='Kênh Off Premise': continue
            o=cu[str(rr[16])]
            if rr[37]=='N':
                v=rr[36] or 0
                if rr[21]!='Beer' and rr[43]!='NET': o['all']+=v
                if rr[43] in BRANDS4: o['key']+=v
            elif rr[37]=='Y' and rr[23] in gifts: o['gq']+=rr[30] or 0
        n=0
        for c,o in cu.items():
            m=mcpm.get(c);ct_=(m[L('T')] if m else 0);nw=(m[L('BI')] if m else 0) or 0
            if o['gq']>0 and o['all']>=800000 and o['key']>=100000 and isinstance(ct_,(int,float)) and ct_<3000000 and nw==0: n+=1
        k['BL']=n
        # xanh
        mine=[m for m in MCP if m[L('C')]==pos]
        k['AT']=sum(1 for m in mine if str(m[L('A')]) in xa and str(m[L('A')]) not in xb and (m[L('BI')] or 0)==0)
        k['AV']=g(r,'AW');k['AW']=g(r,'AV')
        k['AS']=(manual or {}).get('xanh',{}).get(rep)
        # vang
        gm=set()
        for rr in rows_not_today:
            if rr[5]==pos and rr[22]=='Hạt nêm Chinsu Ngọt Thanh' and (rr[35] or 0)>0 and str(rr[16]) not in newq: gm.add(str(rr[16]))
        k['BM']=len(gm)
        k['BC']=g(r,'BA');k['BD']=g(r,'AZ');k['BA']=k['BC']-k['BM'];k['AZ']=max(0,k['BD']-(k['BC']-k['BA']))/I5
        k['BR']=BR
        if hist:
            k['F']=cum['to'][pos]/1e6;k['C']=max(0,k['G']-(k['F']-k['D']))/I5
            k['T']=cum['pc'][pos];k['BJ']=k['T'];k['BK']=cum['ln'][pos];k['AA']=(k['BK']/k['BJ']) if k['BJ'] else None
            k['M']=len(cum['seen'][pos]);k['BQ']=len(cum['hvbuy'][rep]);k['AO']=cum['cb'][rep]
            k['AL']=max(0,k['AP']-(k['AO']-k['AM']))/I5
            k['AH']=None;k['AG']=None;k['AV']=None;k['BC']=None;k['BA']=None;k['AZ']=None
        out[rep]=k
    cal=dict(hist=hist,F4=F4,F5=F5,I5=I5,wd=wd,wk=wk,date=dd,last=lastday,B5=F4/F5)
    return out,cal

from decimal import Decimal,ROUND_HALF_UP
def _r(x,d):return float(Decimal(repr(x)).quantize(Decimal(1).scaleb(-d),rounding=ROUND_HALF_UP))
def fmt1(x):return f'{_r(x,1):,.1f}'
def fmt0(x):return f'{_r(x,0):,.0f}'
LET=lambda s:L(s)-2
def build_rv2(S,old,day=None,params=None,manual=None,hist=False):
    """S: sheets dict (needs DT Onetech, MCP, HỘI VIÊN, RAW_KPI, _reps). old: previous rv dict (labels, du...)."""
    DT=[r for r in S['DT Onetech'] if len(r)>55 and (r[6]!='' and str(r[44]).count('/')==2)]
    if day is None:
        ds=[datetime.datetime.strptime(r[44],'%d/%m/%Y').date() for r in DT if r[44]]
        d=max(ds);day=d.strftime('%d/%m/%Y')
    P=dict(lppc=4.7,hv=0.8,combo=0.8,aso=0.8,pc=0.75)
    if params:P.update(params)
    man=dict(manual or {})
    if 'xanh' not in man: man['xanh']={}
    # carry old manual xanh MT ngày from previous det
    for r in old['det']:
        if r['n'] in S['_repnames'] and r['v'][LET('AS')] is not None and r['n'] not in man['xanh']: man['xanh'][r['n']]=r['v'][LET('AS')]
    out,cal=compute(S,day,P,man,hist)
    reps=[n for n,_ in S['_reps']]
    I5=cal['I5'];B5=cal['B5'];F4=cal['F4'];F5=cal['F5']
    div=lambda a,b:(a/b) if (a is not None and b) else None
    sb=lambda a,b:None if a is None or b is None else a-b
    det=[];tot={}
    keys=['C','D','F','G','J','K','M','N','Q','R','T','U','AE','AF','AG','AH','AI','AL','AM','AO','AP','AS','AT','AV','AW','AZ','BA','BC','BD','BH','BI','BJ','BK','BM','BL','BN','BO','BP','BQ','BR']
    for rep in reps:
        k=out[rep]
        k['E']=k['D']-k['C'];k['H']=div(k['F'],k['G']);k['I']=k['F']-k['G']
        k['L']=k['K']-k['J'];k['O']=div(k['M'],k['N']);k['P']=k['M']-k['N']
        k['S']=k['R']-k['Q'];k['V']=div(k['T'],k['U']);k['W']=k['T']-k['U']
        k['Z']=None if k['Y'] is None else k['Y']-k['X']
        k['AC']=None if k['AA'] is None else k['AA']/k['AB'];k['AD']=None if k['AA'] is None else k['AA']-k['AB']
        k['AJ']=div(k['AH'],k['AI']);k['AK']=sb(k['AH'],k['AI'])
        k['AN']=k['AM']-k['AL'];k['AQ']=div(k['AO'],k['AP']);k['AR']=k['AO']-k['AP']
        k['AU']=sb(k['AT'],k['AS'])
        k['AX']=div(k['AV'],k['AW']);k['AY']=sb(k['AV'],k['AW'])
        k['BB']=sb(k['BA'],k['AZ']);k['BE']=div(k['BC'],k['BD']);k['BF']=sb(k['BC'],k['BD'])
    T={}
    for c in keys: T[c]=sum((out[r].get(c) or 0) for r in reps)
    if hist:
        for c in ('AG','AH','AV','BC','BA','AZ'): T[c]=None
    T['E']=T['D']-T['C'];T['H']=div(T['F'],T['G']);T['I']=T['F']-T['G']
    T['L']=T['K']-T['J'];T['O']=div(T['M'],T['N']);T['P']=T['M']-T['N']
    T['S']=T['R']-T['Q'];T['V']=div(T['T'],T['U']);T['W']=T['T']-T['U']
    T['X']=P['lppc'];T['Y']=div(T['BI'],T['BH']);T['Z']=None if T['Y'] is None else T['Y']-T['X']
    T['AA']=div(T['BK'],T['BJ']);T['AB']=P['lppc'];T['AC']=None if T['AA'] is None else T['AA']/T['AB'];T['AD']=None if T['AA'] is None else T['AA']-T['AB']
    T['AJ']=div(T['AH'],T['AI']);T['AK']=sb(T['AH'],T['AI'])
    T['AN']=T['AM']-T['AL'];T['AQ']=div(T['AO'],T['AP']);T['AR']=T['AO']-T['AP']
    T['AU']=T['AT']-T['AS'];T['AX']=div(T['AV'],T['AW']);T['AY']=sb(T['AV'],T['AW'])
    T['BB']=sb(T['BA'],T['AZ']);T['BE']=div(T['BC'],T['BD']);T['BF']=sb(T['BC'],T['BD'])
    order=[chr(0)]
    import string
    def cols(a,b):
        r=[];i=L(a)
        while i<=L(b):
            n=i+1;s=''
            while n: n,m=divmod(n-1,26);s=chr(65+m)+s
            r.append(s);i+=1
        return r
    allc=cols('C','BR')
    def vec(k): return [k.get(c) if c!='BG' else None for c in allc]
    for rep,pos in S['_reps']:
        det.append({'n':rep,'pos':pos,'v':vec(out[rep])})
    T['BL']=None;T['BM']=None
    det.append({'n':'TỔNG SS PHÁP','pos':None,'v':vec(T)})
    # summary
    cnt=lambda f:sum(1 for r in reps if f(out[r]))
    nrep=len(reps)
    isn=lambda x:x is not None
    rows=[]
    def row(label,b,c,d,f,h,i,l,fmt_status=True,Hv=None):
        e=div(d,c);j=div(h,i)
        st='–' if j is None else ('▲ Đạt nhịp' if j>=B5 else '▼ Chậm nhịp')
        return [label,b,c,d,e,f,nrep-f,h,i,j,B5,l,nrep-l,st]
    r1=row('1/ Doanh số (Tr)',T['G']/F5,T['C'],T['D'],cnt(lambda k:k['D']>=k['C']),T['F'],T['G'],cnt(lambda k:isn(k['H']) and k['H']>=B5))
    r2=row(f"2/ ASO OFF+ON (mục tiêu {P['aso']:.0%} call)",T['J'],T['J']*P['aso'],T['K'],cnt(lambda k:k['K']>=k['J']*P['aso']),T['M'],T['N'],cnt(lambda k:isn(k['O']) and k['O']>=B5))
    r3=row(f"3/ PC (ON+OFF, mục tiêu {P['pc']:.0%} call tháng)",T['Q'],T['Q'],T['R'],cnt(lambda k:k['R']>=k['Q']),T['T'],T['U'],cnt(lambda k:isn(k['V']) and k['V']>=B5))
    r4=row('4/ LPPC (trừ Meat/Bia)',T['X'],T['X'],T['Y'],cnt(lambda k:isn(k['Y']) and k['Y']>=k['X']),T['AA'],T['AB'],cnt(lambda k:isn(k['AC']) and k['AC']>=B5))
    r5=row(f"5/ Hội viên (quầy có mua đơn, mục tiêu {P['hv']:.0%} KH VT)",T['AE'],T['AE']*P['hv'],T['AF'],cnt(lambda k:k['AF']>=k['AE']*P['hv']),T['BQ'],T['AI'],cnt(lambda k:k['AI']>0 and k['BQ']/k['AI']>=B5))
    r6=row(f"6/ PC Combo OFF (mục tiêu {P['combo']:.0%} KH VT)",T['BO'],T['BO']*P['combo'],T['AM'],cnt(lambda k:k['AM']>=k['BO']*P['combo']),T['AO'],T['AP'],cnt(lambda k:isn(k['AQ']) and k['AQ']>=B5))
    summ=[r1,r2,r3,r4,r5,r6]
    cards=[]
    for t,r,dec in (('DOANH SỐ (TRIỆU)',r1,fmt1),('ASO OFF + ON · QUẦY CÓ MUA HÀNG',r2,fmt0),('PC · ĐƠN HÀNG',r3,fmt0),('HỘI VIÊN · QUẦY CÓ MUA ĐƠN',r5,fmt0)):
        cards.append({'t':t,'p':r[9],'s':f'TH {dec(r[7])} / CT {dec(r[8])}   ·   TH ngày {dec(r[3])}'})
    rv=dict(old)
    wd=cal['wd'];dd=cal['date']
    rv['title']=old['title'];rv['date']=f'BÁO CÁO NGÀY  {day}  ·  {wd}'
    last=cal['last'];lastS=last.strftime('%d/%m/%Y') if last else ''
    rv['src']=f'Nguồn: DT Onetech / MCP / HỘI VIÊN / KPI THÁNG  |  Ngày tính: {day} ({wd})  |  Đơn mới nhất: {lastS}'
    rv['ok']=('ℹ Xem lại ngày '+day[:5]+': cộng dồn tính từ DT Onetech đến ngày này; HV đạt, Trận Xanh, Trận Vàng cộng dồn chỉ có ở ngày mới nhất') if hist else '✔ Dữ liệu khớp ngày báo cáo' if last==dd else ('⚠ Ngày báo cáo sau ngày dữ liệu mới nhất → KQ ngày = 0, cần nạp thêm đơn' if dd>last else f'ℹ Cộng dồn lấy toàn bộ dữ liệu đã nạp (đến {last:%d/%m})')
    rv['info']={'Giám sát':'Nguyễn Văn Pháp','Ngày báo cáo':dd.strftime('%Y-%m-%d')+' 00:00:00','Chuỗi ngày DT Onetech':day,'CT LPPC (không Meat/Bia)':str(P['lppc']),'Tổng ĐDKD':str(nrep),'Ngày đã qua':str(F4),'Thứ (lịch Visit MCP)':wd,'% Target Hội viên / tổng HV':str(P['hv']),'% Times gone':str(B5),'Tổng ngày kỳ':str(F5),'Ngày công còn lại*':str(I5),'Tuần MCP':cal['wk'],'% Target Combo OFF / mục tiêu':str(P['combo']),rv['ok']:'','Đơn mới nhất':last.strftime('%Y-%m-%d')+' 00:00:00','% Target PC / call':str(P['pc']),'% Target ASO OFF+ON / call':str(P['aso'])}
    rv['cards']=cards;rv['summ']=summ
    notes=list(old['notes'])
    notes[0]=f"Hội viên hôm nay: đi {fmt0(T['AE'])} quầy  |  thực hiện {fmt0(T['AF'])} quầy  |  đạt hội viên trong ngày {fmt0(T['AG'] or 0)} quầy  |  cộng dồn đạt {fmt0(T['AH'] or 0)} / {fmt0(T['AI'])} quầy"
    notes[4]='* Ngày công còn lại tính cả hôm nay. Báo cáo tự tính từ sheet DT Onetech (ngày đơn mới nhất) kết hợp KPI THÁNG, MCP, HỘI VIÊN; Trận Xanh "MT ngày" là số nhập tay (rv.manual.xanh).'
    rv['notes']=notes;rv['det']=det
    rv['manual']=man;rv['params']=P;rv['calc']='DT Onetech'
    return rv

def load(xlsx):
    from python_calamine import CalamineWorkbook
    wb=CalamineWorkbook.from_path(xlsx)
    S={n:wb.get_sheet_by_name(n).to_python() for n in ('DT Onetech','MCP','HỘI VIÊN','KPI THÁNG')}
    S['RAW_KPI']=S['KPI THÁNG']
    return S
def main():
    av=sys.argv[1:];so=None
    if '--so' in av:
        j=av.index('--so');so=av[j+1];av=av[:j]+av[j+2:]
    a=av
    xlsx=a[0];day=a[1] if len(a)>1 else None
    paths=[os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','index.html')]
    if so: paths.append(so)
    S=load(xlsx)
    for p in paths:
        s=open(p,encoding='utf8').read();i=s.find('window.T11_DATA=')+16
        D,e=json.JSONDecoder().raw_decode(s[i:])
        old=D['rv']
        S['_reps']=[(r['n'],r['pos']) for r in old['det'] if r['pos']]
        S['_repnames']={n for n,_ in S['_reps']}
        rv=build_rv2(S,old,day)
        D['rv']=rv
        # xem lại các ngày trước trong tháng
        cur=rv['info']['Chuỗi ngày DT Onetech']
        mon=cur[3:]
        days=sorted({r[44] for r in S['DT Onetech'] if len(r)>55 and (r[6]!='' and str(r[44]).count('/')==2) and str(r[44]).endswith(mon)},key=lambda x:x[:2])
        KEYS=('title','date','src','ok','info','cards','summ','notes','det','heads','sub','aux')
        rvd={}
        for dday in days:
            x=rv if dday==cur else build_rv2(S,old,dday,manual=rv.get('manual'),hist=True)
            rvd[dday]={k:x[k] for k in KEYS if k in x}
        D['rvd']=rvd
        s=s[:i]+json.dumps(D,ensure_ascii=False,separators=(',',':'))+s[i+e:]
        open(p,'w',encoding='utf8').write(s)
        print('rv cập nhật',p,rv['date'])
if __name__=='__main__': main()
