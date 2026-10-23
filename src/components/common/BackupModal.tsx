import React, { useRef, useState } from 'react';
import { useCuervosStore } from '../../store/useCuervosStore';
import { Download, Upload, RotateCcw, X, Database, CheckCircle, AlertTriangle } from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({ isOpen, onClose }) => {
  const { exportDatabaseJson, importDatabaseJson, resetToSeedData } = useCuervosStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    const jsonStr = exportDatabaseJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cuervos-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setStatusMessage({ text: 'Copia de respaldo .json descargada con éxito.', type: 'success' });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const ok = importDatabaseJson(content);
      if (ok) {
        setStatusMessage({ text: 'Base de datos restaurada correctamente.', type: 'success' });
      } else {
        setStatusMessage({ text: 'Error: El archivo no tiene un formato válido de CuervosApp.', type: 'error' });
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (window.confirm('¿Deseas restaurar todos los datos originales semilla de Cuervos?')) {
      resetToSeedData();
      setStatusMessage({ text: 'Datos semilla restaurados con éxito.', type: 'success' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-cuervos-dark border border-cuervos-border rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cuervos-border pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-cuervos-cyan" />
            <h3 className="font-bold text-white text-base">Persistencia & Copias de Respaldo</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-cuervos-elevated"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          CuervosApp es <strong>100% Local-First</strong>. Tus tácticas, plantilla y partidos quedan guardados en este dispositivo sin depender de internet. Puedes exportar o importar un archivo <code>.json</code> para sincronizar con tu tablet u otro teléfono.
        </p>

        {statusMessage && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-red-950/60 border-red-500/40 text-red-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          {/* Export */}
          <button
            onClick={handleExport}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-cuervos-elevated hover:bg-cuervos-border border border-cuervos-border/70 text-xs font-bold text-white transition-all shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <Download className="w-4 h-4 text-cuervos-cyan" />
              <div className="text-left">
                <span className="block">Exportar Respaldo (.json)</span>
                <span className="text-[10px] text-slate-400 font-normal">Descargar copia completa de jugadores y pizarras</span>
              </div>
            </div>
            <span className="text-[10px] text-cuervos-cyan">Descargar</span>
          </button>

          {/* Import */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-cuervos-elevated hover:bg-cuervos-border border border-cuervos-border/70 text-xs font-bold text-white transition-all shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <Upload className="w-4 h-4 text-amber-400" />
              <div className="text-left">
                <span className="block">Importar Respaldo (.json)</span>
                <span className="text-[10px] text-slate-400 font-normal">Cargar archivo de respaldo previo</span>
              </div>
            </div>
            <span className="text-[10px] text-amber-400">Subir</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Reset */}
          <button
            onClick={handleReset}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-red-950/20 hover:bg-red-950/40 border border-red-500/30 text-xs font-bold text-red-300 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <RotateCcw className="w-4 h-4 text-red-400" />
              <div className="text-left">
                <span className="block">Restaurar Datos Semilla</span>
                <span className="text-[10px] text-slate-400 font-normal">Restablecer plantilla inicial y formaciones oficiales</span>
              </div>
            </div>
            <span className="text-[10px] text-red-400">Reset</span>
          </button>
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-cuervos-elevated text-xs font-bold text-slate-300 hover:text-white"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
