"""Pure standard-library growth analysis; all insights derive from CSV aggregates."""
import csv
import json
import math
from collections import Counter
from datetime import date
from pathlib import Path
from generate_travel_data import END
ROOT=Path(__file__).resolve().parent
RULES=[('新用户','注册≤7天且访问天数<4'),('高价值用户','活跃间隔≤7天、30天访问≥10天、累计GMV≥5000'),('高意向未转化','30天搜索≥5、详情≥5、收藏≥2，近7天订单=0'),('价格敏感用户','30天已用券/已领券≥20%且偏好low'),('潜在流失用户','累计订单>0且活跃间隔≥14天，或前15天访问≥4且后15天访问≤前期30%'),('其他用户','不满足以上规则；按上述顺序互斥分配')]
def ratio(a,b): return round(a/b,6) if b else 0

def analyze():
    with (ROOT/'travel_users.csv').open() as f: users=list(csv.DictReader(f))
    with (ROOT/'travel_events.csv').open() as f: events=list(csv.DictReader(f))
    grouped={u['user_id']:[] for u in users}
    for e in events:
        for k in ['visits','search_count','detail_clicks','favorites','orders','gmv','coupon_received','coupon_used']: e[k]=int(e[k])
        grouped[e['user_id']].append(e)
    def aggregate(ids, start, end):
        rows=[e for uid in ids for e in grouped[uid] if start<=e['date']<=end]
        counts=[len({e['user_id'] for e in rows if e[k]>0}) for k in ['visits','search_count','detail_clicks','favorites','orders']]
        gmv=sum(e['gmv'] for e in rows); orders=sum(e['orders'] for e in rows)
        received=sum(e['coupon_received'] for e in rows); used=sum(e['coupon_used'] for e in rows)
        return dict(zip(['active','search','detail','favorite','paying'],counts)) | dict(gmv=gmv,cvr=ratio(counts[4],counts[0]),coupon_rate=ratio(used,received),aov=ratio(gmv,orders),orders=orders,coupon_received=received,coupon_used=used)
    allids=list(grouped)
    for u in users:
        for k in ['visit_frequency','search_count','detail_clicks','favorites','orders','gmv','historical_orders','historical_gmv','coupon_received','coupon_used']:u[k]=int(u[k])
        rows=grouped[u['user_id']]
        u['recency']=(END-date.fromisoformat(u['last_order_date'])).days if u['last_order_date'] else None
        u['frequency']=u['orders']+u['historical_orders'];u['monetary']=u['gmv']+u['historical_gmv']
        inactive=(END-date.fromisoformat(u['last_active_date'])).days
        first=sum(e['visits'] for e in rows if e['date']<'2026-10-06'); last=sum(e['visits'] for e in rows if e['date']>='2026-10-06')
        recent=sum(e['orders'] for e in rows if e['date']>='2026-10-14')
        conditions=[(END-date.fromisoformat(u['register_date'])).days<=7 and u['visit_frequency']<4,inactive<=7 and u['visit_frequency']>=10 and u['monetary']>=5000,u['search_count']>=5 and u['detail_clicks']>=5 and u['favorites']>=2 and recent==0,ratio(u['coupon_used'],u['coupon_received'])>=.2 and u['price_preference']=='low',u['frequency']>0 and (inactive>=14 or first>=4 and last<=first*.3)]
        u['segment']=next((RULES[i][0] for i,c in enumerate(conditions) if c),'其他用户')
    current=aggregate(allids,'2026-10-06','2026-10-20');previous=aggregate(allids,'2026-09-21','2026-10-05');total=aggregate(allids,'2026-09-21','2026-10-20')
    def distribution(us,key): return [dict(name=k,value=v) for k,v in Counter(u[key] for u in us).most_common()]
    segments=[]
    for name,rule in RULES:
        us=[u for u in users if u['segment']==name];ids=[u['user_id'] for u in us];m=aggregate(ids,'2026-09-21','2026-10-20')
        segments.append(dict(name=name,rule=rule,size=len(us),**m,gmv_share=ratio(m['gmv'],total['gmv']),detail_rate=ratio(m['detail'],m['active']),favorite_rate=ratio(m['favorite'],m['detail']),destinations=distribution(us,'destination_type'),channels=distribution(us,'channel')))
    keys=['active','search','detail','favorite','paying'];labels=['访问','搜索','详情点击','收藏','下单']
    funnel=[dict(name=labels[i],value=total[k],rate=ratio(total[k],total[keys[i-1]]) if i else 1,loss=total[keys[i-1]]-total[k] if i else 0) for i,k in enumerate(keys)]
    worst=min(range(1,5),key=lambda i:funnel[i]['rate'])
    diagnosis=f"当前最大相对流失发生在{labels[worst-1]}→{labels[worst]}阶段，流失率{(1-funnel[worst]['rate']):.1%}。"
    strategies=[]
    for s in segments:
        if not s['size']:continue
        p=s['cvr']; delta=p*.2; q=p+delta
        sample=math.ceil(((1.96*math.sqrt(2*((p+q)/2)*(1-(p+q)/2))+0.84*math.sqrt(p*(1-p)+q*(1-q)))**2)/(delta**2)) if 0<p<1 and q<1 else None
        strategies.append(dict(sample_per_arm=sample,id=f"strategy-{len(strategies)+1}",target=s['name'],insight=f"30天活跃{s['active']}人，详情访问率{s['detail_rate']:.1%}，收藏率{s['favorite_rate']:.1%}，支付CVR {s['cvr']:.1%}。",action='筛选近期收藏且7天未下单用户，发送收藏目的地提醒' if s['name']=='高意向未转化' else '根据该群体首选目的地发送分层推荐；每周最多一次',channel=s['channels'][0]['name'] if s['channels'] else '无可触达人群',offer='满299减30（单笔限用一次）' if s['name'] in ['高意向未转化','价格敏感用户'] else '无现金优惠，优先内容推荐',timing='周四17:00–21:00（待实验验证的假设）',metric='Purchase CVR',evidence=f"segments/{s['name']} · 2026-09-21–2026-10-20",baseline=s['cvr']))
    channels=[]
    for name in sorted({u['channel'] for u in users}):
        us=[u for u in users if u['channel']==name];channels.append(dict(name=name,**aggregate([u['user_id'] for u in us],'2026-09-21','2026-10-20')))
    result=dict(synthetic_data=True,seed=8160,period='2026-09-21–2026-10-20',comparison='10月06–20日 vs 09月21–10月05日（各15天）',user_count=len(users),current=current,previous=previous,total=total,segments=segments,funnel=funnel,diagnosis=diagnosis,strategies=strategies,destinations=distribution(users,'destination_type'),channels=channels,rules=[dict(name=n,rule=r) for n,r in RULES])
    out=ROOT.parent/'frontend/src/data/growth-analysis.json';out.parent.mkdir(exist_ok=True);out.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
    with (ROOT/'user_segments.csv').open('w',newline='') as f:
        w=csv.DictWriter(f,fieldnames=['user_id','segment','recency','frequency','monetary']);w.writeheader();w.writerows({k:u[k] for k in w.fieldnames} for u in users)
    print(diagnosis);return result
if __name__=='__main__':analyze()
