'use client';

import React, { useState, useEffect } from 'react';
import { getImagesToOptimize, optimizeSingleImage, getImageSize, dryRunOptimize } from '@/app/actions/optimize';

type ImageItem = {
  id: string;
  url: string;
  color: string;
  is_main: boolean;
  products?: { name: string } | null;
  status: 'idle' | 'analyzing' | 'processing' | 'success' | 'error';
  sizeKb?: number;
  newSizeKb?: number;
  savedText?: string;
  error?: string;
};

export default function OptimizeImagesPage() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [latestLog, setLatestLog] = useState('');
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [isAnalyzingAll, setIsAnalyzingAll] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      try {
        const data = await getImagesToOptimize();
        setImages(data.map((item: any) => ({ ...item, status: 'idle' as const })));
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  // ── Selection helpers ──────────────────────────────────
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === images.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(images.map(img => img.id)));
    }
  };

  const isAllSelected = images.length > 0 && selectedIds.size === images.length;
  const hasSelection = selectedIds.size > 0;

  // ── Analyze (check file size) ──────────────────────────
  async function handleAnalyze(index: number) {
    const item = images[index];
    if (!item) return;

    setImages(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], status: 'analyzing' };
      return copy;
    });

    try {
      const sizeBytes = await getImageSize(item.url);
      const sizeKb = Math.round(sizeBytes / 1024);
      setImages(prev => {
        const copy = [...prev];
        copy[index] = { ...copy[index], status: 'idle', sizeKb };
        return copy;
      });
    } catch {
      setImages(prev => {
        const copy = [...prev];
        copy[index] = { ...copy[index], status: 'idle', sizeKb: 0 };
        return copy;
      });
    }
  }

  async function handleAnalyzeAll() {
    setIsAnalyzingAll(true);
    setLatestLog('Analyse des tailles en cours...');
    for (let i = 0; i < images.length; i++) {
      await handleAnalyze(i);
    }
    setLatestLog(`Analyse terminée ! ${images.length} images analysées.`);
    setIsAnalyzingAll(false);
  }

  async function handleAnalyzeSelected() {
    if (!hasSelection) return;
    setIsAnalyzingAll(true);
    setLatestLog(`Analyse de ${selectedIds.size} image(s) sélectionnée(s)...`);
    let count = 0;
    for (let i = 0; i < images.length; i++) {
      if (selectedIds.has(images[i].id)) {
        await handleAnalyze(i);
        count++;
      }
    }
    setLatestLog(`Analyse terminée ! ${count} image(s) analysée(s).`);
    setIsAnalyzingAll(false);
  }

  // ── Optimize (compress + re-upload) ────────────────────
  async function handleOptimize(index: number) {
    const item = images[index];
    if (!item || item.status === 'processing' || item.status === 'success') return;

    setImages(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], status: 'processing', error: undefined };
      return copy;
    });
    setLatestLog(`Optimisation de "${item.products?.name || 'Image'}" (${item.color || ''})... Traitement serveur avec sharp.`);

    try {
      const result = await optimizeSingleImage(item.id, item.url);

      if (result.success) {
        setImages(prev => {
          const copy = [...prev];
          copy[index] = {
            ...copy[index],
            status: 'success',
            url: result.newUrl!,
            sizeKb: result.originalSizeKb,
            newSizeKb: result.newSizeKb,
            savedText: result.savedText,
          };
          return copy;
        });
        setLatestLog(`Succès ! "${item.products?.name || 'Image'}" : ${result.savedText}\nURL sauvegardée: ${result.newUrl}`);
      } else {
        setImages(prev => {
          const copy = [...prev];
          copy[index] = { ...copy[index], status: 'error', error: result.error };
          return copy;
        });
        setLatestLog(`Échec "${item.products?.name || 'Image'}" : ${result.error}`);
      }
    } catch (err: any) {
      setImages(prev => {
        const copy = [...prev];
        copy[index] = { ...copy[index], status: 'error', error: err.message || 'Erreur réseau' };
        return copy;
      });
      setLatestLog(`Échec "${item.products?.name || 'Image'}" : ${err.message || 'Erreur réseau'}`);
    }
  }

  async function handleOptimizeAll() {
    setIsProcessingAll(true);
    for (let i = 0; i < images.length; i++) {
      if (images[i].status === 'success') continue;
      setLatestLog(`Optimisation ${i + 1} / ${images.length}...`);
      await handleOptimize(i);
    }
    setLatestLog(`Terminé ! ${images.filter(i => i.status === 'success').length} images optimisées.`);
    setIsProcessingAll(false);
  }

  async function handleOptimizeSelected() {
    if (!hasSelection) return;
    setIsProcessingAll(true);
    const selectedIndices = images
      .map((img, i) => ({ img, i }))
      .filter(({ img }) => selectedIds.has(img.id) && img.status !== 'success');
    let done = 0;
    for (const { i } of selectedIndices) {
      done++;
      setLatestLog(`Optimisation ${done} / ${selectedIndices.length} (sélection)...`);
      await handleOptimize(i);
    }
    setLatestLog(`Terminé ! ${done} image(s) sélectionnée(s) optimisée(s).`);
    setIsProcessingAll(false);
  }

  // ── Dry run test ───────────────────────────────────────
  async function handleDryRun(index: number) {
    const item = images[index];
    if (!item) return;
    setLatestLog(`Test en cours pour "${item.products?.name || 'Image'}"...`);
    try {
      const result = await dryRunOptimize(item.url);
      if (result.success) {
        setLatestLog(`TEST OK:\n${result.debug}`);
      } else {
        setLatestLog(`TEST ÉCHOUÉ: ${result.error}\n${result.debug || ''}`);
      }
    } catch (err: any) {
      setLatestLog(`TEST CRASH: ${err.message}`);
    }
  }

  // ── Render ─────────────────────────────────────────────
  if (isLoading) {
    return <div style={{ padding: '24px', fontWeight: 'bold' }}>Chargement...</div>;
  }

  const successCount = images.filter(i => i.status === 'success').length;
  const isBusy = isProcessingAll || isAnalyzingAll;

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '1.6rem', marginBottom: '8px', color: '#111827', fontWeight: 800 }}>
        Optimisation des images
      </h1>
      <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '20px' }}>
        Compression automatique en WebP via <strong>sharp</strong> sur le serveur et transfert HTTPS sécurisé.
      </p>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'center' }}>
        {hasSelection && (
          <>
            <button
              onClick={handleAnalyzeSelected}
              disabled={isBusy}
              style={{
                padding: '10px 18px', backgroundColor: '#7c3aed', color: '#fff',
                border: 'none', borderRadius: '6px', fontWeight: 'bold',
                cursor: isBusy ? 'wait' : 'pointer', fontSize: '0.85rem'
              }}
            >
              {isAnalyzingAll ? 'Analyse...' : `Analyser la sélection (${selectedIds.size})`}
            </button>
            <button
              onClick={handleOptimizeSelected}
              disabled={isBusy}
              style={{
                padding: '10px 18px', backgroundColor: '#059669', color: '#fff',
                border: 'none', borderRadius: '6px', fontWeight: 'bold',
                cursor: isBusy ? 'wait' : 'pointer', fontSize: '0.85rem'
              }}
            >
              {isProcessingAll ? 'En cours...' : `Optimiser la sélection (${selectedIds.size})`}
            </button>
            <div style={{ width: '1px', height: '28px', backgroundColor: '#d1d5db', margin: '0 4px' }} />
          </>
        )}
        <button
          onClick={handleAnalyzeAll}
          disabled={isBusy}
          style={{
            padding: '10px 18px', backgroundColor: '#4f46e5', color: '#fff',
            border: 'none', borderRadius: '6px', fontWeight: 'bold',
            cursor: isBusy ? 'wait' : 'pointer', fontSize: '0.85rem'
          }}
        >
          {isAnalyzingAll ? 'Analyse...' : 'Analyser tout'}
        </button>
        <button
          onClick={handleOptimizeAll}
          disabled={isBusy}
          style={{
            padding: '10px 18px', backgroundColor: '#10b981', color: '#fff',
            border: 'none', borderRadius: '6px', fontWeight: 'bold',
            cursor: isBusy ? 'wait' : 'pointer', fontSize: '0.85rem'
          }}
        >
          {isProcessingAll ? 'En cours...' : 'Tout optimiser'}
        </button>
        <span style={{ alignSelf: 'center', fontSize: '0.85rem', color: '#374151', fontWeight: 600 }}>
          {images.length} images | {successCount} optimisées
          {hasSelection && <span style={{ color: '#7c3aed' }}> | {selectedIds.size} sélectionnée(s)</span>}
        </span>
      </div>

      {/* Log Banner */}
      {latestLog && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: latestLog.startsWith('Échec') || latestLog.startsWith('TEST ÉCHOUÉ') ? '#fef2f2' : '#eff6ff',
          color: latestLog.startsWith('Échec') || latestLog.startsWith('TEST ÉCHOUÉ') ? '#b91c1c' : '#1e40af',
          border: `1px solid ${latestLog.startsWith('Échec') || latestLog.startsWith('TEST ÉCHOUÉ') ? '#fca5a5' : '#bfdbfe'}`,
          borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem', fontWeight: 600,
          wordBreak: 'break-all',
          whiteSpace: 'pre-wrap'
        }}>
          {latestLog}
        </div>
      )}

      {/* Image Table */}
      <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', color: '#374151', fontWeight: 600 }}>
              <th style={{ padding: '8px 10px', width: '40px' }}>
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={toggleSelectAll}
                  title="Tout sélectionner / désélectionner"
                  style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#7c3aed' }}
                />
              </th>
              <th style={{ padding: '8px 10px' }}>Produit</th>
              <th style={{ padding: '8px 10px', width: '50px' }}>Photo</th>
              <th style={{ padding: '8px 10px' }}>Couleur</th>
              <th style={{ padding: '8px 10px' }}>Taille</th>
              <th style={{ padding: '8px 10px' }}>Statut</th>
              <th style={{ padding: '8px 10px', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {images.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                  Aucune image trouvée dans la base de données.
                </td>
              </tr>
            ) : (
              images.map((img, index) => {
                const isSelected = selectedIds.has(img.id);
                return (
                  <tr
                    key={img.id}
                    style={{
                      borderBottom: '1px solid #f3f4f6',
                      backgroundColor: isSelected ? '#f5f3ff' : 'transparent',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    <td style={{ padding: '8px 10px' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(img.id)}
                        style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#7c3aed' }}
                      />
                    </td>
                    <td style={{ padding: '8px 10px', fontWeight: 500, maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {img.products?.name || '?'}
                    </td>
                    <td style={{ padding: '8px 10px' }}>
                      <img src={img.url} alt="" style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e5e7eb' }} />
                    </td>
                    <td style={{ padding: '8px 10px', textTransform: 'capitalize' }}>
                      {img.color || '-'}
                    </td>
                    <td style={{ padding: '8px 10px', fontWeight: 600 }}>
                      {img.status === 'success' && img.newSizeKb !== undefined ? (
                        <span style={{ color: '#10b981' }}>{img.sizeKb} → {img.newSizeKb} Ko</span>
                      ) : img.sizeKb !== undefined && img.sizeKb > 0 ? (
                        <span style={{ color: img.sizeKb > 200 ? '#ef4444' : '#10b981' }}>
                          {img.sizeKb} Ko
                        </span>
                      ) : img.status === 'analyzing' ? (
                        <span style={{ color: '#f59e0b' }}>...</span>
                      ) : (
                        <span style={{ color: '#d1d5db' }}>-</span>
                      )}
                    </td>
                    <td style={{ padding: '8px 10px' }}>
                      {img.status === 'idle' && <span style={{ color: '#9ca3af' }}>-</span>}
                      {img.status === 'analyzing' && <span style={{ color: '#f59e0b' }}>Analyse...</span>}
                      {img.status === 'processing' && <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>Optimisation...</span>}
                      {img.status === 'success' && <span style={{ color: '#10b981', fontWeight: 'bold' }}>{img.savedText}</span>}
                      {img.status === 'error' && <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '0.75rem' }}>{img.error}</span>}
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', display: 'flex', gap: '4px', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleDryRun(index)}
                        disabled={isBusy}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#f59e0b',
                          color: '#fff',
                          border: 'none', borderRadius: '4px', fontWeight: 'bold',
                          cursor: isBusy ? 'default' : 'pointer', fontSize: '0.7rem'
                        }}
                      >
                        Test
                      </button>
                      <button
                        onClick={() => handleOptimize(index)}
                        disabled={img.status === 'processing' || img.status === 'success' || isBusy}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: img.status === 'success' ? '#d1fae5' : '#111827',
                          color: img.status === 'success' ? '#065f46' : '#fff',
                          border: 'none', borderRadius: '4px', fontWeight: 'bold',
                          cursor: (img.status === 'success' || isBusy) ? 'default' : 'pointer', fontSize: '0.7rem'
                        }}
                      >
                        {img.status === 'processing' ? '...' : img.status === 'success' ? 'OK' : 'Go'}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
