import re

with open("services/raffleService.ts", "r") as f:
    content = f.read()

# Replace getRaffleById mapping
map_logic_old_1 = """rankingConfig: (data.ranking_config && !Array.isArray(data.ranking_config)) ? (data.ranking_config.prizes || []) : (data.ranking_config || []),
      rankingSettings: (data.ranking_config && !Array.isArray(data.ranking_config)) ? { enabled: data.ranking_config.enabled || false, minValue: data.ranking_config.minValue || 0 } : { enabled: false, minValue: 0 },"""

map_logic_new_1 = """rankingConfig: (() => {
        let rc = data.ranking_config;
        if (typeof rc === 'string') { try { rc = JSON.parse(rc); } catch(e){} }
        return (rc && !Array.isArray(rc)) ? (rc.prizes || []) : (rc || []);
      })(),
      rankingSettings: (() => {
        let rc = data.ranking_config;
        if (typeof rc === 'string') { try { rc = JSON.parse(rc); } catch(e){} }
        return (rc && !Array.isArray(rc)) ? { enabled: rc.enabled || false, minValue: rc.minValue || 0 } : { enabled: false, minValue: 0 };
      })(),"""

content = content.replace(map_logic_old_1, map_logic_new_1)

# Replace getAllRaffles mapping
map_logic_old_2 = """rankingConfig: (r.ranking_config && !Array.isArray(r.ranking_config)) ? (r.ranking_config.prizes || []) : (r.ranking_config || []),
        rankingSettings: (r.ranking_config && !Array.isArray(r.ranking_config)) ? { enabled: r.ranking_config.enabled || false, minValue: r.ranking_config.minValue || 0 } : { enabled: false, minValue: 0 },"""

map_logic_new_2 = """rankingConfig: (() => {
          let rc = r.ranking_config;
          if (typeof rc === 'string') { try { rc = JSON.parse(rc); } catch(e){} }
          return (rc && !Array.isArray(rc)) ? (rc.prizes || []) : (rc || []);
        })(),
        rankingSettings: (() => {
          let rc = r.ranking_config;
          if (typeof rc === 'string') { try { rc = JSON.parse(rc); } catch(e){} }
          return (rc && !Array.isArray(rc)) ? { enabled: rc.enabled || false, minValue: rc.minValue || 0 } : { enabled: false, minValue: 0 };
        })(),"""

content = content.replace(map_logic_old_2, map_logic_new_2)

with open("services/raffleService.ts", "w") as f:
    f.write(content)

