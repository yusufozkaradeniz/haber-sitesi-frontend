import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import translate from "translate"; 
import { tercumeler } from './Dil';

translate.engine = "google"; 

const HaberListesi = ({ dil, tetikleyici }) => {
    const [haberler, setHaberler] = useState([]);
    const [yorumIcerik, setYorumIcerik] = useState({}); 
    const [yorumlar, setYorumlar] = useState({});
    const [yukleniyor, setYukleniyor] = useState(false);
    const [kaydedilenHaberler, setKaydedilenHaberler] = useState([]);
    const [okumaGecmisi, setOkumaGecmisi] = useState([]);

    const t = tercumeler[dil];

    // --- 🕒 OKUMA GEÇMİŞİ ÇEVİRİ VE YÜKLEME ---
    const gecmisiCevirveYukle = useCallback(async () => {
        const kayitliGecmis = localStorage.getItem('okumaGecmisi');
        if (kayitliGecmis) {
            const hamGecmis = JSON.parse(kayitliGecmis);
            if (dil === 'tr') {
                setOkumaGecmisi(hamGecmis);
            } else {
                const cevrilmisGecmis = await Promise.all(
                    hamGecmis.map(async (g) => ({
                        ...g,
                        baslik: await translate(g.baslik, { from: "tr", to: dil })
                    }))
                );
                setOkumaGecmisi(cevrilmisGecmis);
            }
        }
    }, [dil]);

    useEffect(() => {
        gecmisiCevirveYukle();
    }, [gecmisiCevirveYukle]);

    const gecmiseEkle = (haber) => {
        const kayitliGecmis = JSON.parse(localStorage.getItem('okumaGecmisi') || '[]');
        const varMi = kayitliGecmis.find(h => h.id === haber.id);
        
        if (!varMi) {
            const yeniGecmis = [haber, ...kayitliGecmis].slice(0, 5);
            localStorage.setItem('okumaGecmisi', JSON.stringify(yeniGecmis));
            gecmisiCevirveYukle(); 
        }
    };

    // --- 📌 KAYDEDİLENLER ÇEVİRİ VE YÜKLEME ---
    const kaydedilenleriGetir = useCallback(async () => {
        try {
            const kullaniciRes = await axios.get('https://habersitesi-backend.onrender.com/api/kullanici');
            if (kullaniciRes.data.length > 0) {
                const aktifId = kullaniciRes.data[0].id;
                const res = await axios.get(`https://habersitesi-backend.onrender.com/api/kullanici/${aktifId}/kaydedilenler`);
                const hamKaydedilenler = res.data;

                if (dil === 'tr') {
                    setKaydedilenHaberler(hamKaydedilenler);
                } else {
                    // 🔥 GÜNCELLEME: Kaydedilenlerin başlıklarını da çeviriye sokuyoruz
                    const cevrilmisKaydedilenler = await Promise.all(
                        hamKaydedilenler.map(async (kh) => ({
                            ...kh,
                            baslik: await translate(kh.baslik, { from: "tr", to: dil })
                        }))
                    );
                    setKaydedilenHaberler(cevrilmisKaydedilenler);
                }
            }
        } catch (err) {
            console.log("Kaydedilenler listelenemedi:", err);
        }
    }, [dil]); // Dil değişince bu fonksiyon tetiklenecek

    const verileriGetirveCevir = useCallback(async () => {
        setYukleniyor(true);
        try {
            const res = await axios.get('https://habersitesi-backend.onrender.com/api/haberler');
            const hamHaberler = res.data.sort((a, b) => a.id - b.id);

            if (dil === 'tr') {
                setHaberler(hamHaberler);
            } else {
                const cevrilmisHaberler = await Promise.all(
                    hamHaberler.map(async (h) => ({
                        ...h,
                        baslik: await translate(h.baslik, { from: "tr", to: dil }),
                        icerik: await translate(h.icerik, { from: "tr", to: dil })
                    }))
                );
                setHaberler(cevrilmisHaberler);
            }

            hamHaberler.forEach(async (h) => {
                const yRes = await axios.get(`https://habersitesi-backend.onrender.com/api/yorumlar/haber/${h.id}`);
                let yorumVerisi = yRes.data;

                if (dil !== 'tr') {
                    yorumVerisi = await Promise.all(
                        yorumVerisi.map(async (y) => ({
                            ...y,
                            icerik: await translate(y.icerik, { from: "tr", to: dil })
                        }))
                    );
                }
                setYorumlar(prev => ({ ...prev, [h.id]: yorumVerisi }));
            });

        } catch (err) {
            console.error("Veri veya Çeviri Hatası:", err);
        } finally {
            setYukleniyor(false);
        }
    }, [dil]);

    useEffect(() => {
        verileriGetirveCevir();
        kaydedilenleriGetir(); 
    }, [verileriGetirveCevir, kaydedilenleriGetir, tetikleyici]);

    const haberSil = (id) => {
        if (window.confirm(dil === 'tr' ? "Haberi silmek istediğine emin misin?" : "Are you sure?")) {
            axios.delete(`https://habersitesi-backend.onrender.com/api/haberler/${id}`)
                .then(() => {
                    setHaberler(prev => prev.filter(h => h.id !== id));
                    setOkumaGecmisi(prev => prev.filter(h => h.id !== id));
                })
                .catch(err => console.log("Silme hatası:", err));
        }
    };

    const yorumSil = (yorumId, haberId) => {
        if (window.confirm(dil === 'tr' ? "Bu yorumu silmek istediğine emin misin?" : "Delete this comment?")) {
            axios.delete(`https://habersitesi-backend.onrender.com/api/yorumlar/${yorumId}`)
                .then(() => {
                    axios.get(`https://habersitesi-backend.onrender.com/api/yorumlar/haber/${haberId}`)
                        .then(res => setYorumlar(prev => ({ ...prev, [haberId]: res.data })));
                })
                .catch(err => console.log("Yorum silme hatası:", err));
        }
    };

    const begen = (id) => {
        axios.post(`https://habersitesi-backend.onrender.com/api/haberler/${id}/begen`)
            .then(() => {
                verileriGetirveCevir();
                alert(dil === 'tr' ? "Beğenildi!" : "Liked!");
            })
            .catch(err => console.log("Beğeni hatası:", err));
    };

    const haberKaydet = async (haberId) => {
        try {
            const kullaniciRes = await axios.get('https://habersitesi-backend.onrender.com/api/kullanici');
            if (kullaniciRes.data.length > 0) {
                const aktifId = kullaniciRes.data[0].id;
                await axios.post(`https://habersitesi-backend.onrender.com/api/kullanici/${aktifId}/kaydet/${haberId}`);
                alert(dil === 'tr' ? "Haber kaydedildi! ✅" : "News saved! ✅");
                kaydedilenleriGetir(); 
            }
        } catch (err) {
            console.error("Kaydetme hatası:", err);
        }
    };

    const kaydedilenSil = async (haberId) => {
        try {
            const kullaniciRes = await axios.get('https://habersitesi-backend.onrender.com/api/kullanici');
            if (kullaniciRes.data.length > 0) {
                const aktifId = kullaniciRes.data[0].id;
                await axios.delete(`https://habersitesi-backend.onrender.com/api/kullanici/${aktifId}/kaydedilenler/${haberId}`);
                kaydedilenleriGetir(); 
            }
        } catch (err) {
            console.error("Kaldırma hatası:", err);
        }
    };

    const yorumYap = (haberId) => {
        if (!yorumIcerik[haberId]) return;
        axios.post(`https://habersitesi-backend.onrender.com/api/yorumlar`, {
            kullaniciAdi: "Yusuf",
            icerik: yorumIcerik[haberId],
            haberId: haberId
        })
        .then(() => {
            setYorumIcerik(prev => ({ ...prev, [haberId]: "" }));
            axios.get(`https://habersitesi-backend.onrender.com/api/yorumlar/haber/${haberId}`)
                .then(res => setYorumlar(prev => ({ ...prev, [haberId]: res.data })));
        })
        .catch(err => console.log("Hata:", err));
    };

    if (yukleniyor) return (
        <div style={{textAlign: 'center', padding: '50px', fontSize: '20px', color: '#1a73e8'}}>
            ⚙️ {dil === 'tr' ? 'Haberler hazırlanıyor...' : 'Preparing news...'}
        </div>
    );

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial' }}>
            <h2 style={{ borderBottom: '2px solid #333', paddingBottom: '10px' }}>{t.baslik}</h2>
            
            {haberler.map(h => (
                <div key={h.id} style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h3 onClick={() => gecmiseEkle(h)} style={{color: '#1a73e8', margin: 0, cursor: 'pointer'}} title="Okundu olarak işaretle">
                            {h.baslik}
                        </h3>
                        <button onClick={() => haberSil(h.id)} style={deleteBtnStyle}>
                            {dil === 'tr' ? '🗑️ Sil' : '🗑️ Delete'}
                        </button>
                    </div>

                    {h.gorselUrl && (
                        <div style={{ marginTop: '15px', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '10px', padding: '10px' }}>
                            <img 
                                src={h.gorselUrl} 
                                alt={h.baslik} 
                                style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '8px' }} 
                            />
                        </div>
                    )}
                    
                    <p style={{lineHeight: '1.6', marginTop: '15px'}}>{h.icerik}</p>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                        <span style={{ fontSize: '1.2rem' }}>❤️ <strong>{h.begeniSayisi}</strong></span>
                        <button onClick={() => begen(h.id)} style={actionBtnStyle}>{t.begen}</button>
                        <button onClick={() => haberKaydet(h.id)} style={{ ...actionBtnStyle, backgroundColor: '#ffd700', border: 'none' }}>
                            {t.kaydet}
                        </button>
                    </div>

                    <div style={{ marginTop: '20px', borderTop: '1px dotted #ccc', paddingTop: '10px' }}>
                        <h4 style={{ marginBottom: '10px' }}>{t.yorumlar}</h4>
                        <div style={{ marginBottom: '15px' }}>
                            {yorumlar[h.id] && yorumlar[h.id].map(y => (
                                <div key={y.id} style={{ ...commentBoxStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span><strong>{y.kullaniciAdi}:</strong> {y.icerik}</span>
                                    <span 
                                        onClick={() => yorumSil(y.id, h.id)} 
                                        style={{ color: '#ff4d4d', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', padding: '0 5px' }}
                                    >
                                        ✕
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: '5px' }}>
                            <input 
                                style={inputStyle}
                                value={yorumIcerik[h.id] || ""} 
                                onChange={(e) => setYorumIcerik({...yorumIcerik, [h.id]: e.target.value})}
                                placeholder={t.yorumYap}
                            />
                            <button onClick={() => yorumYap(h.id)} style={sendBtnStyle}>{t.gonder}</button>
                        </div>
                    </div>
                </div>
            ))}

            <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#fff', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', borderLeft: '5px solid #6c757d' }}>
                <h3 style={{ color: '#6c757d', marginTop: 0 }}>🕒 {dil === 'tr' ? 'Okuma Geçmişim' : 'Reading History'}</h3>
                {okumaGecmisi.length === 0 ? (
                    <p style={{ color: '#888', fontSize: '14px' }}>{dil === 'tr' ? 'Henüz haber okumadın.' : 'No history yet.'}</p>
                ) : (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {okumaGecmisi.map(g => (
                            <li key={g.id} style={{ padding: '8px 0', borderBottom: '1px solid #eee', fontSize: '14px', color: '#444' }}>
                                📖 <strong>{g.baslik}</strong>
                            </li>
                        ))}
                    </ul>
                )}
                {okumaGecmisi.length > 0 && (
                    <button 
                        onClick={() => { setOkumaGecmisi([]); localStorage.removeItem('okumaGecmisi'); }} 
                        style={{ marginTop: '15px', backgroundColor: 'transparent', color: '#ff4d4d', border: '1px solid #ff4d4d', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }}
                    >
                        {dil === 'tr' ? '🗑️ Geçmişi Temizle' : '🗑️ Clear History'}
                    </button>
                )}
            </div>

            <div style={{ marginTop: '50px', padding: '20px', backgroundColor: '#fff', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                <h3 style={{ color: '#28a745', borderBottom: '2px solid #28a745', paddingBottom: '10px' }}>
                    📌 {dil === 'tr' ? 'Kaydettiğim Haberler' : 'My Saved News'}
                </h3>
                {kaydedilenHaberler.length === 0 ? (
                    <p style={{ color: '#888' }}>{dil === 'tr' ? 'Henüz haber kaydetmedin.' : 'No saved news yet.'}</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {kaydedilenHaberler.map(kh => (
                            <div key={kh.id} style={{ padding: '10px', borderLeft: '5px solid #ffd700', backgroundColor: '#f9f9f9', borderRadius: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {kh.gorselUrl && <img src={kh.gorselUrl} alt="mini" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '5px' }} />}
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '14px' }}>{kh.baslik}</h4>
                                    </div>
                                </div>
                                <button onClick={() => kaydedilenSil(kh.id)} style={{ backgroundColor: '#ff4d4d', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '11px' }}>
                                    {dil === 'tr' ? '✖ Kaldır' : '✖ Remove'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const cardStyle = { border: '1px solid #ddd', margin: '15px 0', padding: '15px', borderRadius: '12px', backgroundColor: '#fff', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' };
const actionBtnStyle = { cursor: 'pointer', padding: '6px 12px', borderRadius: '6px', border: '1px solid #ddd', backgroundColor: '#f8f9fa', fontWeight: 'bold' };
const deleteBtnStyle = { backgroundColor: '#ff4d4d', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' };
const commentBoxStyle = { background: '#f0f2f5', padding: '10px', marginBottom: '8px', borderRadius: '8px', fontSize: '14px' };
const inputStyle = { flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' };
const sendBtnStyle = { padding: '10px 20px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };

export default HaberListesi;
