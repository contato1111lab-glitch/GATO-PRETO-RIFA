import React, { useState, useEffect, useCallback } from 'react';
import { Search, Ticket as TicketIcon, CheckCircle2, ChevronRight, ArrowLeft, Copy, Check, ShieldCheck, Lock, User, Loader2, AlertTriangle, UserCheck, MapPin, Calendar, Phone, Mail, FileText, LogIn, LockKeyhole } from 'lucide-react';
import { raffleService } from '../services/raffleService';
import { Purchase, Profile, RaffleStatus } from '../types';
import { useCustomerAuth } from '../context/CustomerContext';
import { motion, AnimatePresence } from 'motion/react';

export const MyTickets: React.FC = () => {
  const { customer, openAuthModal, login } = useCustomerAuth();
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [purchases, setPurchases] = useState<Purchase[] | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isPendingRegistration, setIsPendingRegistration] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedRaffleId, setSelectedRaffleId] = useState<string | null>(null);
  const [copiedPix, setCopiedPix] = useState<string | null>(null);

  // Auto load tickets if user is logged in
  const loadCustomerTickets = useCallback(async (cleanCpf: string, cleanPhone: string) => {
    if (!cleanCpf || !cleanPhone) return;
    setLoading(true);
    setSelectedRaffleId(null);
    setFormError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/tickets/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf: cleanCpf, phone: cleanPhone })
      });

      const data = await res.json();
      if (data.success) {
        setProfile(data.profile);
        setPurchases(data.purchases);
        
        const isComplete = data.registrationComplete;
        setIsPendingRegistration(!isComplete);
        setSearched(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (customer && customer.cpf && customer.phone) {
      const cleanCpf = customer.cpf.replace(/\D/g, '');
      const cleanPhone = customer.phone.replace(/\D/g, '');
      if (cleanCpf.length === 11) {
        let masked = cleanCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        setCpf(masked);
        
        loadCustomerTickets(cleanCpf, cleanPhone);
      }
    }
  }, [customer, loadCustomerTickets]);

  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    if (value.length > 10) value = value.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
    else if (value.length > 5) value = value.replace(/^(\d{2})(\d{4})(\d{0,4})$/, "($1) $2-$3");
    else if (value.length > 2) value = value.replace(/^(\d{2})(\d{0,5})$/, "($1) $2");
    setPhone(value);
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanCpf = cpf.replace(/\D/g, "");
    const cleanPhone = phone.replace(/\D/g, "");

    if (cleanCpf.length < 11 || cleanPhone.length < 10) return;
    if (value.length > 11) value = value.slice(0, 11);
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    setCpf(value);
  };
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCpf = cpf.replace(/\D/g, '');

    if (cleanCpf.length < 11) return;

    setLoading(true);
    setSelectedRaffleId(null);
    setFormError(null);
    setSuccessMsg(null);

    try {
      await login(cleanCpf);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('Nenhum cadastro')) {
        setFormError('Você ainda não possui uma conta.');
      } else {
        setFormError('CPF incorreto ou conta não encontrada.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPix = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedPix(code);
    setTimeout(() => setCopiedPix(null), 2000);
  };

  const groupedPurchases = purchases ? purchases.reduce((acc, purchase) => {
    if (!acc[purchase.raffleId]) {
      acc[purchase.raffleId] = {
        raffleName: purchase.raffleName || 'Rifa Desconhecida',
        raffleImageUrl: purchase.raffleImageUrl,
        raffleStatus: purchase.raffleStatus,
        purchases: []
      };
    }
    acc[purchase.raffleId].purchases.push(purchase);
    return acc;
  }, {} as Record<string, { raffleName: string, raffleImageUrl?: string, raffleStatus?: RaffleStatus, purchases: Purchase[] }>) : {};

  const visibleGroups = Object.entries(groupedPurchases);
  const selectedGroup = selectedRaffleId ? groupedPurchases[selectedRaffleId] : null;

  return (
    <div className="max-w-5xl mx-auto min-h-[80vh] px-4 py-12 animate-in fade-in duration-700">
      {!customer ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-lg mx-auto">
          <div className="w-20 h-20 bg-brand-primary/10 border border-brand-primary/30 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-brand-primary/5">
            <TicketIcon size={32} className="text-brand-primary" />
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4 uppercase tracking-tighter">Acesse seus bilhetes</h2>
          <p className="text-zinc-400 text-sm font-bold mb-8">Faça login com seu CPF e Telefone para visualizar todas as suas compras e bilhetes da sorte.</p>
          <button 
              onClick={() => openAuthModal('login')}
              className="w-full px-10 py-5 bg-brand-primary hover:bg-brand-primary-dark text-black font-black rounded-2xl transition-all shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2 uppercase tracking-tighter text-lg"
          >
              <LogIn size={24} /> Entrar na Minha Conta
          </button>
        </div>
      ) : (
        <>
          <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary/10 border border-brand-primary/20 rounded-full text-brand-primary text-[10px] font-black uppercase tracking-widest mb-6">
                  <TicketIcon size={14} /> Meus Bilhetes
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-4 uppercase tracking-tighter">Seus Bilhetes</h2>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Acompanhe suas participações</p>
          </div>
        </>
      )}

      {/* SUCCESS TOAST MESSAGE */}
      {successMsg && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-brand-primary/10 border-2 border-brand-primary/40 rounded-3xl p-6 mb-8 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-brand-primary-light font-black text-lg uppercase tracking-tight">
            <CheckCircle2 size={24} /> {successMsg}
          </div>
        </motion.div>
      )}

      {/* PENDING REGISTRATION SCREEN */}
      {searched && !isPendingRegistration && visibleGroups.length === 0 && !loading && (
        <div className="text-center py-20 bg-brand-card border border-brand-border rounded-3xl">
          <TicketIcon className="w-20 h-20 mx-auto mb-6 text-zinc-800" />
          <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Nenhum bilhete encontrado</h3>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Nenhuma cota registrada para este CPF</p>
        </div>
      )}

      <AnimatePresence mode="wait">
        {searched && !isPendingRegistration && !selectedRaffleId && visibleGroups.length > 0 && (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
            {visibleGroups.map(([raffleId, group]) => (
                <div 
                key={raffleId} 
                onClick={() => setSelectedRaffleId(raffleId)}
                className="group bg-brand-card border border-brand-border rounded-3xl overflow-hidden cursor-pointer hover:border-brand-primary/50 transition-all shadow-xl"
                >
                <div className="aspect-video w-full relative overflow-hidden bg-brand-bg">
                    {group.raffleImageUrl ? (
                    <img 
                        src={group.raffleImageUrl} 
                        alt={group.raffleName} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <TicketIcon className="text-zinc-800 w-16 h-16" />
                    </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-transparent to-transparent flex items-end p-6">
                    <div className="flex items-center gap-2">
                        {group.raffleStatus === RaffleStatus.ACTIVE ? (
                        <span className="px-3 py-1 rounded-full bg-green-500 text-black text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-500/20">
                            ATIVA
                        </span>
                        ) : (
                        <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                            ENCERRADA
                        </span>
                        )}
                    </div>
                    </div>
                </div>
                
                <div className="p-6">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4 group-hover:text-brand-primary transition-colors">
                    {group.raffleName}
                    </h3>
                    <div className="flex justify-between items-center">
                    <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{group.purchases.length} compras realizadas</span>
                    <div className="w-10 h-10 bg-brand-bg rounded-xl flex items-center justify-center text-zinc-500 group-hover:text-brand-primary group-hover:translate-x-1 transition-all">
                        <ChevronRight size={20} />
                    </div>
                    </div>
                </div>
                </div>
            ))}
            </motion.div>
        )}

        {searched && !isPendingRegistration && selectedRaffleId && selectedGroup && (
            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
            >
            <button 
                onClick={() => setSelectedRaffleId(null)}
                className="flex items-center gap-2 text-zinc-500 hover:text-white text-xs font-black uppercase tracking-widest transition-colors mb-4"
            >
                <ArrowLeft size={20} /> Voltar para lista
            </button>

            <div className="bg-brand-card border border-brand-border rounded-3xl overflow-hidden shadow-2xl">
                <div className="relative h-48 md:h-64 border-b border-brand-border">
                {selectedGroup.raffleImageUrl ? (
                    <img 
                        src={selectedGroup.raffleImageUrl} 
                        alt={selectedGroup.raffleName} 
                        className="w-full h-full object-cover opacity-30"
                    />
                    ) : (
                    <div className="w-full h-full bg-brand-bg" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-card via-brand-card/60 to-transparent flex items-end p-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                        {selectedGroup.raffleStatus === RaffleStatus.ACTIVE ? (
                            <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest border border-green-500/20">
                                ATIVA
                            </span>
                        ) : (
                            <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest border border-zinc-700">
                                ENCERRADA
                            </span>
                        )}
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">{selectedGroup.raffleName}</h2>
                    </div>
                    </div>
                </div>

                <div className="p-8 space-y-10">
                {/* PURCHASES & TICKETS LIST */}
                {(() => {
                    const allTickets = selectedGroup.purchases.flatMap(p => p.ticketNumbers || []).sort((a, b) => (a || 0) - (b || 0));
                    const totalQuantity = allTickets.length;

                    return (
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-3 bg-brand-bg px-6 py-4 rounded-2xl text-white border border-brand-border shadow-inner">
                                    <TicketIcon size={24} className="text-brand-primary" />
                                    <span className="font-black text-xl uppercase tracking-tighter">{totalQuantity} cotas cadastradas</span>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                {allTickets.length > 0 ? (
                                    allTickets.map(num => (
                                        <div key={num} className="bg-brand-bg border border-brand-border text-brand-primary px-4 py-3 rounded-2xl text-lg font-black font-mono text-center hover:border-brand-primary/50 transition-all cursor-default select-all shadow-sm">
                                            {String(num).padStart(6, '0')}
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full bg-brand-bg border border-brand-border p-8 rounded-3xl text-center">
                                        <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">Nenhum bilhete encontrado nesta rifa.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })()}
                </div>
            </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
