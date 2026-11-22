"""Build the two maintained Loomik demos into the portfolio's static site."""
from pathlib import Path
import subprocess
root=Path(__file__).resolve().parents[1]
for name in ['loomik','loomik-classic']:
 source=root/'projects'/name
 subprocess.run(['npm','ci'],cwd=source,check=True)
 subprocess.run(['npx','vite','build',f'--base=/{name}/',f'--outDir={root / "site" / name}'],cwd=source,check=True)
 routes=['history','portfolio','action-hub','deal-gps','calendar','assets']
 if name=='loomik': routes += [f'deal/{i}' for i in range(1,8)]
 entry=(root/'site'/name/'index.html').read_bytes()
 for route in routes:
  target=root/'site'/name/route/'index.html'
  target.parent.mkdir(parents=True,exist_ok=True)
  target.write_bytes(entry)
