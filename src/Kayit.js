import React, { useState } from 'react';
import axios from 'axios';

const Kayit = ({ girisEkraninaDon }) => {
    const [form, setForm] = useState({ isim: '', soyisim: '', email: '', sifre: '', unvan: 'Yeni Yazar' });
    const [mesaj, setMesaj] = useState({ tip: '', icerik: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8080/api/kullanici/kayit', form);
            setMesaj({ tip: 'basari', icerik: '✅ Kayıt başarılı! Giriş yapabilirsiniz.' });
            setTimeout(() => girisEkraninaDon(), 2000);
        } catch (err) {
            setMesaj({ tip: 'hata', icerik: err.response?.data || '❌ Kayıt sırasında bir hata oluştu.' });
        }
    };

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                <h2 style={{ textAlign: 'center', color: '#1a73e8' }}>Yeni Hesap Oluştur</h2>
                {mesaj.icerik && (
                    <div style={{ ...alertStyle, backgroundColor: mesaj.tip === 'basari' ? '#e6fffa' : '#fff5f5' }}>
                        {mesaj.icerik}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <input style={inputStyle} placeholder="İsim" onChange={e => setForm({...form, isim: e.target.value})} required />
                    <input style={inputStyle} placeholder="Soyisim" onChange={e => setForm({...form, soyisim: e.target.value})} required />
                    <input style={inputStyle} type="email" placeholder="E-posta" onChange={e => setForm({...form, email: e.target.value})} required />
                    <input style={inputStyle} type="password" placeholder="Şifre" onChange={e => setForm({...form, sifre: e.target.value})} required />
                    <button type="submit" style={btnStyle}>Kayıt Ol</button>
                </form>
                <p onClick={girisEkraninaDon} style={linkStyle}>Zaten hesabın var mı? Giriş Yap</p>
            </div>
        </div>
    );
};

const containerStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5' };
const cardStyle = { backgroundColor: '#fff', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '350px' };
const inputStyle = { width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' };
const btnStyle = { width: '100%', padding: '12px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const linkStyle = { textAlign: 'center', color: '#1a73e8', cursor: 'pointer', marginTop: '15px', fontSize: '14px' };
const alertStyle = { padding: '10px', borderRadius: '8px', marginBottom: '10px', textAlign: 'center', fontSize: '14px' };

export default Kayit;