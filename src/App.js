import React, { useEffect, useState } from 'react';
import axios from 'axios';
import HaberListesi from './HaberListesi';
import { tercumeler } from './Dil';
import Profil from './Profil';
import SifreSifirla from './SifreSifirla';
import Giris from './Giris'; 
import Kayit from './Kayit'; 
import { FaBell } from 'react-icons/fa';

function App() {
  const [reklamlar, setReklamlar] = useState([]);
  const [form, setForm] = useState({ id: null, reklamAdi: '', reklamLinki: '', gorselUrl: '', fiyat: '' });
  const [dil, setDil] = useState('tr');
  const [modalAcik, setModalAcik] = useState(false);
  const [kullanici, setKullanici] = useState(null); 
  const [ekran, setEkran] = useState('giris'); 

  const [bildirimler, setBildirimler] = useState([]);
  const [yeniBildirimVarMi, setYeniBildirimVarMi] = useState(false);
  const [bildirimMenuAcik, setBildirimMenuAcik] = useState(false);

  const [haberForm, setHaberForm] = useState({ baslik: '', icerik: '', gorselUrl: '' });
  const [haberGuncellemeTetikleyici, setHaberGuncellemeTetikleyici] = useState(0); 

  const t = tercumeler[dil];
  const API_URL = 'http://localhost:8080/api/reklamlar';
  const BILDIRIM_URL = 'http://localhost:8080/api/bildirimler';
  const HABER_API_URL = 'http://localhost:8080/api/haberler';

  useEffect(() => {
    const kayitliKullanici = localStorage.getItem('haberSitesiKullanici');
    if (kayitliKullanici) {
      setKullanici(JSON.parse(kayitliKullanici));
    }
  }, []);

  useEffect(() => { 
    if (kullanici) {
      verileriGetir(); 
      bildirimleriGetir(); 
    }
  }, [kullanici]);

  const verileriGetir = () => {
    axios.get(API_URL)
      .then(res => setReklamlar(res.data))
      .catch(err => console.log("Veri çekme hatası:", err));
  };

  const bildirimleriGetir = () => {
    axios.get(BILDIRIM_URL)
      .then(res => {
        setBildirimler(res.data);
        const okunmamis = res.data.some(b => b.okundu === false);
        setYeniBildirimVarMi(okunmamis);
      })
      .catch(err => console.log("Bildirim çekme hatası:", err));
  };

  const bildirimiOku = (id) => {
    axios.put(`${BILDIRIM_URL}/${id}/oku`)
      .then(() => bildirimleriGetir());
  };

  const bildirimiSil = (id) => {
    axios.delete(`${BILDIRIM_URL}/${id}`)
      .then(() => bildirimleriGetir())
      .catch(err => console.log("Bildirim silme hatası:", err));
  };

  const haberKaydet = (e) => {
    e.preventDefault();
    axios.post(HABER_API_URL, haberForm)
      .then(() => {
        bildirimleriGetir();
        setHaberForm({ baslik: '', icerik: '', gorselUrl: '' });
        setHaberGuncellemeTetikleyici(prev => prev + 1);
        alert(dil === 'tr' ? "Haber eklendi! ✅" : "News added! ✅");
      })
      .catch(err => console.log("Haber ekleme hatası:", err));
  };

  const handleGirisBasarili = (data) => {
    setKullanici(data);
    localStorage.setItem('haberSitesiKullanici', JSON.stringify(data));
  };

  // 🔥 GÜNCELLEME: Çıkış yaparken her şeyi temizliyoruz ve sayfayı tazeliyoruz
  const handleCikis = () => {
    setKullanici(null);
    localStorage.removeItem('haberSitesiKullanici');
    setEkran('giris');
    window.location.reload(); // Tarayıcıyı tazele ki eski şifre kalıntıları uçsun
  };

  const kaydet = (e) => {
    e.preventDefault();
    if (form.id) {
      axios.put(`${API_URL}/${form.id}`, form).then(() => {
        verileriGetir();
        setForm({ id: null, reklamAdi: '', reklamLinki: '', gorselUrl: '', fiyat: '' });
      });
    } else {
      axios.post(API_URL, form).then(() => {
        verileriGetir();
        bildirimleriGetir(); 
        setForm({ id: null, reklamAdi: '', reklamLinki: '', gorselUrl: '', fiyat: '' });
      });
    }
  };

  const sil = (id) => {
    if(window.confirm(dil === 'tr' ? "Emin misin?" : "Are you sure?")) {
      axios.delete(`${API_URL}/${id}`).then(() => verileriGetir());
    }
  };

  if (!kullanici) {
    return (
      <>
        {ekran === 'giris' ? (
          <Giris 
            onGirisBasarili={handleGirisBasarili} 
            sifremiUnuttumAc={() => setModalAcik(true)} 
            kayitEkraninaGec={() => setEkran('kayit')} 
          />
        ) : (
          <Kayit girisEkraninaDon={() => setEkran('giris')} /> 
        )}
        {modalAcik && <SifreSifirla kapat={() => setModalAcik(false)} />}
      </>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      
      <div style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: '#fff', padding: '10px 20px', borderRadius: '50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} style={navBtnStyle}>🏠 {dil === 'tr' ? 'Panel' : 'Panel'}</button>
          <button onClick={() => document.getElementById('profil-bolumu').scrollIntoView({behavior: 'smooth'})} style={navBtnStyle}>👤 {dil === 'tr' ? 'Profil' : 'Profile'}</button>
          <button onClick={handleCikis} style={{...navBtnStyle, color: '#dc3545'}}>🚪 {dil === 'tr' ? 'Çıkış' : 'Logout'}</button>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ position: 'relative' }}>
            <div onClick={() => setBildirimMenuAcik(!bildirimMenuAcik)} style={{ cursor: 'pointer', position: 'relative' }}>
              <FaBell size={22} color={yeniBildirimVarMi ? "#dc3545" : "#1a73e8"} />
              {yeniBildirimVarMi && (
                <span style={{ position: 'absolute', top: '-2px', right: '-2px', backgroundColor: 'red', borderRadius: '50%', width: '10px', height: '10px', border: '2px solid white' }}></span>
              )}
            </div>

            {bildirimMenuAcik && (
              <div style={{ position: 'absolute', top: '35px', right: '0', width: '250px', backgroundColor: '#fff', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', borderRadius: '12px', padding: '10px', maxHeight: '300px', overflowY: 'auto', zIndex: 1000 }}>
                <h4 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>{dil === 'tr' ? 'Bildirimler' : 'Notifications'}</h4>
                {bildirimler.length === 0 ? <p style={{ fontSize: '12px', color: '#999' }}>{dil === 'tr' ? 'Bildirim yok' : 'No notifications'}</p> : 
                  bildirimler.map(b => (
                    <div key={b.id} style={{ 
                        padding: '8px', 
                        borderBottom: '1px solid #f9f9f9', 
                        fontSize: '13px', 
                        backgroundColor: b.okundu ? '#fff' : '#f0f7ff', 
                        borderRadius: '6px', 
                        marginBottom: '4px',
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center' 
                    }}>
                      <span onClick={() => bildirimiOku(b.id)} style={{ cursor: 'pointer', flex: 1 }}>
                        {b.mesaj}
                      </span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); bildirimiSil(b.id); }} 
                        style={{ border: 'none', background: 'none', color: '#ff4d4d', cursor: 'pointer', padding: '0 5px', fontSize: '16px', fontWeight: 'bold' }}
                        title={dil === 'tr' ? 'Sil' : 'Delete'}
                      >
                        ×
                      </button>
                    </div>
                  ))
                }
              </div>
            )}
          </div>

          <select value={dil} onChange={(e) => setDil(e.target.value)} style={{ padding: '8px 15px', borderRadius: '20px', border: '1px solid #1a73e8', cursor: 'pointer', fontWeight: 'bold' }}>
              <option value="tr">Türkçe 🇹🇷</option>
              <option value="en">English 🇺🇸</option>
              <option value="de">Deutsch 🇩🇪</option>
              <option value="es">Español 🇪🇸</option>
              <option value="fr">Français 🇫🇷</option>
          </select>
        </div>
      </div>

      <h1 style={{ textAlign: 'center', color: '#1a73e8' }}>{dil === 'tr' ? 'Haber Sitesi Yönetim Paneli' : 'News Management Panel'}</h1>
      
      <div id="profil-bolumu" style={sectionStyle}>
        <h2 style={{ color: '#1a73e8', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>👤 {dil === 'tr' ? 'Profil Bilgilerim' : 'My Profile'}</h2>
        <Profil dil={dil} /> 
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', marginBottom: '30px' }}>
        <div style={{ flex: 1, minWidth: '300px', maxWidth: '600px', padding: '20px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginTop: 0 }}>{form.id ? t.duzenle : t.yeniReklamEkle}</h3>
          <form onSubmit={kaydet}>
            <input style={inputStyle} placeholder={t.reklamAdi} value={form.reklamAdi} onChange={e => setForm({...form, reklamAdi: e.target.value})} required />
            <input style={inputStyle} placeholder={t.reklamLinki} value={form.reklamLinki} onChange={e => setForm({...form, reklamLinki: e.target.value})} />
            <input style={inputStyle} placeholder={t.gorselUrl} value={form.gorselUrl} onChange={e => setForm({...form, gorselUrl: e.target.value})} />
            <input style={inputStyle} type="number" placeholder={t.fiyat} value={form.fiyat} onChange={e => setForm({...form, fiyat: e.target.value})} required />
            <button type="submit" style={form.id ? updateBtnStyle : addBtnStyle}>{form.id ? t.duzenle : t.sistemeEkle}</button>
            {form.id && <button type="button" onClick={() => setForm({id:null, reklamAdi:'', reklamLinki:'', gorselUrl:'', fiyat:''})} style={cancelBtnStyle}>Vazgeç</button>}
          </form>
        </div>

        <div style={{ flex: 1, minWidth: '300px', maxWidth: '600px', padding: '20px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginTop: 0, color: '#1a73e8' }}>{dil === 'tr' ? '📣 Yeni Haber Ekle' : '📣 Add New News'}</h3>
          <form onSubmit={haberKaydet}>
            <input style={inputStyle} placeholder={dil === 'tr' ? "Haber Başlığı" : "News Title"} value={haberForm.baslik} onChange={e => setHaberForm({...haberForm, baslik: e.target.value})} required />
            <textarea style={{...inputStyle, height: '80px'}} placeholder={dil === 'tr' ? "Haber İçeriği" : "News Content"} value={haberForm.icerik} onChange={e => setHaberForm({...haberForm, icerik: e.target.value})} required />
            <input style={inputStyle} placeholder={dil === 'tr' ? "Görsel URL" : "Image URL"} value={haberForm.gorselUrl} onChange={e => setHaberForm({...haberForm, gorselUrl: e.target.value})} />
            <button type="submit" style={{...addBtnStyle, backgroundColor: '#1a73e8'}}>{dil === 'tr' ? 'Haberi Yayınla' : 'Publish News'}</button>
          </form>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '40px' }}>
        {reklamlar.map(r => (
          <div key={r.id} style={cardStyle}>
            <img src={r.gorselUrl || 'https://via.placeholder.com/150'} alt="reklam" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px' }} />
            <h4 style={{ margin: '10px 0' }}>{r.reklamAdi}</h4>
            <p style={{ color: '#28a745', fontWeight: 'bold' }}>{r.fiyat} TL</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
              <button onClick={() => setForm(r)} style={editBtnStyle}>{t.duzenle}</button>
              <button onClick={() => sil(r.id)} style={deleteBtnStyle}>{t.reklamSil}</button>
            </div>
          </div>
        ))}
      </div>

      <HaberListesi dil={dil} tetikleyici={haberGuncellemeTetikleyici} />
    </div>
  );
}

const sectionStyle = { maxWidth: '800px', margin: '0 auto 40px', padding: '20px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' };
const navBtnStyle = { border: 'none', background: 'none', color: '#1a73e8', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' };
const inputStyle = { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' };
const addBtnStyle = { width: '100%', padding: '12px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const updateBtnStyle = { width: '100%', padding: '12px', backgroundColor: '#ffc107', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const cancelBtnStyle = { width: '100%', marginTop: '5px', padding: '8px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' };
const cardStyle = { border: 'none', padding: '15px', borderRadius: '12px', width: '240px', backgroundColor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' };
const editBtnStyle = { padding: '5px 12px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' };
const deleteBtnStyle = { padding: '5px 12px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' };

export default App;