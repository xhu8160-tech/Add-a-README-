"""Run: python -m unittest discover -s data -p 'test_*.py'."""
import csv
import unittest
from analysis import analyze, ROOT
class AnalysisTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls): cls.d=analyze()
    def test_partition_and_money(self):
        d=self.d
        self.assertEqual(sum(s['size'] for s in d['segments']),10000)
        self.assertEqual(sum(s['gmv'] for s in d['segments']),d['total']['gmv'])
        self.assertEqual(sum(s['gmv'] for s in d['channels']),d['total']['gmv'])
        self.assertEqual(d['current']['gmv']+d['previous']['gmv'],d['total']['gmv'])
    def test_event_invariants(self):
        with (ROOT/'travel_events.csv').open() as f:
            for r in csv.DictReader(f):
                vals=[int(r[k])>0 for k in ['visits','search_count','detail_clicks','favorites','orders']]
                self.assertEqual(vals,sorted(vals,reverse=True))
                self.assertLessEqual(int(r['coupon_used']),int(r['orders']))
                self.assertLessEqual(int(r['coupon_used']),int(r['coupon_received']))
                self.assertEqual(r['synthetic_data'],'true')
    def test_funnel_and_evidence(self):
        f=self.d['funnel']
        for a,b in zip(f,f[1:]):
            self.assertLessEqual(b['value'],a['value'])
            self.assertAlmostEqual(b['rate'],b['value']/a['value'],places=5)
        for s in self.d['strategies']:
            group=next(g for g in self.d['segments'] if g['name']==s['target'])
            self.assertEqual(s['baseline'],group['cvr'])
            self.assertIn(s['target'],s['evidence'])
    def test_segment_rules(self):
        with (ROOT/'user_segments.csv').open() as f: rows=list(csv.DictReader(f))
        self.assertEqual(len({r['user_id'] for r in rows}),10000)
        self.assertTrue(all(s['size']>0 for s in self.d['segments']))
if __name__=='__main__':unittest.main()
