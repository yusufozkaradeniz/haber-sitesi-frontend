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
  const API_URL = 'https://habersitesi-backend.onrender.com/api/reklamlar';
  const BILDIRIM_URL = 'https://habersitesi-backend.onrender.com/api/bildirimler';
  const HABER_API_URL = 'https://habersitesi-backend.onrender.com/api/haberler';

  // 🔥 ADMIN KONTROLÜ (Büyük/Küçük harf duyarsız)
  const isAdmin = kullanici?.email?.toLowerCase() === "yusufzkrdz@gmail.com";

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
    axios.get(API_URL).then(res => setReklamlar(res.data)).catch(err => console.log(err));
  };

  const bildirimleriGetir = () => {
    axios.get(BILDIRIM_URL).then(res => {
      setBildirimler(res.data);
      setYeniBildirimVarMi(res.data.some(b => b.okundu === false));
    }).catch(err => console.log(err));
  };

  const bildirimiOku = (id) => axios.put(`${BILDIRIM_URL}/${id}/oku`).then(() => bildirimleriGetir());
  const bildirimiSil = (id) => axios.delete(`${BILDIRIM_URL}/${id}`).then(() => bildirimleriGetir());

  const haberKaydet = (e) => {
    e.preventDefault();
    axios.post(HABER_API_URL, haberForm).then(() => {
      bildirimleriGetir();
      setHaberForm({ baslik: '', icerik: '', gorselUrl: '' });
      setHaberGuncellemeTetikleyici(prev => prev + 1);
      alert(dil === 'tr' ? "Haber eklendi!" : "News added!");
    });
  };

  const handleGirisBasarili = (data) => {
    setKullanici(data);
    localStorage.setItem('haberSitesiKullanici', JSON.stringify(data));
  };

  const handleCikis = () => {
    setKullanici(null);
    localStorage.removeItem('haberSitesiKullanici');
    window.location.reload();
  };

  const kaydet = (e) => {
    e.preventDefault();
    const action = form.id ? axios.put(`${API_URL}/${form.id}`, form) : axios.post(API_URL, form);
    action.then(() => {
      verileriGetir();
      setForm({ id: null, reklamAdi: '', reklamLinki: '', gorselUrl: '', fiyat: '' });
    });
  };

  const sil = (id) => {
    if(window.confirm("Emin misin?")) axios.delete(`${API_URL}/${id}`).then(() => verileriGetir());
  };

  if (!kullanici) {
    return (
      <>
        {ekran === 'giris' ? (
          <Giris onGirisBasarili={handleGirisBasarili} sifremiUnuttumAc={() => setModalAcik(true)} kayitEkraninaGec={() => setEkran('kayit')} />
        ) : (
          <Kayit girisEkraninaDon={() => setEkran('giris')} /> 
        )}
        {modalAcik && <SifreSifirla kapat={() => setModalAcik(false)} />}
      </>
    );
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      
      <div style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: '#fff', padding: '10px 20px', borderRadius: '50px', display: 'flex', justifyContent: 'space-between', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button onClick={() => window.scrollTo(0,0)} style={navBtnStyle}>🏠 Panel</button>
          <button onClick={() => document.getElementById('profil-bolumu').scrollIntoView()} style={navBtnStyle}>👤 Profil</button>
          <button onClick={handleCikis} style={{...navBtnStyle, color: '#dc3545'}}>🚪 Çıkış</button>
        </div>
        
        <select value={dil} onChange={(e) => setDil(e.target.value)} style={{ padding: '8px', borderRadius: '20px' }}>
          <option value="tr">TR 🇹🇷</option>
          <option value="en">EN 🇺🇸</option>
        </select>
      </div>

      <h1 style={{ textAlign: 'center', color: '#1a73e8' }}>{dil === 'tr' ? 'Yönetim Paneli' : 'Management Panel'}</h1>
      
      <div id="profil-bolumu" style={sectionStyle}>
        <Profil dil={dil} /> 
      </div>

      {/* ✅ ADMIN FİLTRESİ BURADA */}
      {isAdmin && (
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', marginBottom: '30px' }}>
            <div style={formBoxStyle}>
              <h3>Reklam Yönetimi</h3>
              <form onSubmit={kaydet}>
                  <input style={inputStyle} placeholder="Reklam Adı" value={form.reklamAdi} onChange={e => setForm({...form, reklamAdi: e.target.value})} required />
                  <input style={inputStyle} type="number" placeholder="Fiyat" value={form.fiyat} onChange={e => setForm({...form, fiyat: e.target.value})} required />
                  <button type="submit" style={addBtnStyle}>Kaydet</button>
              </form>
            </div>

            <div style={formBoxStyle}>
              <h3>Haber Yönetimi</h3>
              <form onSubmit={haberKaydet}>
                  <input style={inputStyle} placeholder="Haber Başlığı" value={haberForm.baslik} onChange={e => setHaberForm({...haberForm, baslik: e.target.value})} required />
                  <textarea style={{...inputStyle, height: '60px'}} placeholder="İçerik" value={haberForm.icerik} onChange={e => setHaberForm({...haberForm, icerik: e.target.value})} required />
                  <button type="submit" style={{...addBtnStyle, backgroundColor: '#1a73e8'}}>Yayınla</button>
              </form>
            </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {reklamlar.map(r => (
          <div key={r.id} style={cardStyle}>
            <h4>{r.reklamAdi}</h4>
            <p>{r.fiyat} TL</p>
            {isAdmin && (
                <button onClick={() => sil(r.id)} style={{backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>Sil</button>
            )}
          </div>
        ))}
      </div>

      <HaberListesi dil={dil} tetikleyici={haberGuncellemeTetikleyici} kullanici={kullanici} />
    </div>
  );
}

const sectionStyle = { maxWidth: '800px', margin: '0 auto 40px', padding: '20px', backgroundColor: '#fff', borderRadius: '12px' };
const navBtnStyle = { border: 'none', background: 'none', color: '#1a73e8', fontWeight: 'bold', cursor: 'pointer' };
const inputStyle = { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ddd' };
const addBtnStyle = { width: '100%', padding: '10px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' };
const cardStyle = { padding: '15px', borderRadius: '12px', width: '200px', backgroundColor: '#fff', textAlign: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' };
const formBoxStyle = { flex: 1, minWidth: '300px', padding: '20px', backgroundColor: '#fff', borderRadius: '12px' };

export default App;
