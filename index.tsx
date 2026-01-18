
import 'tslib';
import '@angular/compiler';
import * as core from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './src/app.component.ts';

/**
 * Em algumas versões/CDNs, a função pode estar com o prefixo 'Experimental'
 * ou o ESM loader pode falhar em resolver a exportação nomeada.
 * Usamos uma abordagem dinâmica para garantir o bootstrap.
 */
const provideZoneless = (core as any).provideZonelessChangeDetection || (core as any).provideExperimentalZonelessChangeDetection;

async function startApp() {
  try {
    if (!provideZoneless) {
      throw new Error("A função provideZonelessChangeDetection não foi encontrada no pacote @angular/core.");
    }

    await bootstrapApplication(AppComponent, {
      providers: [
        provideZoneless()
      ]
    });
  } catch (err: any) {
    console.error("Erro durante o bootstrap:", err);
    const container = document.querySelector('app-root');
    if (container) {
      container.innerHTML = `
        <div style="padding: 40px; color: #f87171; font-family: sans-serif; text-align: center; max-width: 500px; margin: 100px auto; background: #111; border: 1px solid #333; border-radius: 20px;">
          <i class="fas fa-exclamation-triangle" style="font-size: 40px; margin-bottom: 20px;"></i>
          <h1 style="font-size: 20px; color: white;">Falha na Inicialização</h1>
          <p style="color: #94a3b8; margin-top: 12px; font-size: 14px; line-height: 1.6;">${err.message || 'Erro de conexão com os módulos Angular.'}</p>
          <button onclick="window.location.reload()" style="margin-top: 24px; padding: 12px 24px; background: #4f46e5; color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: 600;">
            Recarregar Aplicação
          </button>
        </div>
      `;
    }
  }
}

startApp();

// AI Studio always uses an `index.tsx` file for all project types.
