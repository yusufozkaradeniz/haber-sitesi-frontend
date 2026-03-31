import React, { useState } from 'react';
import axios from 'axios';

// kayitEkraninaGec prop'unu ekledik
const Giris = ({ onGirisBasarili, sifremiUnuttumAc, kayitEkraninaGec }) => {
    const [email, setEmail] = useState('');
    const [sifre, setSifre] = useState('');
    const [hata, setHata] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:8080/api/kullanici/giris', { email, sifre });
            onGirisBasarili(res.data);
        } catch (err) {
            setHata('E-posta veya şifre hatalı!');
        }
    };

    return (
        <div style={girisContainerStyle}>
            <div style={girisKartStyle}>
                <h2 style={{ textAlign: 'center', color: '#1a73e8' }}>Haber Paneli Giriş</h2>
                {hata && <p style={{ color: 'red', textAlign: 'center' }}>{hata}</p>}
                <form onSubmit={handleSubmit}>
                    <input style={inputStyle} type="email" placeholder="E-posta" value={email} onChange={e => setEmail(e.target.value)} required />
                    <input style={inputStyle} type="password" placeholder="Şifre" value={sifre} onChange={e => setSifre(e.target.value)} required />
                    <button type="submit" style={btnStyle}>Giriş Yap</button>
                </form>

                {/* Şifremi Unuttum Kısmı */}
                <p 
                    onClick={sifremiUnuttumAc} 
                    style={{ textAlign: 'center', color: '#1a73e8', cursor: 'pointer', marginTop: '15px', fontSize: '14px' }}
                >
                    Şifremi Unuttum
                </p>

                {/* 🟢 YENİ: Kayıt Ol Butonu (Stilinle Uyumlu) */}
                <p 
                    onClick={kayitEkraninaGec} 
                    style={{ textAlign: 'center', color: '#28a745', cursor: 'pointer', marginTop: '10px', fontSize: '14px', fontWeight: 'bold' }}
                >
                    Hesabın yok mu? Kayıt Ol
                </p>
            </div>
        </div>
    );
};

// Stillerin dokunulmadan aynı kaldı
const girisContainerStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5' };
const girisKartStyle = { backgroundColor: '#fff', padding: '40px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '350px' };
const inputStyle = { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' };
const btnStyle = { width: '100%', padding: '12px', backgroundColor: '#1a73e8', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };

export default Giris;