import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import translate from "translate"; 
import { tercumeler } from './Dil';

translate.engine = "google"; 

const HaberListesi = ({ dil, tetikleyici, kullanici }) => {
    const [haberler, setHaberler] = useState([]);
    const [yorumIcerik, setYorumIcerik] = useState({}); 
    const [yorumlar, setYorumlar] = useState({});
    const [yukleniyor, setYukleniyor] = useState(false);
    const [kaydedilenHaberler, setKaydedilenHaberler] = useState([]);
    const [okumaGecmisi, setOkumaGecmisi] = useState([]);
    // 🔥 KİLİT STATE
    const [isLiking, setIsLiking] = useState(false);

    const t = tercumeler[dil];
    const isAdmin = kullanici?.email?.toLowerCase() === "yusufzkrdz@gmail.com";

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

    const kaydedilenleriGetir = useCallback(async () => {
        try {
            const kullaniciRes = await axios.get('https://habersitesi-backend.onrender.com/api/kullanici');
            if (kullaniciRes.data.length > 0) {
                const aktifId = kullaniciRes.data[0].id;
                const res = await axios.get(`https://habersitesi-backend.onrender.com/api/kullanici/${aktifId}/kaydedilenler`);
                setKaydedilenHaberler(res.data);
            }
        } catch (err) { console.log(err); }
    }, []);

    const verileriGetirveCevir = useCallback(async () => {
        setYukleniyor(true);
        try {
            const res = await axios.get('https://habersitesi-backend.onrender.com/api/haberler');
            const hamHaberler = res.data.sort((a, b) => a.id - b.id);
            if (dil === 'tr') { setHaberler(hamHaberler); } 
            else {
                const cevrilmisHaberler = await Promise.all(hamHaberler.map(async (h) => ({
                    ...h,
                    baslik: await translate(h.baslik, { from: "tr", to: dil }),
                    icerik: await translate(h.icerik, { from: "tr", to: dil })
                })));
                setHaberler(cevrilmisHaberler);
            }
            hamHaberler.forEach(async (h) => {
                const yRes = await axios.get(`https://habersitesi-backend.onrender.com/api/yorumlar/haber/${h.id}`);
                setYorumlar(prev => ({ ...prev, [h.id]: yRes.data }));
            });
        } catch (err) { console.error(err); } 
        finally { setYukleniyor(false); }
    }, [dil]);

    useEffect(() => {
        verileriGetirveCevir();
        kaydedilenleriGetir(); 
    }, [verileriGetirveCevir, kaydedilenleriGetir, tetikleyici]);

    const haberSil = (id) => {
        if (window.confirm("Silinsin mi?")) {
            axios.delete(`https://habersitesi-backend.onrender.com/api/haberler/${id}`)
                .then(() => setHaberler(prev => prev.filter(h => h.id !== id)));
        }
    };

    const yorumSil = (yorumId, haberId) => {
        if (window.confirm("Yorum silinsin mi?")) {
            axios.delete(`https://habersitesi-backend.onrender.com/api/yorumlar/${yorumId}`)
                .then(() => {
                    axios.get(`https://habersitesi-backend.onrender.com/api/yorumlar/haber/${haberId}`)
                        .then(res => setYorumlar(prev => ({ ...prev, [haberId]: res.data })));
                });
        }
    };

    // 🔥 BEĞENİ KİLİDİ (BASİT VE HATASIZ)
    const begen = (id) => {
        if (isLiking) return;
        setIsLiking(true);
        axios.post(`https://habersitesi-backend.onrender.com/api/haberler/${id}/begen`)
            .then(() => { verileriGetirveCevir(); })
            .catch(err => { console.log(err); })
            .finally(() => { setIsLiking(false); });
    };

    const haberKaydet = async (haberId) => {
        try {
            const kullaniciRes = await axios.get('https://habersitesi-backend.onrender.com/api/kullanici');
            if (kullaniciRes.data.length > 0) {
                const aktifId = kullaniciRes.data[0].id;
                await axios.post(`https://habersitesi-backend.onrender.com/api/kullanici/${aktifId}/kaydet/${haberId}`);
                alert("Kaydedildi!");
                kaydedilenleriGetir(); 
            }
        } catch (err) { console.error(err); }
    };

    const kaydedilenSil = async (haberId) => {
        try {
            const kullaniciRes = await axios.get('https://habersitesi-backend.onrender.com/api/kullanici');
            if (kullaniciRes.data.length > 0) {
                const aktifId = kullaniciRes.data[0].id;
                await axios.delete(`https://habersitesi-backend.onrender.com/api/kullanici/${aktifId}/kaydedilenler/${haberId}`);
                kaydedilenleriGetir(); 
            }
        } catch (err) { console.error(err); }
    };

    const yorumYap = (haberId) => {
        if (!yorumIcerik[haberId]) return;
        axios.post(`https://habersitesi-backend.onrender.com/api/yorumlar`, {
            kullaniciAdi: kullanici?.isim || "Misafir",
            icerik: yorumIcerik[haberId],
            haberId: haberId
        })
        .then(() => {
            setYorumIcerik(prev => ({ ...prev, [haberId]: "" }));
            axios.get(`https://habersitesi-backend.onrender.com/api/yorumlar/haber/${haberId}`)
                .then(res => setYorumlar(prev => ({ ...prev, [haberId]: res.data })));
        });
    };

    if (yukleniyor) return <div style={{textAlign: 'center', padding: '50px'}}>⚙️ Hazırlanıyor...</div>;

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial' }}>
            <h2 style={{ borderBottom: '2px solid #333', paddingBottom: '10px' }}>{t.baslik}</h2>
            {haberler.map(h => (
                <div key={h.id} style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <h3 onClick={() => gecmiseEkle(h)} style={{color: '#1a73e8', cursor: 'pointer'}}>{h.baslik}</h3>
                        {isAdmin && <button onClick={() => haberSil(h.id)} style={deleteBtnStyle}>Sil</button>}
                    </div>
                    {h.gorselUrl && <img src={h.gorselUrl} alt="haber" style={{ maxWidth: '100%', borderRadius: '8px' }} />}
                    <p>{h.icerik}</p>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span>❤️ <strong>{h.begeniSayisi}</strong></span>
                        <button onClick={() => begen(h.id)} disabled={isLiking} style={actionBtnStyle}>
                            {isLiking ? '...' : t.begen}
                        </button>
                        <button onClick={() => haberKaydet(h.id)} style={{...actionBtnStyle, backgroundColor: '#ffd700'}}>{t.kaydet}</button>
                    </div>
                    {/* Yorumlar ve diğer kısımlar... */}
                </div>
            ))}
        </div>
    );
};

const cardStyle = { border: '1px solid #ddd', margin: '15px 0', padding: '15px', borderRadius: '12px', backgroundColor: '#fff' };
const actionBtnStyle = { cursor: 'pointer', padding: '6px 12px', borderRadius: '6px', border: '1px solid #ddd' };
const deleteBtnStyle = { backgroundColor: '#ff4d4d', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '6px' };
const commentBoxStyle = { background: '#f0f2f5', padding: '8px', marginBottom: '5px', borderRadius: '8px' };
const inputStyle = { flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd' };
const sendBtnStyle = { padding: '10px 20px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '8px' };

export default HaberListesi;
