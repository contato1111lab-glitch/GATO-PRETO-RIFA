import re

with open("services/raffleService.ts", "r") as f:
    content = f.read()

# 1. getRaffleRanking - select
content = content.replace(
    ".select('ranking_start_date, ranking_end_date')",
    ".select('ranking_start_date, ranking_end_date, ranking_config, price_per_number')"
)

# 1. getRaffleRanking - logic
old_logic = """    const counts = new Map<string, number>();
    tickets.forEach((t: any) => {
      if (t.owner_user_id) counts.set(t.owner_user_id, (counts.get(t.owner_user_id) || 0) + 1);
    });

    const top = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxPosition || 100);"""

new_logic = """    const counts = new Map<string, number>();
    tickets.forEach((t: any) => {
      if (t.owner_user_id) counts.set(t.owner_user_id, (counts.get(t.owner_user_id) || 0) + 1);
    });

    const isObj = raffle?.ranking_config && !Array.isArray(raffle.ranking_config);
    const minPurchaseConfig = isObj ? (raffle.ranking_config.minValue || 0) : 0;
    const isEnabled = isObj ? (raffle.ranking_config.enabled || false) : false;
    const pricePerNumber = raffle?.price_per_number || 0;

    const top = [...counts.entries()]
      .filter(([id, qty]) => {
          if (!isEnabled || !minPurchaseConfig) return true;
          return (qty * pricePerNumber) >= minPurchaseConfig;
      })
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxPosition || 100);"""

content = content.replace(old_logic, new_logic)

# 2. getAllRaffles & getRaffleById mapping
map_logic_old_1 = "rankingConfig: data.ranking_config || [],"
map_logic_new_1 = """rankingConfig: (data.ranking_config && !Array.isArray(data.ranking_config)) ? (data.ranking_config.prizes || []) : (data.ranking_config || []),
      rankingSettings: (data.ranking_config && !Array.isArray(data.ranking_config)) ? { enabled: data.ranking_config.enabled || false, minValue: data.ranking_config.minValue || 0 } : { enabled: false, minValue: 0 },"""
content = content.replace(map_logic_old_1, map_logic_new_1)

map_logic_old_2 = "rankingConfig: r.ranking_config || [],"
map_logic_new_2 = """rankingConfig: (r.ranking_config && !Array.isArray(r.ranking_config)) ? (r.ranking_config.prizes || []) : (r.ranking_config || []),
        rankingSettings: (r.ranking_config && !Array.isArray(r.ranking_config)) ? { enabled: r.ranking_config.enabled || false, minValue: r.ranking_config.minValue || 0 } : { enabled: false, minValue: 0 },"""
content = content.replace(map_logic_old_2, map_logic_new_2)

# 3. createRaffle & updateRaffle
create_old = "ranking_config: data.rankingConfig || [],"
create_new = """ranking_config: {
            prizes: data.rankingConfig || [],
            enabled: data.rankingSettings?.enabled ?? false,
            minValue: data.rankingSettings?.minValue ?? 0
          },"""
content = content.replace(create_old, create_new)

update_old = "ranking_config: updates.rankingConfig,"
update_new = """ranking_config: updates.rankingConfig || updates.rankingSettings ? {
              prizes: updates.rankingConfig || [],
              enabled: updates.rankingSettings?.enabled ?? false,
              minValue: updates.rankingSettings?.minValue ?? 0
          } : undefined,"""
content = content.replace(update_old, update_new)

with open("services/raffleService.ts", "w") as f:
    f.write(content)

