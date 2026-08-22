import re

with open("components/TopBuyersRanking.tsx", "r") as f:
    content = f.read()

target = """      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
            <Trophy className="text-brand-primary" size={20} />
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">Top Compradores</h3>
        </div>
        {status === 'ended' ? (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-800/60 rounded border border-zinc-700">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-500"></div>
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wide">Encerrado</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-900/20 rounded border border-blue-900/30">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse"></div>
              <span className="text-[10px] text-brand-primary font-bold uppercase tracking-wide">Ao Vivo</span>
          </div>
        )}
      </div>"""

replacement = """      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
            <Trophy className="text-brand-primary" size={20} />
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">Top Compradores</h3>
        </div>
        {status === 'ended' ? (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-800/60 rounded border border-zinc-700">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-500"></div>
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wide">Encerrado</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-900/20 rounded border border-blue-900/30">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse"></div>
              <span className="text-[10px] text-brand-primary font-bold uppercase tracking-wide">Ao Vivo</span>
          </div>
        )}
      </div>
      
      {rankingSettings?.enabled && rankingSettings?.minValue > 0 && (
          <p className="text-xs text-zinc-400 mb-4">
              Participe com no mínimo R$ {rankingSettings.minValue.toFixed(2).replace('.', ',')} em compras nesta campanha.
          </p>
      )}"""

content = content.replace(target, replacement)

with open("components/TopBuyersRanking.tsx", "w") as f:
    f.write(content)

