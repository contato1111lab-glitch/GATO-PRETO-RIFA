import re

with open("components/TopBuyersRanking.tsx", "r") as f:
    content = f.read()

props_old = "manualEntries?: { name: string; phone?: string; totalTickets: number }[];"
props_new = """manualEntries?: { name: string; phone?: string; totalTickets: number }[];
  rankingSettings?: { enabled: boolean; minValue: number };"""
content = content.replace(props_old, props_new)

sig_old = "export const TopBuyersRanking: React.FC<TopBuyersRankingProps> = ({ raffleId, config, pricePerNumber, startDate, endDate, manualEntries }) => {"
sig_new = "export const TopBuyersRanking: React.FC<TopBuyersRankingProps> = ({ raffleId, config, pricePerNumber, startDate, endDate, manualEntries, rankingSettings }) => {"
content = content.replace(sig_old, sig_new)

# Add visual message if enabled
ui_old = """        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center">
            <Trophy className="text-brand-primary w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">Top Compradores</h3>
            <p className="text-zinc-500 text-xs">Os maiores compradores desta rifa</p>
          </div>
        </div>"""

ui_new = """        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center">
            <Trophy className="text-brand-primary w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">Top Compradores</h3>
            <p className="text-zinc-500 text-xs">Os maiores compradores desta rifa</p>
            {rankingSettings?.enabled && rankingSettings?.minValue > 0 && (
                <p className="text-brand-primary/80 text-[10px] font-black uppercase tracking-widest mt-1">
                  Mínimo para participar: R$ {rankingSettings.minValue.toFixed(2).replace('.', ',')} em compras
                </p>
            )}
          </div>
        </div>"""
content = content.replace(ui_old, ui_new)

with open("components/TopBuyersRanking.tsx", "w") as f:
    f.write(content)

