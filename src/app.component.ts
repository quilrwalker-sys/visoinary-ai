
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AnalyzerComponent } from './components/analyzer/analyzer.component.ts';

@Component({
  selector: 'app-root',
  imports: [AnalyzerComponent],
  template: `
    <main class="min-h-screen flex flex-col items-center p-4 md:p-8">
      <header class="w-full max-w-5xl mb-12 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="bg-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <i class="fas fa-eye text-white text-xl"></i>
          </div>
          <h1 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Visionary AI
          </h1>
        </div>
        <div class="hidden md:flex gap-6 text-sm font-medium text-slate-400">
          <a href="#" class="hover:text-indigo-400 transition-colors">Como Funciona</a>
          <a href="#" class="hover:text-indigo-400 transition-colors">Segurança</a>
          <a href="#" class="hover:text-indigo-400 transition-colors">Sobre</a>
        </div>
      </header>

      <app-analyzer class="w-full max-w-5xl" />

      <footer class="mt-20 py-8 border-t border-white/5 w-full text-center text-slate-500 text-sm">
        <p>&copy; 2025 Visionary AI - Analisador de Imagens Inteligente. Powered by Gemini 2.5 Flash.</p>
      </footer>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {}
