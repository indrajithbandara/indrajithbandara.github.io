import csv, tempfile, unittest
from pathlib import Path
from recommendations import FIELDS, read_source, review, blocks, card

class RecommendationTest(unittest.TestCase):
    def test_import_and_approval(self):
        with tempfile.TemporaryDirectory() as directory:
            file=Path(directory)/'test.csv'
            row=['Fixture','Person','','','A "quotation", Unicode café\r\nSecond paragraph <b>literal</b>','10/27/25, 04:48 AM','VISIBLE']
            with file.open('w',encoding='utf-8-sig',newline='') as f:
                w=csv.writer(f);w.writerow(FIELDS);w.writerow(row)
            records=read_source(file);r=records[0]
            self.assertEqual(r['text'],row[4]);self.assertEqual(r['date'],'2025-10-27');self.assertEqual(r['company'],'');self.assertEqual(r['jobTitle'],'')
            pending=review(records,{});self.assertEqual(blocks(pending)['approved_count'],0);self.assertNotIn('Fixture',blocks(pending)['archive'])
            approved=review(records,{r['id']:{'fingerprint':r['fingerprint'],'publicationApproval':'approved','basis':'Synthetic test permission','featured':True}})
            self.assertEqual(blocks(approved)['featured_count'],1);self.assertIn('&lt;b&gt;literal&lt;/b&gt;',card(approved[0]));self.assertNotIn('<b>literal</b>',card(approved[0]))
            self.assertEqual(review(records,{r['id']:{'fingerprint':'changed','publicationApproval':'approved','basis':'Test'}})[0]['publicationApproval'],'pending')
            self.assertEqual(review([{**r,'sourceStatus':'HIDDEN'}],{r['id']:{'fingerprint':r['fingerprint'],'publicationApproval':'approved','basis':'Test'}})[0]['publicationApproval'],'pending')
            with file.open('a',encoding='utf-8',newline='') as f:csv.writer(f).writerow(row)
            with self.assertRaises(ValueError):read_source(file)

if __name__=='__main__':unittest.main()
