from survivalpy.survival import Analyzer
from survivalpy.survival import Datum

import json
import sys

def printjson(message):
  print(json.dumps({"message":message}))

data = []

try:
  for line in sys.stdin:
      # Read the participants line by line (ignoring newline character)
      participant=json.loads(line[:-1])

      # Build them into a list of Datums (data? :shrug: )
      time = participant.get('time')
      censored = participant.get('censored')
      kfid = participant.get('id')

      datum = Datum(time, censored, {'id':kfid})

      data.append(datum)

  # Do the computations!
  analyzer = Analyzer(data)
  results = analyzer.compute()
  json_results = list(map(lambda interval: interval.to_json_dict(), results))

  # Spit out the results
  printjson(json_results)
except Exception as e:
  printjson({'pyerror':str(e)})
