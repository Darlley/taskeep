'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Bike, Clock, Smartphone, Radar, ShieldCheck, MapPin, Route, Bell, Shield, Activity, BadgeCheck, Check, Phone, Mail, MessageCircle, MessageSquare, Send, User } from 'lucide-react';

export default function HomePage() {
  useEffect(() => {
    // Initialize Lucide icons
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/lucide@latest';
    script.onload = () => {
      if (window.lucide) {
        window.lucide.createIcons();
      }
    };
    document.head.appendChild(script);

    // Initialize Chart.js
    const chartScript = document.createElement('script');
    chartScript.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    chartScript.onload = () => {
      initializeChart();
    };
    document.head.appendChild(chartScript);

    // Set current year
    const yearElement = document.getElementById('year');
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear().toString();
    }

    // Map functionality
    const mapBtn = document.getElementById('mapBtn');
    const mapInput = document.getElementById('mapQuery') as HTMLInputElement;
    const liveMap = document.getElementById('liveMap') as HTMLIFrameElement;
    const heroMap = document.getElementById('heroMap') as HTMLIFrameElement;

    mapBtn?.addEventListener('click', () => {
      const q = (mapInput?.value || 'Bairro Moema, São Paulo').trim();
      const src = 'https://www.google.com/maps?q=' + encodeURIComponent(q) + '&output=embed';
      if (liveMap) liveMap.src = src;
      if (heroMap) heroMap.src = src;
    });

    return () => {
      document.head.removeChild(script);
      document.head.removeChild(chartScript);
    };
  }, []);

  const initializeChart = () => {
    const ctx = (document.getElementById('crimeChart') as HTMLCanvasElement)?.getContext('2d');
    if (ctx && window.Chart) {
      const gradient = ctx.createLinearGradient(0, 0, 0, 160);
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0.02)');
      new window.Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago'],
          datasets: [{
            label: 'Ocorrências',
            data: [18, 15, 14, 12, 10, 8],
            borderColor: 'rgba(16, 185, 129, 0.9)',
            backgroundColor: gradient,
            borderWidth: 2,
            pointRadius: 2,
            tension: 0.35,
            fill: true,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(17,17,17,0.9)',
              borderColor: 'rgba(255,255,255,0.1)',
              borderWidth: 1,
              titleColor: '#fff',
              bodyColor: '#e5e5e5',
              displayColors: false,
              padding: 10
            }
          },
          scales: {
            x: {
              grid: { color: 'rgba(255,255,255,0.05)' },
              ticks: { color: 'rgba(229,229,229,0.8)', font: { size: 11 } }
            },
            y: {
              grid: { color: 'rgba(255,255,255,0.05)' },
              ticks: { color: 'rgba(229,229,229,0.8)', font: { size: 11 }, stepSize: 2, beginAtZero: true }
            }
          }
        }
      });
    }
  };

  return (
    <div className="bg-neutral-950 text-neutral-100 antialiased selection:bg-neutral-800 selection:text-white/90" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/60 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="#" className="flex items-center gap-2 group">
            <div className="h-7 w-7 rounded-sm bg-white text-neutral-900 grid place-items-center ring-1 ring-white/10 shadow-sm group-hover:ring-white/20 transition">
              <span className="text-[12px] font-semibold tracking-tight">OS</span>
            </div>
            <span className="text-sm sm:text-base font-medium tracking-tight text-white/90">GIROFLEX</span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm text-neutral-300">
            <Link href="#solucoes" className="hover:text-white transition-colors">Soluções</Link>
            <Link href="#mapa" className="hover:text-white transition-colors">Mapa</Link>
            <Link href="#planos" className="hover:text-white transition-colors">Planos</Link>
            <Link href="#contato" className="hover:text-white transition-colors">Contato</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="#contato" className="hidden sm:inline-flex items-center gap-2 rounded-md border border-white/10 px-3.5 py-2 text-sm text-white/90 hover:text-white hover:border-white/20 transition">
              <Phone className="w-4 h-4" strokeWidth={1.5} />
              Solicitar visita
            </Link>
            <Link href="/signin" className="inline-flex items-center gap-2 rounded-md bg-white text-neutral-900 px-3.5 py-2 text-sm font-medium hover:bg-neutral-200 transition">
              <User className="w-4 h-4" strokeWidth={1.5} />
              Área do cliente
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-fuchsia-500/10 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl"></div>
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                <Radar className="w-3.5 h-3.5" strokeWidth={1.5} />
                Monitoramento ativo, foco no seu bairro
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white">
                Segurança de bairro, em tempo real.
              </h1>
              <p className="text-base sm:text-lg text-neutral-300">
                Rondas de moto, resposta rápida e tecnologia de monitoramento para residências que confiam em nós. Seriedade, presença e dados — sem complicação.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link href="#contato" className="inline-flex items-center justify-center gap-2 rounded-md bg-white text-neutral-900 px-5 py-3 text-sm font-medium hover:bg-neutral-200 transition">
                  <ShieldCheck className="w-5 h-5" strokeWidth={1.5} />
                  Falar com especialista
                </Link>
                <Link href="#mapa" className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/90 hover:text-white hover:border-white/20 transition">
                  <MapPin className="w-5 h-5" strokeWidth={1.5} />
                  Ver cobertura no mapa
                </Link>
              </div>
              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2 text-white/80">
                  <Bike className="w-4.5 h-4.5" strokeWidth={1.5} />
                  <span className="text-sm">Rondas de moto 24/7</span>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-white/80">
                  <Clock className="w-4.5 h-4.5" strokeWidth={1.5} />
                  <span className="text-sm">Resposta &lt; 6 minutos</span>
                </div>
                <div className="hidden lg:flex items-center gap-2 text-white/80">
                  <Smartphone className="w-4.5 h-4.5" strokeWidth={1.5} />
                  <span className="text-sm">App do cliente</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-xl border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.03] p-2 shadow-2xl">
                <div className="rounded-lg overflow-hidden border border-white/10 bg-black">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                      <span className="text-xs text-white/80">Ronda agora: Online</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-white/60">
                      <div className="hidden sm:flex items-center gap-1">
                        <Route className="w-3.5 h-3.5" strokeWidth={1.5} />
                        <span>Rotas</span>
                      </div>
                      <div className="hidden sm:flex items-center gap-1">
                        <Bell className="w-3.5 h-3.5" strokeWidth={1.5} />
                        <span>Alertas</span>
                      </div>
                    </div>
                  </div>
                  <div className="aspect-[16/10] w-full">
                    <iframe 
                      id="heroMap" 
                      title="Mapa do bairro" 
                      className="w-full h-full" 
                      referrerPolicy="no-referrer-when-downgrade" 
                      loading="lazy" 
                      src="https://www.google.com/maps?q=Bairro%20Moema,%20S%C3%A3o%20Paulo&output=embed"
                    />
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-5 -right-3 hidden sm:flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 backdrop-blur">
                <Shield className="w-4.5 h-4.5 text-emerald-400" strokeWidth={1.5} />
                <span className="text-xs text-white/80">Cobertura verificada</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Soluções */}
      <section id="solucoes" className="py-16 sm:py-20 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">Soluções focadas no seu bairro</h2>
            <p className="mt-2 text-neutral-300">Tecnologia e presença física para quem exige seriedade e resultado.</p>
          </div>

          <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="group rounded-lg border border-white/10 bg-white/[0.03] p-5 hover:border-white/20 transition">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 grid place-items-center rounded-md bg-white/5 ring-1 ring-white/10">
                  <Bike className="w-5 h-5 text-white/90" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-medium tracking-tight text-white">Rondas de moto</h3>
              </div>
              <p className="mt-3 text-sm text-neutral-300">Percursos inteligentes, horários aleatórios e presença constante no perímetro.</p>
            </div>

            <div className="group rounded-lg border border-white/10 bg-white/[0.03] p-5 hover:border-white/20 transition">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 grid place-items-center rounded-md bg-white/5 ring-1 ring-white/10">
                  <Smartphone className="w-5 h-5 text-white/90" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-medium tracking-tight text-white">App do cliente</h3>
              </div>
              <p className="mt-3 text-sm text-neutral-300">Acompanhe rondas, receba alertas e solicite apoio com 1 toque.</p>
            </div>

            <div className="group rounded-lg border border-white/10 bg-white/[0.03] p-5 hover:border-white/20 transition">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 grid place-items-center rounded-md bg-white/5 ring-1 ring-white/10">
                  <Bell className="w-5 h-5 text-white/90" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-medium tracking-tight text-white">Botão de pânico</h3>
              </div>
              <p className="mt-3 text-sm text-neutral-300">Acionamento imediato com geolocalização e confirmação de equipe.</p>
            </div>

            <div className="group rounded-lg border border-white/10 bg-white/[0.03] p-5 hover:border-white/20 transition">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 grid place-items-center rounded-md bg-white/5 ring-1 ring-white/10">
                  <Route className="w-5 h-5 text-white/90" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-medium tracking-tight text-white">Rotas inteligentes</h3>
              </div>
              <p className="mt-3 text-sm text-neutral-300">Cobertura eficiente baseada em dados e pontos de atenção do bairro.</p>
            </div>

            <div className="group rounded-lg border border-white/10 bg-white/[0.03] p-5 hover:border-white/20 transition">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 grid place-items-center rounded-md bg-white/5 ring-1 ring-white/10">
                  <Clock className="w-5 h-5 text-white/90" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-medium tracking-tight text-white">Resposta rápida</h3>
              </div>
              <p className="mt-3 text-sm text-neutral-300">Equipe pronta para agir em minutos, com protocolos claros.</p>
            </div>

            <div className="group rounded-lg border border-white/10 bg-white/[0.03] p-5 hover:border-white/20 transition">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 grid place-items-center rounded-md bg-white/5 ring-1 ring-white/10">
                  <ShieldCheck className="w-5 h-5 text-white/90" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-medium tracking-tight text-white">Relatórios e auditoria</h3>
              </div>
              <p className="mt-3 text-sm text-neutral-300">Histórico de rondas, eventos e SLA para total transparência.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mapa */}
      <section id="mapa" className="py-16 sm:py-20 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-2/3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">Cobertura no mapa</h2>
                  <p className="mt-2 text-neutral-300">Pesquise o bairro atendido e visualize rotas e pontos de atenção.</p>
                </div>
                <div className="hidden md:flex items-center gap-2 text-xs text-white/70">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-400"></div>
                  <span>Equipe em ronda</span>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-white/10 overflow-hidden">
                <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-3 py-3">
                  <MapPin className="w-4.5 h-4.5 text-white/80" strokeWidth={1.5} />
                  <input 
                    id="mapQuery" 
                    type="text" 
                    placeholder="Ex.: Bairro Moema, São Paulo" 
                    className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-white/40"
                  />
                  <button 
                    id="mapBtn" 
                    className="inline-flex items-center gap-2 rounded-md bg-white text-neutral-900 px-3 py-1.5 text-xs font-medium hover:bg-neutral-200 transition"
                  >
                    <i data-lucide="search" className="w-4 h-4" style={{strokeWidth: 1.5}}></i>
                    Atualizar mapa
                  </button>
                </div>
                <div className="aspect-[16/9] w-full bg-black">
                  <iframe 
                    id="liveMap" 
                    title="Mapa interativo do bairro" 
                    className="w-full h-full" 
                    referrerPolicy="no-referrer-when-downgrade" 
                    loading="lazy" 
                    src="https://www.google.com/maps?q=Bairro%20Moema,%20S%C3%A3o%20Paulo&output=embed"
                  />
                </div>
              </div>
              <p className="mt-3 text-xs text-white/50">Imagens do mapa: Google Maps (ilustrativo). Configuramos sua base com rotas, zonas e pontos críticos reais.</p>
            </div>

            <div className="w-full lg:w-1/3">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center gap-2">
                  <Activity className="w-4.5 h-4.5 text-white/80" strokeWidth={1.5} />
                  <h3 className="text-lg font-medium tracking-tight text-white">Indicadores do bairro</h3>
                </div>
                <p className="mt-1 text-sm text-neutral-300">Tendência de ocorrências (últimos 6 meses)</p>
                <div className="mt-6">
                  <div className="h-40">
                    <canvas id="crimeChart"></canvas>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-lg border border-white/10 p-3">
                    <div className="text-sm text-white/70">Tempo médio</div>
                    <div className="text-base font-medium text-white">5m32s</div>
                  </div>
                  <div className="rounded-lg border border-white/10 p-3">
                    <div className="text-sm text-white/70">Rotas/dia</div>
                    <div className="text-base font-medium text-white">18</div>
                  </div>
                  <div className="rounded-lg border border-white/10 p-3">
                    <div className="text-sm text-white/70">Alertas</div>
                    <div className="text-base font-medium text-white">2</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="w-4.5 h-4.5 text-emerald-400" strokeWidth={1.5} />
                  <h3 className="text-lg font-medium tracking-tight text-white">SLA e transparência</h3>
                </div>
                <ul className="mt-3 space-y-2 text-sm text-neutral-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
                    Registro de rondas com horário e rota.
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
                    Evidência por foto quando aplicável.
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
                    Relatórios mensais enviados por e-mail.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Planos */}
      <section id="planos" className="py-16 sm:py-20 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">Planos simples e diretos</h2>
            <p className="mt-2 text-neutral-300">Assinaturas mensais com cobertura do seu endereço. Sem burocracia.</p>
          </div>

          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {/* Básico */}
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 hover:border-white/20 transition">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium tracking-tight text-white">Básico</h3>
                <span className="text-xs text-white/60">Residencial</span>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-semibold tracking-tight text-white">R$ 149</div>
                <div className="text-xs text-white/60">/mês por residência</div>
              </div>
              <ul className="mt-5 space-y-2 text-sm text-neutral-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
                  6 rondas diárias
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
                  App do cliente
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
                  Relatório mensal
                </li>
              </ul>
              <Link href="#contato" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/90 hover:text-white hover:border-white/20 transition">
                Assinar
              </Link>
            </div>

            {/* Essencial */}
            <div className="rounded-xl border border-white/20 bg-white/[0.06] p-6 ring-1 ring-white/10 shadow-lg relative">
              <span className="absolute -top-3 right-4 rounded-full bg-emerald-400/90 text-neutral-900 text-xs px-2 py-0.5 font-medium">Recomendado</span>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium tracking-tight text-white">Essencial</h3>
                <span className="text-xs text-white/60">Residencial+</span>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-semibold tracking-tight text-white">R$ 229</div>
                <div className="text-xs text-white/60">/mês por residência</div>
              </div>
              <ul className="mt-5 space-y-2 text-sm text-neutral-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
                  10 rondas diárias
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
                  Botão de pânico
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
                  Relatório semanal
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
                  Suporte prioritário
                </li>
              </ul>
              <Link href="#contato" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-white text-neutral-900 px-4 py-2.5 text-sm font-medium hover:bg-neutral-200 transition">
                Assinar
              </Link>
            </div>

            {/* Premium */}
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 hover:border-white/20 transition">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium tracking-tight text-white">Premium</h3>
                <span className="text-xs text-white/60">Comercial</span>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-semibold tracking-tight text-white">R$ 349</div>
                <div className="text-xs text-white/60">/mês por estabelecimento</div>
              </div>
              <ul className="mt-5 space-y-2 text-sm text-neutral-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
                  15 rondas diárias
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
                  Múltiplos botões de pânico
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
                  Relatório diário
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
                  Suporte 24/7
                </li>
              </ul>
              <Link href="#contato" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/90 hover:text-white hover:border-white/20 transition">
                Assinar
              </Link>
            </div>
          </div>

          <div className="mt-10 text-center">
            <p className="text-sm text-neutral-300">Todos os planos incluem:</p>
            <div className="mt-4 flex flex-wrap justify-center gap-6 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
                <span>Sem taxa de adesão</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
                <span>Cancelamento a qualquer momento</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
                <span>Primeira semana grátis</span>
              </div>
            </div>
            <div className="mt-6">
              <Link href="#contato" className="inline-flex items-center gap-2 rounded-md bg-white text-neutral-900 px-6 py-3 text-sm font-medium hover:bg-neutral-200 transition">
                <MessageSquare className="w-5 h-5" strokeWidth={1.5} />
                WhatsApp
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contato */}
      <section id="contato" className="py-16 sm:py-20 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">Solicite uma proposta</h2>
              <p className="mt-2 text-neutral-300">Conte-nos seu endereço e preferências. Nossa equipe responde em até 1 dia útil.</p>

              <form className="mt-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/70 mb-1">Nome</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/20" 
                      placeholder="Seu nome"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/70 mb-1">Telefone/WhatsApp</label>
                    <input 
                      type="tel" 
                      required 
                      className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/20" 
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-white/70 mb-1">E-mail</label>
                  <input 
                    type="email" 
                    className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/20" 
                    placeholder="seuemail@exemplo.com"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/70 mb-1">Endereço</label>
                  <input 
                    type="text" 
                    className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/20" 
                    placeholder="Rua, número, bairro, cidade"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/70 mb-1">Mensagem</label>
                  <textarea 
                    rows={4} 
                    className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/20" 
                    placeholder="Horários preferidos, pontos de atenção, etc."
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-white/50">Ao enviar, você concorda com nossos Termos e Política de Privacidade.</div>
                  <button 
                    type="submit" 
                    className="inline-flex items-center gap-2 rounded-md bg-white text-neutral-900 px-4 py-2.5 text-sm font-medium hover:bg-neutral-200 transition"
                  >
                    <Send className="w-4.5 h-4.5" strokeWidth={1.5} />
                    Enviar
                  </button>
                </div>
              </form>
            </div>

            <div className="rounded-xl border border-white/10 bg-[url('https://images.unsplash.com/photo-1509098681026-7c1f8b484833?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center">
              <div className="backdrop-brightness-[.45] bg-neutral-950/50 h-full w-full rounded-xl p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-white/80" strokeWidth={1.5} />
                    <div>
                      <div className="text-sm text-white/80">Base Operacional</div>
                      <div className="text-sm font-medium text-white">Seu Bairro, Sua Cidade</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-white/80" strokeWidth={1.5} />
                    <div>
                      <div className="text-sm text-white/80">Comercial</div>
                      <a href="tel:+550000000000" className="text-sm font-medium text-white hover:underline">+55 (00) 0000-0000</a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-white/80" strokeWidth={1.5} />
                    <div>
                      <div className="text-sm text-white/80">E-mail</div>
                      <a href="mailto:contato@giroflex.com" className="text-sm font-medium text-white hover:underline">contato@giroflex.com</a>
                    </div>
                  </div>
                  <div className="pt-2">
                    <a href="https://wa.me/5500000000000" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-md bg-emerald-400/90 text-neutral-900 px-4 py-2.5 text-sm font-medium hover:bg-emerald-300 transition">
                      <MessageCircle className="w-5 h-5" strokeWidth={1.5} />
                      Atendimento imediato
                    </a>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                    <div className="text-xs text-white/60">Atendimento</div>
                    <div className="text-sm font-medium text-white">24/7</div>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                    <div className="text-xs text-white/60">Cobertura</div>
                    <div className="text-sm font-medium text-white">Bairro específico</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-sm bg-white text-neutral-900 grid place-items-center ring-1 ring-white/10 shadow-sm">
                <span className="text-[12px] font-semibold tracking-tight">OS</span>
              </div>
              <div>
                <div className="text-sm font-medium tracking-tight text-white/90">GIROFLEX</div>
                <div className="text-xs text-white/50">Seriedade + tecnologia para o seu bairro.</div>
              </div>
            </div>
            <div className="flex gap-6 text-sm text-neutral-300">
              <Link href="#" className="hover:text-white transition-colors">Termos</Link>
              <Link href="#" className="hover:text-white transition-colors">Privacidade</Link>
              <Link href="#contato" className="hover:text-white transition-colors">Contato</Link>
            </div>
          </div>
          <div className="mt-6 text-xs text-white/40">© <span id="year"></span> GIROFLEX. Todos os direitos reservados.</div>
        </div>
      </footer>
    </div>
  );
}

// Declare global types for external libraries
declare global {
  interface Window {
    lucide: any;
    Chart: any;
  }
}