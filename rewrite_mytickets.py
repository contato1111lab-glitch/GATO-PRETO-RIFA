import re

with open("components/MyTickets.tsx", "r") as f:
    content = f.read()

# Locate the local login form:
# <div className="text-center mb-12">
# ...
# </form>

start_str = '<div className="text-center mb-12">'
end_str = '</form>'

start_idx = content.find(start_str)
end_idx = content.find(end_str) + len(end_str)

replacement = """<div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 uppercase tracking-tighter">Acesse seus bilhetes</h2>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-8">Faça login com seu CPF e Telefone para continuar</p>
            <button 
                onClick={() => openAuthModal('login')}
                className="mx-auto w-full max-w-sm px-10 py-4 bg-brand-primary hover:bg-brand-primary-dark text-black font-black rounded-2xl transition-all shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2 uppercase tracking-tighter"
            >
                <LogIn size={20} /> Entrar na Minha Conta
            </button>
          </div>"""

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + replacement + content[end_idx:]

with open("components/MyTickets.tsx", "w") as f:
    f.write(content)

