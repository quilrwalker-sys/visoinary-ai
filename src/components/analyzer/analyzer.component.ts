
import { Component, signal, ChangeDetectionStrategy, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AiService, AnalysisResult } from '../../services/ai.service.ts';

@Component({
  selector: 'app-analyzer',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<div class="max-w-4xl mx-auto space-y-6">
  <!-- Status da Chave de API -->
  @if (!hasKey()) {
    <div class="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl text-amber-200 flex items-center gap-4">
      <i class="fas fa-key text-xl animate-pulse"></i>
      <p class="text-sm">Configuração: Usando API_KEY do ambiente.</p>
    </div>
  }

  <!-- Área de Upload -->
  @if (!imagePreview()) {
    <div class="relative group h-80 w-full border-2 border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center transition-all hover:border-indigo-500/50 hover:bg-white/[0.02] cursor-pointer">
      <input 
        type="file" 
        (change)="onFileSelected($event)" 
        class="absolute inset-0 opacity-0 cursor-pointer z-10" 
        accept="image/jpeg, image/png, image/webp" 
      />
      <div class="w-16 h-16 bg-indigo-600/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <i class="fas fa-image text-2xl text-indigo-400"></i>
      </div>
      <h3 class="text-lg font-semibold text-slate-200">Escolha uma imagem</h3>
      <div class="flex flex-col items-center gap-2 mt-1">
        <p class="text-slate-500 text-sm">Clique ou arraste arquivos para analisar</p>
        <div class="flex items-center gap-2 mt-2">
          <span class="px-2 py-0.5 rounded text-[10px] bg-white/5 border border-white/10 text-slate-400">JPG</span>
          <span class="px-2 py-0.5 rounded text-[10px] bg-white/5 border border-white/10 text-slate-400">PNG</span>
          <span class="px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold">WEBP SUPPORTED</span>
        </div>
      </div>
    </div>
    
    @if (error()) {
      <div class="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm flex gap-3 items-center justify-center">
        <i class="fas fa-circle-exclamation"></i>
        <p>{{ error() }}</p>
      </div>
    }
  } @else {
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      <!-- Preview -->
      <div class="space-y-4">
        <div class="rounded-3xl overflow-hidden border border-white/10 bg-black/40 shadow-2xl relative group">
          <img [src]="imagePreview()" class="w-full h-auto max-h-[400px] object-contain mx-auto" alt="Preview">
          <button (click)="reset()" class="absolute top-4 right-4 w-10 h-10 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
            <i class="fas fa-times"></i>
          </button>
        </div>

        @if (!result() && !isAnalyzing()) {
          <div class="flex flex-col gap-3">
            <button (click)="startAnalysis('flash')" 
                    class="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20">
              <i class="fas fa-bolt"></i>
              Visionary 2.5 Flash <span class="text-[10px] opacity-70 font-normal ml-1">(rápido)</span>
            </button>
            
            <button (click)="startAnalysis('pro')" 
                    class="w-full py-4 bg-gradient-to-r from-violet-700 to-indigo-800 hover:from-violet-600 hover:to-indigo-700 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-900/20 border border-white/10">
              <i class="fas fa-microchip"></i>
              Visionary 2.5 Pro <span class="text-[10px] opacity-70 font-normal ml-1">(lento/profundo)</span>
            </button>
          </div>
        }

        @if (error()) {
          <div class="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm flex gap-3 items-start">
            <i class="fas fa-circle-exclamation mt-1"></i>
            <p>{{ error() }}</p>
          </div>
        }
      </div>

      <!-- Resultados -->
      <div class="min-h-[300px]">
        @if (isAnalyzing()) {
          <div class="h-full bg-white/5 border border-white/10 rounded-3xl p-10 flex flex-col items-center justify-center text-center space-y-6">
            <div class="custom-loader"></div>
            <div class="space-y-2">
              <p class="text-indigo-200 font-medium animate-pulse">{{ currentProgressMessage() }}</p>
              <div class="flex justify-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-indigo-500/40 animate-bounce [animation-delay:-0.3s]"></span>
                <span class="w-1.5 h-1.5 rounded-full bg-indigo-500/60 animate-bounce [animation-delay:-0.15s]"></span>
                <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce"></span>
              </div>
              <p class="text-[10px] text-slate-500 italic mt-2">
                @if (selectedMode() === 'pro') {
                  Modo Pro: Utilizando pensamento profundo para maior precisão...
                } @else {
                  Modo Flash: Priorizando velocidade de processamento...
                }
              </p>
            </div>
          </div>
        } @else if (result()) {
          @let data = result()!;
          <div class="space-y-4 animate-in fade-in duration-500">
            <div class="bg-indigo-600/10 border border-indigo-500/20 p-5 rounded-2xl relative overflow-hidden">
              <div class="absolute top-0 right-0 p-2">
                 <span class="text-[9px] px-2 py-0.5 rounded-bl-lg bg-indigo-500/20 text-indigo-300 font-bold uppercase tracking-tighter">
                   {{ selectedMode() === 'pro' ? 'Análise Pro' : 'Análise Flash' }}
                 </span>
              </div>
              <span class="text-[10px] text-indigo-400 font-bold uppercase block mb-1 tracking-wider">Resumo</span>
              <p class="text-lg font-semibold text-indigo-50 leading-tight">{{ data.summary }}</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="bg-white/5 border border-white/10 p-4 rounded-2xl">
                <span class="text-[10px] text-indigo-400 font-bold uppercase block mb-1 tracking-wider">Atmosfera</span>
                <p class="capitalize text-slate-200">{{ data.mood }}</p>
              </div>
              <div class="bg-white/5 border border-white/10 p-4 rounded-2xl">
                <span class="text-[10px] text-indigo-400 font-bold uppercase block mb-2 tracking-wider">Paleta</span>
                <div class="flex flex-wrap gap-2">
                  @for (c of data.colors; track c) {
                    <div class="flex items-center gap-1.5 bg-white/5 pr-2 pl-1 py-1 rounded-lg border border-white/5 shadow-inner">
                      <div class="w-4 h-4 rounded shadow-sm shrink-0 border border-white/10" [style.backgroundColor]="c"></div>
                      <span class="text-[10px] font-mono text-slate-300 uppercase tracking-tighter">{{ c }}</span>
                    </div>
                  }
                </div>
              </div>
            </div>

            <div class="bg-white/5 border border-white/10 p-5 rounded-2xl">
              <span class="text-[10px] text-indigo-400 font-bold uppercase block mb-2 tracking-wider">Detalhes Técnicos</span>
              <p class="text-sm text-slate-400 leading-relaxed">{{ data.details }}</p>
            </div>

            <div class="flex flex-wrap gap-2">
              @for (obj of data.objects; track obj) {
                <span class="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[11px] text-slate-300">
                  <i class="fas fa-tag mr-1 text-indigo-400"></i> {{ obj }}
                </span>
              }
            </div>

            <button (click)="reset()" class="w-full py-2 text-slate-500 text-xs hover:text-slate-300 transition-colors mt-4">
              <i class="fas fa-redo mr-2"></i> Nova Análise
            </button>
          </div>
        } @else {
          <div class="h-full border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-slate-600 p-8 text-center opacity-60">
            <i class="fas fa-brain text-4xl mb-4 text-indigo-500/20"></i>
            <p class="text-sm">Selecione uma modalidade de análise para começar.</p>
          </div>
        }
      </div>
    </div>
  }
</div>
  `
})
export class AnalyzerComponent implements OnDestroy {
  private aiService = inject(AiService);

  imagePreview = signal<string | null>(null);
  isAnalyzing = signal(false);
  selectedMode = signal<'flash' | 'pro'>('flash');
  result = signal<AnalysisResult | null>(null);
  error = signal<string | null>(null);
  hasKey = signal(this.aiService.isConfigured());
  
  currentProgressMessage = signal('Iniciando visão computacional...');
  private progressInterval?: any;
  private readonly progressMessages = [
    'Escaneando padrões visuais...',
    'Identificando objetos e formas...',
    'Detectando paleta de cores...',
    'Extraindo textos e contextos...',
    'Processando atmosfera da imagem...',
    'Quase lá, gerando insights finais...'
  ];

  ngOnDestroy(): void {
    this.stopProgressSimulation();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      
      if (!allowedTypes.includes(file.type)) {
        this.error.set('Formato não suportado. Use JPG, PNG ou WebP.');
        this.imagePreview.set(null);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview.set(e.target?.result as string);
        this.result.set(null);
        this.error.set(null);
      };
      reader.onerror = () => {
        this.error.set('Erro ao ler o arquivo selecionado.');
      };
      reader.readAsDataURL(file);
    }
  }

  private startProgressSimulation(): void {
    let index = 0;
    this.currentProgressMessage.set(this.progressMessages[0]);
    this.progressInterval = setInterval(() => {
      index = (index + 1) % this.progressMessages.length;
      this.currentProgressMessage.set(this.progressMessages[index]);
    }, 2500);
  }

  private stopProgressSimulation(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = undefined;
    }
  }

  async startAnalysis(mode: 'flash' | 'pro'): Promise<void> {
    const preview = this.imagePreview();
    if (!preview) return;

    this.selectedMode.set(mode);
    this.isAnalyzing.set(true);
    this.error.set(null);
    this.startProgressSimulation();

    try {
      const parts = preview.split(',');
      const mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
      const base64Data = parts[1];
      
      const analysis = await this.aiService.analyzeImage(base64Data, mimeType, mode);
      this.result.set(analysis);
    } catch (err: any) {
      console.error("Erro na análise:", err);
      this.error.set(err.message || "Erro inesperado ao analisar a imagem.");
    } finally {
      this.isAnalyzing.set(false);
      this.stopProgressSimulation();
    }
  }

  reset(): void {
    this.imagePreview.set(null);
    this.result.set(null);
    this.error.set(null);
    this.stopProgressSimulation();
  }
}
