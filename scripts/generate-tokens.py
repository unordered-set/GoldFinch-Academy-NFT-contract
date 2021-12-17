import sys
import json

filename = sys.argv[1]
csv = open(filename)
is_first_line = True
result = {}
index = 0
participants = []
managers = []
for line in csv:
    if is_first_line:
        is_first_line = False
        continue

    participant, manager = line.split(',')
    address = lambda s: s.strip()#.lower()

    participant = address(participant)
    if participant:
        participants.append(participant)

    manager = address(manager)
    if manager:
        managers.append(manager)

participants.sort()
managers.sort()

for p in participants:
    result[str(1000000 + index)] = p
    index += 1
for m in managers:
    result[str(2000000 + index)] = m
    index = index + 1

print(result)
with open('tokens.json', 'w') as f:
    json.dump(result, f, indent=4)
