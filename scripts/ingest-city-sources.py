"""Deterministic intake: pyshp + pyproj; no LLM/OCR or external API calls.
Usage: python scripts/ingest-city-sources.py STREETS.zip POLICY.docx
Originals are read only. Re-run only if either SHA256 changes.
"""
import sys, json, hashlib, zipfile, tempfile, pathlib, math
import xml.etree.ElementTree as ET
import shapefile
from pyproj import CRS, Transformer

street_path, policy_path = map(pathlib.Path, sys.argv[1:3])
out = pathlib.Path(__file__).resolve().parents[1] / 'public/data'
out.mkdir(parents=True, exist_ok=True)
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
hashes = {'streets': sha(street_path), 'policy': sha(policy_path)}
SCHEMA_VERSION = 1
manifest_path = out / 'sources-manifest.json'
if all((out/name).exists() for name in ['sources-manifest.json','streets.geojson','policy.json']) and json.loads(manifest_path.read_text()).get('hashes') == hashes and json.loads(manifest_path.read_text()).get('schema_version') == SCHEMA_VERSION:
    print('Unchanged source hashes; existing derivatives reused.'); sys.exit(0)
with tempfile.TemporaryDirectory() as temp:
    with zipfile.ZipFile(street_path) as archive:
        for info in archive.infolist():
            if pathlib.Path(info.filename).suffix.lower() in ('.shp','.shx','.dbf','.prj','.cpg'):
                (pathlib.Path(temp) / pathlib.Path(info.filename).name).write_bytes(archive.read(info))
    shp = next(pathlib.Path(temp).glob('*.shp'))
    crs = CRS.from_wkt(shp.with_suffix('.prj').read_text())
    tr = Transformer.from_crs(crs, 'EPSG:4326', always_xy=True)
    reader = shapefile.Reader(str(shp), encoding=shp.with_suffix('.cpg').read_text().strip())
    features, missing_names, bad = [], 0, []
    for index, record in enumerate(reader.iterShapeRecords()):
        props = record.record.as_dict()
        name, quarter = str(props.get('שם_רח') or '').strip(), str(props.get('רובע') or '').strip()
        if not name: missing_names += 1
        parts = list(record.shape.parts) + [len(record.shape.points)]
        lines = []
        for a,b in zip(parts,parts[1:]):
            coords = [[round(lon,7),round(lat,7)] for lon,lat in [tr.transform(x,y) for x,y in record.shape.points[a:b]]]
            if len(coords)<2 or any(not math.isfinite(v) for xy in coords for v in xy): bad.append(index); continue
            if any(not (34 < lon < 36 and 31 < lat < 33) for lon,lat in coords): raise ValueError('Unexpected geographic extent')
            lines.append(coords)
        if not lines: continue
        features.append({'type':'Feature','id':f'street-{index:04d}', 'properties':{'name':name,'quarter':quarter,'code':props.get('st_cod'),'source':'streets-upload-20261030','source_record':index}, 'geometry':{'type':'LineString','coordinates':lines[0]} if len(lines)==1 else {'type':'MultiLineString','coordinates':lines}})
    (out/'streets.geojson').write_text(json.dumps({'type':'FeatureCollection','features':features},ensure_ascii=False,separators=(',',':')))
ns = {'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
tag = lambda name: '{'+ns['w']+'}'+name
text = lambda node: ''.join(t.text or '' for t in node.findall('.//w:t',ns)).strip()
with zipfile.ZipFile(policy_path) as archive:
    root=ET.fromstring(archive.read('word/document.xml'))
    blocks=[]
    for ordinal,node in enumerate(root.find('w:body',ns)):
        if node.tag==tag('p'):
            content=text(node)
            if content:
                style=node.find('w:pPr/w:pStyle',ns)
                blocks.append({'id':f'block-{ordinal}','kind':'paragraph','text':content,'style':style.get(tag('val')) if style is not None else None})
        elif node.tag==tag('tbl'):
            rows=[[text(cell) for cell in row.findall('w:tc',ns)] for row in node.findall('w:tr',ns)]
            blocks.append({'id':f'block-{ordinal}','kind':'table','rows':rows,'text':'\n'.join(' | '.join(row) for row in rows)})
    policy={'id':'policy-draft-202609','title':'מסמך מדיניות עירונית תכנונית','date_label':'ספטמבר 2026','status':'טיוטת עבודה','filename':policy_path.name,'sha256':hashes['policy'],'locator_note':'מזהה מקטע מתייחס לסדר במסמך המקור, לא למספר עמוד. חילוץ טקסט אינו אישור מדיניות.','blocks':blocks,'images_count':sum(n.startswith('word/media/') for n in archive.namelist())}
    (out/'policy.json').write_text(json.dumps(policy,ensure_ascii=False,separators=(',',':')))
manifest={'schema_version':SCHEMA_VERSION,'received':'2026-10-30','hashes':hashes,'streets':{'source_name':street_path.name,'features':len(features),'source_fields':[field.name for field in reader.fields[1:]],'source_crs':crs.to_string(),'target_crs':'EPSG:4326','missing_names':missing_names,'invalid_parts':bad,'source_date':None,'note':'רחובות מתוך הקובץ שסופק. תאריך עדכון ומשמעות שדות הקוד לא נמסרו. אינו רשת ניווט מאומתת.'},'policy':{'source_name':policy_path.name,'status':'טיוטת עבודה','date_label':'ספטמבר 2026','blocks':len(blocks),'tables':sum(b['kind']=='table' for b in blocks),'images':policy['images_count']}}
manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
print(json.dumps(manifest,ensure_ascii=False))
