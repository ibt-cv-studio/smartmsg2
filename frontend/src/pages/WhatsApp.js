import React, { useEffect, useState } from 'react';
import axios from 'axios';

const api = axios.create({ baseURL: process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api` : '/api' });
api.interceptors.request.use(c => { const t = localStorage.getItem('token'); if (t) c.headers.Authorization = `Bearer ${t}`; return c; });

export default function WhatsApp() {
  const [status, setStatus] = useState({ isReady: false, isInitializing: false, hasQR: false });
  const [qr, setQR]         = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  async function checkStatus() {
    try {
      const { data } = await api.get('/whatsapp/status');
      setStatus(data);
      if (data.hasQR) {
        const qrRes = await api.get('/whatsapp/qr');
        setQR(qrRes.data.qr);
      } else {
        setQR(null);
      }
    } catch (err) { console.error(err); }
  }

  async function handleInitialize() {
    setLoading(true);
    try {
      await api.post('/whatsapp/initialize');
      setTimeout(checkStatus, 3000);
    } finally { setLoading(false); }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>WhatsApp Connection</h2>
          <p>Connect your WhatsApp to send messages automatically</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 500 }}>

        {/* Status indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, padding: 16, background: status.isReady ? '#e6fffa' : '#fff5f5', borderRadius: 10 }}>
          <div style={{ width: 14, height: 14, borderRadius: '50%', background: status.isReady ? '#38a169' : '#e53e3e', flexShrink: 0 }} />
          <div>
            <p style={{ fontWeight: 600, fontSize: 15, color: status.isReady ? '#276749' : '#c53030' }}>
              {status.isReady ? '✅ WhatsApp Connected!' : '❌ WhatsApp Not Connected'}
            </p>
            <p style={{ fontSize: 13, color: '#666', marginTop: 2 }}>
              {status.isReady
                ? 'Your WhatsApp is connected. Messages will be sent automatically.'
                : status.isInitializing
                  ? 'Initializing... please wait for QR code.'
                  : 'Click the button below to connect your WhatsApp.'}
            </p>
          </div>
        </div>

        {/* QR Code */}
        {qr && (
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#1a1a2e' }}>
              📱 Scan this QR code with your WhatsApp
            </p>
            <img src={qr} alt="WhatsApp QR Code" style={{ width: 260, height: 260, border: '4px solid #4f8ef7', borderRadius: 12 }} />
            <p style={{ fontSize: 12, color: '#888', marginTop: 12 }}>
              Open WhatsApp → tap Menu (⋮) → Linked Devices → Link a Device → Scan this code
            </p>
          </div>
        )}

        {/* Connect button */}
        {!status.isReady && (
          <button
            className="btn btn-primary btn-full"
            onClick={handleInitialize}
            disabled={loading || status.isInitializing}
          >
            {loading || status.isInitializing ? '⏳ Initializing WhatsApp...' : '📱 Connect WhatsApp'}
          </button>
        )}

        {/* Instructions */}
        <div style={{ marginTop: 20, padding: 16, background: '#f7f9fc', borderRadius: 10 }}>
          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>How to connect:</p>
          <p style={{ fontSize: 13, color: '#555', marginBottom: 4 }}>1. Click "Connect WhatsApp" button</p>
          <p style={{ fontSize: 13, color: '#555', marginBottom: 4 }}>2. Wait for QR code to appear</p>
          <p style={{ fontSize: 13, color: '#555', marginBottom: 4 }}>3. Open WhatsApp on your phone</p>
          <p style={{ fontSize: 13, color: '#555', marginBottom: 4 }}>4. Tap Menu (⋮) → Linked Devices → Link a Device</p>
          <p style={{ fontSize: 13, color: '#555' }}>5. Scan the QR code — done! ✅</p>
        </div>
      </div>
    </div>
  );
}
