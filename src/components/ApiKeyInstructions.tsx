import React, { useState, useRef } from "react";
import { Info, Key, Check, Download, Upload, AlertCircle, Eye, EyeOff, Github, BookOpen } from "lucide-react";

interface ApiKeyInstructionsProps {
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  onClearApiKey: () => void;
  onImportPortfolio: (data: string) => boolean;
  onExportPortfolio: () => void;
}

export default function ApiKeyInstructions({
  apiKey,
  onSaveApiKey,
  onClearApiKey,
  onImportPortfolio,
  onExportPortfolio
}: ApiKeyInstructionsProps) {
  const [keyInput, setKeyInput] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [importText, setImportText] = useState("");
  const [showImporter, setShowImporter] = useState(false);
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveApiKey(keyInput.trim());
  };

  const handleClearKey = () => {
    onClearApiKey();
    setKeyInput("");
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setImportError("");
    setImportSuccess(false);
    
    const success = onImportPortfolio(importText);
    if (success) {
      setImportSuccess(true);
      setImportText("");
      setTimeout(() => {
        setImportSuccess(false);
        setShowImporter(false);
      }, 2000);
    } else {
      setImportError("Formato de JSON inválido o estructura incorrecta.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setImportError("");
      setImportSuccess(false);
      const success = onImportPortfolio(text);
      if (success) {
        setImportSuccess(true);
        setTimeout(() => {
          setImportSuccess(false);
          setShowImporter(false);
        }, 2000);
      } else {
        setImportError("Error al importar el archivo. Verifica el formato.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8" id="api-and-backup-controls">
      {/* Col 1 & 2: API KEY INPUT & GITHUB INFO */}
      <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-2">
            <Key className={`w-4 h-4 ${apiKey ? "text-emerald-500" : "text-amber-500"}`} />
            Configuración de API Key: {apiKey ? "Conectada" : "No Configurada"}
          </h4>
          
          <form onSubmit={handleSaveKey} className="mt-3">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Ingresa tu API Key de Finnhub
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showKey ? "text" : "password"}
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="Pega tu API Key de Finnhub aquí..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-10 py-2 text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-colors shrink-0 cursor-pointer"
              >
                Guardar Key
              </button>
              {apiKey && (
                <button
                  type="button"
                  onClick={handleClearKey}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl text-xs transition-colors shrink-0 cursor-pointer"
                >
                  Limpiar
                </button>
              )}
            </div>
          </form>

          {!apiKey && (
            <div className="mt-3 bg-amber-50/50 border border-amber-100 rounded-xl p-3 text-[11px] text-amber-800 flex gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <div>
                <span className="font-semibold">Modo Offline:</span> Como no has ingresado una API Key, la aplicación está mostrando los precios y ganancias históricas de tu portafolio original (Spreadsheet). Obtén una clave gratuita en <a href="https://finnhub.io" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline">finnhub.io</a> para activar el tiempo real.
              </div>
            </div>
          )}

          {/* GitHub Pages explanation */}
          <div className="mt-4 border-t border-slate-100 pt-4">
            <h5 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
              <Github className="w-3.5 h-3.5 text-slate-800" />
              ¿Cómo subir este portafolio a GitHub Pages?
            </h5>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Este proyecto es ahora <strong>100% del lado del cliente</strong> (Client-Side SPA). Esto significa que puedes compilarlo y hostearlo gratis en GitHub Pages sin necesidad de un backend. 
              Tus claves se guardan en el navegador local de forma segura.
            </p>
            <div className="mt-2 text-[10px] font-mono bg-slate-50 p-2 rounded-lg text-slate-600 border border-slate-100 leading-normal">
              1. Crea un repositorio en GitHub (ej. <code className="bg-slate-200 px-1 rounded">mi-portfolio</code>)<br />
              2. Sube estos archivos a tu repositorio.<br />
              3. En la configuración del repo, activa <strong>GitHub Pages</strong> desde la rama principal o utiliza GitHub Actions con Vite para desplegar de forma automática la carpeta <code className="bg-slate-200 px-1 rounded">dist</code>.
            </div>
          </div>
        </div>
        
        <div className="text-[10px] text-slate-400 font-mono mt-4 flex items-center gap-1.5 border-t border-slate-50 pt-2 shrink-0">
          <Info className="w-3.5 h-3.5" />
          Las llamadas se realizan directo desde tu navegador a la API pública de Finnhub.
        </div>
      </div>

      {/* Col 3: BACKUP & DATA EXPORT */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
            <Download className="w-4 h-4 text-blue-500" />
            Respaldo de Datos (Backup)
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed mb-4">
            Exporta tus posiciones y saldo de efectivo en un archivo JSON o importa un portafolio previamente guardado.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              onClick={onExportPortfolio}
              className="flex-1 py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar JSON
            </button>
            <button
              onClick={() => setShowImporter(!showImporter)}
              className="flex-1 py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              Importar JSON
            </button>
          </div>

          {showImporter && (
            <div className="mt-3 border-t border-slate-100 pt-3">
              <input
                type="file"
                accept=".json"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-1.5 border border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/20 text-slate-500 hover:text-blue-600 rounded-lg text-xs font-medium transition-colors text-center"
                >
                  Subir archivo .json
                </button>
                <form onSubmit={handleImportSubmit} className="flex flex-col gap-1.5">
                  <textarea
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder='Pega tu JSON aquí, ej: {"positions":[],"cash":1000}'
                    className="w-full h-16 bg-slate-50 border border-slate-200 rounded-lg p-2 text-[10px] font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white resize-none"
                  />
                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShowImporter(false)}
                      className="px-2.5 py-1 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-2.5 py-1 bg-blue-600 text-white font-semibold rounded-md text-xs hover:bg-blue-700"
                    >
                      Importar
                    </button>
                  </div>
                </form>
              </div>
              {importSuccess && (
                <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
                  <Check className="w-3 h-3" /> Portafolio importado con éxito!
                </p>
              )}
              {importError && (
                <p className="text-[10px] text-rose-600 font-medium mt-1">
                  {importError}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
