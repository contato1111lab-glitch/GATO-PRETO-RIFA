import re

with open("components/AdminPanel.tsx", "r") as f:
    content = f.read()

# State variable
state_var = """  const [rankingConfig, setRankingConfig] = useState<{ position: number; prize: string }[]>([]);
  const [rankingSettings, setRankingSettings] = useState({ enabled: false, minValue: 0 });"""
content = content.replace("  const [rankingConfig, setRankingConfig] = useState<{ position: number; prize: string }[]>([]);", state_var)

# handleOpenEdit
edit_logic = """      setRankingConfig(raffle.rankingConfig || []); // Load ranking config
      setRankingSettings(raffle.rankingSettings || { enabled: false, minValue: 0 });"""
content = content.replace("      setRankingConfig(raffle.rankingConfig || []); // Load ranking config", edit_logic)

# handleOpenCreate
create_logic = """      setRankingConfig([]); // Reset ranking config
      setRankingSettings({ enabled: false, minValue: 0 });"""
content = content.replace("      setRankingConfig([]); // Reset ranking config", create_logic)

# handleSaveRaffle payloads
payload_1_old = "rankingConfig: rankingConfig, // Add ranking config"
payload_1_new = """rankingConfig: rankingConfig, // Add ranking config
            rankingSettings: rankingSettings,"""
content = content.replace(payload_1_old, payload_1_new)

# The UI section
ui_old = """                                        {/* Ranking Period Config */}
                                        <div className="grid grid-cols-2 gap-4 mb-6 border-b border-zinc-800 pb-6 bg-zinc-900/50 p-4 rounded-lg">"""

ui_new = """                                        {/* Ranking Settings Config */}
                                        <div className="mb-6 border-b border-zinc-800 pb-6 bg-zinc-900/50 p-4 rounded-lg space-y-4">
                                            <div className="flex items-center gap-3">
                                                <input 
                                                    type="checkbox" 
                                                    id="enableRankingValue"
                                                    checked={rankingSettings.enabled}
                                                    onChange={(e) => setRankingSettings({...rankingSettings, enabled: e.target.checked})}
                                                    className="w-4 h-4 rounded border-zinc-700 text-brand-primary focus:ring-brand-primary bg-black"
                                                />
                                                <label htmlFor="enableRankingValue" className="text-sm font-bold text-white cursor-pointer">
                                                    Ativar regra de valor mínimo (Apenas elegíveis entram no ranking)
                                                </label>
                                            </div>
                                            
                                            {rankingSettings.enabled && (
                                                <div className="animate-in fade-in slide-in-from-top-1">
                                                    <label className="label-admin">Valor mínimo para participar (R$)</label>
                                                    <input 
                                                        type="number"
                                                        placeholder="Ex: 50.00"
                                                        className="input-admin w-1/3"
                                                        value={rankingSettings.minValue || ''}
                                                        onChange={(e) => setRankingSettings({...rankingSettings, minValue: parseFloat(e.target.value) || 0})}
                                                    />
                                                    <p className="text-[10px] text-zinc-500 mt-1">
                                                        Somente compradores cujo <strong>total de cotas PAGAS multiplicadas pelo preço da cota</strong> for igual ou superior a este valor aparecerão no pódio.
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Ranking Period Config */}
                                        <div className="grid grid-cols-2 gap-4 mb-6 border-b border-zinc-800 pb-6 bg-zinc-900/50 p-4 rounded-lg">"""

content = content.replace(ui_old, ui_new)

with open("components/AdminPanel.tsx", "w") as f:
    f.write(content)

