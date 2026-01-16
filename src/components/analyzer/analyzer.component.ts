
import { Component, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { AiService, AnalysisResult } from '../../services/ai.service';

@Component({
  selector: 'app-analyzer',
  templateUrl: './analyzer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalyzerComponent {
  private aiService = inject(AiService);

  imagePreview = signal<string | null>(null);
  selectedFile = signal<File | null>(null);
  isAnalyzing = signal(false);
  result = signal<AnalysisResult | null>(null);
  error = signal<string | null>(null);

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.handleFile(file);
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) {
      this.handleFile(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  private handleFile(file: File): void {
    if (!file.type.startsWith('image/')) {
      this.error.set("Por favor, selecione apenas arquivos de imagem.");
      return;
    }

    this.error.set(null);
    this.selectedFile.set(file);
    this.result.set(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagePreview.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  async startAnalysis(): Promise<void> {
    const file = this.selectedFile();
    const preview = this.imagePreview();

    if (!file || !preview) return;

    this.isAnalyzing.set(true);
    this.error.set(null);

    try {
      const base64Data = preview.split(',')[1];
      const analysis = await this.aiService.analyzeImage(base64Data, file.type);
      this.result.set(analysis);
    } catch (err) {
      this.error.set("Ocorreu um erro ao analisar a imagem. Tente novamente.");
    } finally {
      this.isAnalyzing.set(false);
    }
  }

  reset(): void {
    this.imagePreview.set(null);
    this.selectedFile.set(null);
    this.result.set(null);
    this.error.set(null);
  }
}
