import { useState, useEffect } from 'react';

interface FIASContext {
  clientName: string;
  facilityType: string;
  overallScore?: number;
  ctsLevel?: number;
  topGaps: string[];
  criticalFlags: string[];
  returnUrl?: string;
}

const CTS_COLORS: Record<number, string> = {
  1: '#ef4444', 2: '#fb923c', 3: '#facc15', 4: '#60a5fa', 5: '#4ade80',
};

export function FIASContextBanner() {
  const [context, setContext] = useState<FIASContext | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const clientName = params.get('clientName');
    if (!clientName) return;
    setContext({
      clientName,
      facilityType:  params.get('facilityType') || '',
      overallScore:  params.get('overallScore') ? Number(params.get('overallScore')) : undefined,
      ctsLevel:      params.get('ctsLevel')     ? Number(params.get('ctsLevel'))     : undefined,
      topGaps:       params.get('gaps')  ? params.get('gaps')!.split('|')  : [],
      criticalFlags: params.get('flags') ? params.get('flags')!.split('|') : [],
      returnUrl:     params.get('returnUrl') || undefined,
    });
  }, []);

  if (!context || dismissed) return null;
  const ctsColor = context.ctsLevel ? CTS_COLORS[context.ctsLevel] : '#94a3b8';

  return (
    <div style={{ background: 'rgba(0,255,180,0.08)', borderBottom: '1px solid rgba(0,255,180,0.2)', padding: '10px 16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', fontSize: '13px', position: 'relative', zIndex: 50 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1, minWidth: 0 }}>
        {context.returnUrl && (
          <button onClick={() => window.location.href = context.returnUrl!}
            style={{ color: '#00ffe1', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', whiteSpace: 'nowrap', padding: '2px 6px', borderRadius: '4px' }}>
            ← Back to FIAS
          </button>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ color: '#00ffe1', fontWeight: 600 }}>FIAS: {context.clientName}</span>
            <span style={{ background: 'rgba(0,255,180,0.1)', border: '1px solid rgba(0,255,180,0.3)', borderRadius: '999px', padding: '1px 8px', fontSize: '11px', color: '#00ffe1' }}>{context.facilityType}</span>
            {context.overallScore !== undefined && (
              <span style={{ border: `1px solid ${ctsColor}40`, borderRadius: '999px', padding: '1px 8px', fontSize: '11px', color: ctsColor }}>
                Score: {context.overallScore}/100 · CTS-{context.ctsLevel}
              </span>
            )}
          </div>
          {context.topGaps.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ color: '#94a3b8', fontSize: '11px' }}>Advisory focus:</span>
              {context.topGaps.map((g, i) => (
                <span key={i} style={{ background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.3)', borderRadius: '999px', padding: '1px 8px', fontSize: '11px', color: '#facc15' }}>{g}</span>
              ))}
            </div>
          )}
        </div>
      </div>
      <button onClick={() => setDismissed(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '16px', lineHeight: 1, padding: '2px' }}>×</button>
    </div>
  );
}
