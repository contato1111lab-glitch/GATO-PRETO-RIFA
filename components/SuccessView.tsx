import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  Home, 
  Ticket as TicketIcon
} from 'lucide-react';
import { motion } from 'motion/react';
import { raffleService } from '../services/raffleService';

interface SuccessViewProps {
  purchaseId: string;
  raffleName: string;
  raffleImage: string;
  numbers: number[];
  totalValue: number;
  onHome: () => void;
  onMyTickets: () => void;
}

export const SuccessView: React.FC<SuccessViewProps> = ({ 
    purchaseId,
    raffleName, 
    raffleImage, 
    numbers, 
    totalValue,
    onHome, 
    onMyTickets 
}) => {
  const [ticketNumbers, setTicketNumbers] = useState<number[]>(numbers || []);

  useEffect(() => {
    let isMounted = true;
    async function loadTickets() {
      if (ticketNumbers.length === 0 && purchaseId) {
        try {
          const purchase = await raffleService.getPurchaseById(purchaseId);
          if (isMounted && purchase?.ticketNumbers && purchase.ticketNumbers.length > 0) {
            setTicketNumbers(purchase.ticketNumbers);
          }
        } catch (err) {
          console.error('Error loading purchase in SuccessView:', err);
        }
      }
    }
    loadTickets();
    return () => { isMounted = false; };
  }, [purchaseId, ticketNumbers.length]);

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-6 animate-in fade-in duration-700 max-w-3xl mx-auto pb-20">
      {/* Status Header */}
      <div className="flex flex-col items-center gap-4 mb-8 mt-4 text-center">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/20">
            <CheckCircle2 className="w-10 h-10 text-black" strokeWidth={3} />
        </div>
        <div>
            <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter">Pagamento identificado!</h2>
            <p className="text-zinc-400 text-xs font-black uppercase tracking-widest mt-1">Sua participação foi confirmada com sucesso</p>
        </div>
      </div>

      <div className="w-full space-y-6">
        {/* Ticket Numbers Card */}
        <div className="bg-brand-card border border-brand-border rounded-3xl p-6 md:p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <TicketIcon className="text-brand-primary" size={24} />
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Seus Bilhetes da Sorte</h3>
          </div>

          {ticketNumbers && ticketNumbers.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {ticketNumbers.map(num => (
                <div 
                  key={num} 
                  className="bg-brand-bg border border-brand-border text-brand-primary-light px-4 py-3 rounded-2xl text-lg font-black font-mono text-center hover:border-brand-primary/50 transition-all select-all shadow-sm"
                >
                  #{String(num).padStart(6, '0')}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-zinc-500 text-xs font-bold uppercase tracking-widest">
              Carregando bilhetes atribuídos...
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button 
              onClick={onMyTickets}
              className="w-full bg-brand-primary hover:bg-brand-primary-dark text-black font-black uppercase tracking-widest py-4 rounded-2xl transition-all shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2 text-base"
          >
              <TicketIcon size={20} /> Ver Meus Bilhetes
          </button>
          <button 
              onClick={onHome}
              className="w-full bg-zinc-900 border border-brand-border text-white font-black uppercase tracking-widest py-4 rounded-2xl hover:bg-brand-card transition-all flex items-center justify-center gap-2 text-base"
          >
              <Home size={20} /> Voltar para o Início
          </button>
        </div>
      </div>
    </div>
  );
};
