import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Keyboard, AlertTriangle, Search, Loader2, ShieldAlert, Bot } from 'lucide-react';
import api from '../api/client';
import Navbar from '../components/Navbar';
import MediVerdict from '../components/MediVerdict';
import NutritionCard from '../components/NutritionCard';
import MediBot from '../components/MediBot';
import useStore from '../store/useStore';

export default function Scanner() {
  const [mode, setMode] = useState('manual'); // 'camera' | 'manual'
  const [barcode, setBarcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const setCurrentScan = useStore((s) => s.setCurrentScan);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      setCameraError('');
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      setCameraError('Camera access denied. Please use manual entry below.');
      setMode('manual');
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    if (mode === 'camera') startCamera();
    else stopCamera();
    return stopCamera;
  }, [mode]);

  const scan = async (code) => {
    const bc = (code || barcode).trim();
    if (!bc) { setError('Please enter or scan a barcode.'); return; }
    setError(''); setLoading(true); setResult(null);
    try {
      const { data } = await api.post('/api/scan-product', { barcode: bc });
      setResult(data);
      setCurrentScan(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Product not found. Try a different barcode.');
    } finally { setLoading(false); }
  };

  return (
    <div className="page" style={{ background: 'var(--bg)' }}>
      <Navbar />
      <div className="container" style={{ maxWidth: 720, paddingTop: '2rem', paddingBottom: '5rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.8rem' }}>Product Scanner</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '.9rem' }}>Scan or enter a barcode to get your personalized MediVerdict™</p>
        </div>

        {/* Mode tabs */}
        <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1.5rem' }}>
          {[['camera', <><Camera size={16} /> Camera</>], ['manual', <><Keyboard size={16} /> Manual Entry</>]].map(([m, label]) => (
            <button key={m} onClick={() => setMode(m)}
              className={`btn ${mode === m ? 'btn-primary' : 'btn-outline'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Camera view */}
        {mode === 'camera' && (
          <div style={{ marginBottom: '1.5rem' }}>
            {cameraError && <div className="alert-item caution"><span><AlertTriangle size={18} /></span><p>{cameraError}</p></div>}
            <div className="scanner-viewport">
              <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div className="scanner-overlay">
                <div className="scan-frame"><div className="scan-line" /></div>
              </div>
            </div>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '.82rem', marginTop: '.75rem' }}>
              Hold barcode steady inside the frame. Auto-detection requires ZXing integration.
            </p>
          </div>
        )}

        {/* Manual entry */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '.75rem', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label" htmlFor="barcode-input">Barcode Number</label>
              <input id="barcode-input" type="text" className="form-input mono"
                placeholder="e.g. 3017620422003 (Nutella)"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && scan()} />
            </div>
            <button className="btn btn-primary" onClick={() => scan()} disabled={loading} style={{ whiteSpace: 'nowrap' }}>
              {loading ? <><Loader2 className="spin" size={16} /> Analyzing...</> : <><Search size={16} /> Scan</>}
            </button>
          </div>
          {error && <div className="alert-item danger" style={{ marginTop: '.75rem' }}><span><ShieldAlert size={18} /></span><p style={{ fontSize: '.88rem' }}>{error}</p></div>}
        </div>

        {/* Results */}
        {result && (
          <div className="fade-in">
            <MediVerdict verdict={result.verdict} flags={result.flags} />
            <NutritionCard product={result.product} flags={result.flags} />

            {result.alert_summaries?.length > 0 && (
              <div className="card" style={{ marginTop: '1rem' }}>
                <h3 style={{ marginBottom: '.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Bell size={18} /> Alert Details</h3>
                {result.alert_summaries.map((a, i) => (
                  <div key={i} className={`alert-item ${result.verdict === 'DANGER' ? 'danger' : 'caution'}`}>
                    <span>{result.verdict === 'DANGER' ? <ShieldAlert size={18} /> : <AlertTriangle size={18} />}</span>
                    <p style={{ fontSize: '.85rem' }}>{a}</p>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--teal-bg)', borderRadius: 10, border: '1px solid rgba(17,24,39,.1)' }}>
              <p style={{ fontSize: '.85rem', color: 'var(--text)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bot size={18} /> Have questions about this product? Ask MediBot in the bottom-right corner!
              </p>
            </div>
          </div>
        )}
      </div>
      <MediBot />
    </div>
  );
}
