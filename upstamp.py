#!/bin/env python2.7
import subprocess
import re
subprocess.check_output(['git', 'checkout', 'index.html'])
sha = subprocess.check_output(['git', 'rev-parse', 'HEAD']).strip()
text = open('index.html').read().replace('%%%%', sha)
open('index.html', 'w').write(text)


