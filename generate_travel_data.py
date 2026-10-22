"""Deterministic synthetic users + daily behavior. No real personal data."""
import csv
import random
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent
END = date(2026, 10, 20)
SEED = 8160

def generate(n=10000):
    rng = random.Random(SEED)
    users, events = [], []
    for i in range(n):
        kind = rng.choices(range(6), [15, 24, 22, 15, 12, 12])[0]
        registered = END - timedelta(days=rng.randint(0, 6) if kind == 4 else rng.randint(35, 500))
        channel = rng.choice(['App Push', '微信', '短信', '自然搜索', '小红书'])
        price = 'low' if kind == 2 else rng.choice(['low', 'medium', 'premium'])
        u = dict(user_id=f'SYN-{i+1:05}', age_group=rng.choice(['18–24','25–34','35–44','45+']), city=rng.choice(['北京','上海','广州','成都','杭州']), register_date=registered.isoformat(), destination_type=rng.choice(['周边游','海岛','城市','山水']), travel_type=rng.choice(['独行','亲子','情侣','朋友']), price_preference=price, channel=channel, synthetic_data='true')
        history_orders = rng.randint(3, 10) if kind in (0,3) else rng.randint(0,2)
        history_gmv = history_orders * rng.randint(300,1800)
        history_last = registered + timedelta(days=10) if history_orders else None
        rows=[]
        for d in range(30):
            day=END-timedelta(days=29-d)
            if day < registered: continue
            prob = [.8,.65,.55,.04,.4,.22][kind]
            visit=int(rng.random()<prob)
            searches=rng.randint(1,4) if visit and rng.random()<.78 else 0
            detail=rng.randint(1,searches*2) if searches and rng.random()<.72 else 0
            fav=rng.randint(1,detail) if detail and rng.random()<(.85 if kind==1 else .55) else 0
            order=int(bool(fav) and rng.random()<[.45,0,.22,.3,.15,.12][kind])
            received=int(bool(visit) and rng.random()<.65)
            used=int(bool(order and received) and rng.random()<(.95 if kind==2 else .3))
            gmv=order*rng.randint(150,500 if price=='low' else 2000)
            row=dict(user_id=u['user_id'],date=day.isoformat(),visits=visit,search_count=searches,detail_clicks=detail,favorites=fav,orders=order,gmv=gmv,coupon_received=received,coupon_used=used,synthetic_data='true')
            rows.append(row)
        events.extend(rows)
        for key in ['search_count','detail_clicks','favorites','orders','gmv','coupon_received','coupon_used']:
            u[key]=sum(r[key] for r in rows)
        active=[r['date'] for r in rows if r['visits']]
        purchases=[r['date'] for r in rows if r['orders']]
        u.update(last_active_date=max(active) if active else registered.isoformat(), visit_frequency=sum(r['visits'] for r in rows), avg_order_value=round(u['gmv']/u['orders'],2) if u['orders'] else 0, historical_orders=history_orders, historical_gmv=history_gmv,last_order_date=max(purchases) if purchases else history_last.isoformat() if history_last else '')
        users.append(u)
    for filename, rows in [('travel_users.csv',users),('travel_events.csv',events)]:
        with (ROOT/filename).open('w',newline='',encoding='utf-8') as f:
            w=csv.DictWriter(f,fieldnames=list(rows[0]));w.writeheader();w.writerows(rows)
    print(f'Synthetic data: {len(users)} users, {len(events)} daily rows; seed={SEED}')

if __name__=='__main__': generate()
