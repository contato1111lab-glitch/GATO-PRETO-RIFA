import re

with open("services/raffleService.ts", "r") as f:
    content = f.read()

target = """    const isObj = raffle?.ranking_config && !Array.isArray(raffle.ranking_config);
    const minPurchaseConfig = isObj ? (raffle.ranking_config.minValue || 0) : 0;
    const isEnabled = isObj ? (raffle.ranking_config.enabled || false) : false;"""

replacement = """    let rc = raffle?.ranking_config;
    if (typeof rc === 'string') { try { rc = JSON.parse(rc); } catch(e){} }
    const isObj = rc && !Array.isArray(rc);
    const minPurchaseConfig = isObj ? (rc.minValue || 0) : 0;
    const isEnabled = isObj ? (rc.enabled || false) : false;"""

content = content.replace(target, replacement)

with open("services/raffleService.ts", "w") as f:
    f.write(content)

