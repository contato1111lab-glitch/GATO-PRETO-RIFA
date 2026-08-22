import re

with open("components/RaffleDetails.tsx", "r") as f:
    content = f.read()

old_prop = "manualEntries={raffle.manualRanking}"
new_prop = """manualEntries={raffle.manualRanking}
            rankingSettings={raffle.rankingSettings}"""

content = content.replace(old_prop, new_prop)

with open("components/RaffleDetails.tsx", "w") as f:
    f.write(content)

