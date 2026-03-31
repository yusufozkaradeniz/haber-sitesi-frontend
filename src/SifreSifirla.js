import React, { useState } from 'react';
import axios from 'axios';

const SifreSifirla = ({ kapat }) => {
    const [asama, setAsama] = useState(1); // 1: Email, 2: Kod ve Yeni Şifre
    const [email, setEmail] = useState('');
    const [kod, setKod] = useState('');
    const [yeniSifre, setYeniSifre] = useState('');
    const [mesaj, setMesaj] = useState({ tip: '', icerik: '' });

    // 1. ADIM: Mail Gönder
    const mailGonder = async (e) => {
        e.preventDefault();
        setMesaj({ tip: '', icerik: 'İşlem yapılıyor...' });
        try {
            // ✅ Backend'deki @PostMapping("/sifre-sifirla") ile eşitlendi
            await axios.post('http://localhost:8080/api/kullanici/sifre-sifirla', { email });
            setMesaj({ tip: 'basari', icerik: 'Doğrulama kodu e-postanıza gönderildi!' });
            setAsama(2);
        } catch (err) {
            // Backend'den gelen hata mesajını göster veya kullanıcı bulunamadı de
            const hataMesaji = err.response?.data || 'E-posta bulunamadı!';
            setMesaj({ tip: 'hata', icerik: hataMesaji });
        }
    };

    // 2. ADIM: Güncelle
    const sifreGuncelle = async (e) => {
        e.preventDefault();
        try {
            // ✅ Backend'deki parametre isimleriyle (email, kod, sifre) tam uyumlu hale getirildi
            await axios.post('http://localhost:8080/api/kullanici/sifre-guncelle', { 
                email: email, 
                kod: kod, 
                sifre: yeniSifre 
            });
            setMesaj({ tip: 'basari', icerik: 'Şifre başarıyla güncellendi!' });
            setTimeout(() => kapat(), 2000); // 2 saniye sonra otomatik kapat
        } catch (err) {
            const hataMesaji = err.response?.data || 'Kod hatalı veya işlem başarısız.';
            setMesaj({ tip: 'hata', icerik: hataMesaji });
        }
    };

    return (
        <div style={modalStyle}>
            <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <h3 style={{ margin: 0 }}>🔐 Şifre Yenileme</h3>
                    <button onClick={kapat} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '24px', lineHeight: '1' }}>&times;</button>
                </div>
                
                {mesaj.icerik && (
                    <div style={{ ...alertStyle, backgroundColor: mesaj.tip === 'basari' ? '#e6fffa' : '#fff5f5', color: mesaj.tip === 'basari' ? '#2c7a7b' : '#c53030', border: `1px solid ${mesaj.tip === 'basari' ? '#81e6d9' : '#feb2b2'}` }}>
                        {mesaj.icerik}
                    </div>
                )}

                {asama === 1 ? (
                    <form onSubmit={mailGonder}>
                        <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>Lütfen sistemde kayıtlı e-posta adresinizi girin.</p>
                        <input style={inputStyle} type="email" placeholder="E-posta Adresi" value={email} onChange={e => setEmail(e.target.value)} required />
                        <button type="submit" style={btnStyle}>Kod Gönder</button>
                    </form>
                ) : (
                    <form onSubmit={sifreGuncelle}>
                        <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>E-postanıza gelen 6 haneli kodu ve yeni şifrenizi girin.</p>
                        <input style={inputStyle} type="text" placeholder="6 Haneli Doğrulama Kodu" value={kod} onChange={e => setKod(e.target.value)} required />
                        <input style={inputStyle} type="password" placeholder="Yeni Şifre" value={yeniSifre} onChange={e => setYeniSifre(e.target.value)} required />
                        <button type="submit" style={{ ...btnStyle, backgroundColor: '#28a745' }}>Şifreyi Güncelle</button>
                    </form>
                )}
            </div>
        </div>
    );
};

const modalStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(3px)' };
const cardStyle = { backgroundColor: '#fff', padding: '25px', borderRadius: '15px', width: '350px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' };
const inputStyle = { width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box', outline: 'none' };
const btnStyle = { width: '100%', padding: '12px', backgroundColor: '#1a73e8', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'background 0.2s' };
const alertStyle = { padding: '12px', borderRadius: '8px', marginBottom: '15px', textAlign: 'center', fontSize: '14px', fontWeight: '500' };

export default SifreSifirla;