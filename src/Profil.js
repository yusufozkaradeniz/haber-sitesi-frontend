import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Profil({ dil }) {
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});

    // 🔥 ADMIN KONTROLÜ
    const isAdmin = user?.email?.toLowerCase() === "yusufzkrdz@gmail.com";

    useEffect(() => {
        const kayitliVeri = localStorage.getItem('haberSitesiKullanici');
        
        if (kayitliVeri) {
            const aktifKullanici = JSON.parse(kayitliVeri);
            setUser(aktifKullanici);
            setFormData(aktifKullanici);

            axios.get(`https://habersitesi-backend.onrender.com/api/kullanici/${aktifKullanici.id}`)
                .then(res => {
                    setUser(res.data);
                    setFormData(res.data);
                    localStorage.setItem('haberSitesiKullanici', JSON.stringify(res.data));
                })
                .catch(err => console.log("Profil güncellenirken hata:", err));
        }
    }, []);

    const handleUpdate = () => {
        axios.put(`https://habersitesi-backend.onrender.com/api/kullanici/${user.id}`, formData)
            .then((res) => {
                setIsEditing(false);
                setUser(res.data);
                setFormData(res.data);
                localStorage.setItem('haberSitesiKullanici', JSON.stringify(res.data));
                alert(dil === 'tr' ? "Profil başarıyla güncellendi!" : "Profile updated successfully!");
            })
            .catch(err => alert("Hata: " + err));
    };

    if (!user) return <div style={{textAlign: 'center', padding: '20px'}}>{dil === 'tr' ? 'Lütfen giriş yapın.' : 'Please log in.'}</div>;

    const unvanCevir = () => {
        if (!user.unvan) return dil === 'tr' ? "Okuyucu" : "Reader";
        return user.unvan;
    };

    return (
        <div style={{ border: '2px solid #007bff', padding: '20px', borderRadius: '15px', margin: '20px auto', maxWidth: '400px', backgroundColor: '#fff', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
            {!isEditing ? (
                <div style={{ textAlign: 'center' }}>
                    <div style={avatarStyle}>
                        {user.isim ? user.isim.substring(0, 1).toUpperCase() : 'U'}
                        {user.soyisim ? user.soyisim.substring(0, 1).toUpperCase() : ''}
                    </div>

                    <h2 style={{margin: '5px 0'}}>{user.isim} {user.soyisim}</h2>
                    <p style={{color: '#007bff', fontWeight: 'bold'}}>{unvanCevir()}</p>
                    <p style={{fontSize: '14px', color: '#666'}}>{user.hakkimda || (dil === 'tr' ? "Haber tutkunu okuyucu." : "News enthusiast reader.")}</p>
                    <p style={{fontSize: '13px', color: '#888', fontStyle: 'italic', margin: '5px 0'}}>{user.email}</p>
                    
                    {/* 🔥 SADECE ADMIN DÜZENLEYEBİLİR */}
                    {isAdmin && (
                        <button onClick={() => setIsEditing(true)} style={editBtnStyle}>
                            {dil === 'tr' ? 'Düzenle' : 'Edit'} 
                        </button>
                    )}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <h3 style={{textAlign: 'center', color: '#007bff'}}>{dil === 'tr' ? 'Profili Düzenle' : 'Edit Profile'}</h3>
                    <input placeholder="İsim" value={formData.isim || ''} onChange={e => setFormData({...formData, isim: e.target.value})} style={inputStyle} />
                    <input placeholder="Soyisim" value={formData.soyisim || ''} onChange={e => setFormData({...formData, soyisim: e.target.value})} style={inputStyle} />
                    
                    {/* 🚫 UNVAN KİLİTLİ: Kimse değiştiremez */}
                    <input value={formData.unvan || 'Okuyucu'} disabled style={{...inputStyle, backgroundColor: '#f0f0f0', cursor: 'not-allowed'}} />
                    
                    <textarea placeholder="Hakkımda" value={formData.hakkimda || ''} onChange={e => setFormData({...formData, hakkimda: e.target.value})} style={{...inputStyle, height: '60px'}} />
                    
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button onClick={handleUpdate} style={saveBtnStyle}>
                            {dil === 'tr' ? 'Kaydet' : 'Save'}
                        </button>
                        <button onClick={() => setIsEditing(false)} style={cancelBtnStyle}>
                            {dil === 'tr' ? 'İptal' : 'Cancel'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

const avatarStyle = { width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#007bff', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 'bold', margin: '0 auto 15px', border: '3px solid #fff', boxShadow: '0 4px 10px rgba(0,123,255,0.3)' };
const inputStyle = { padding: '8px', borderRadius: '5px', border: '1px solid #ccc', width: '100%', boxSizing: 'border-box', outline: 'none' };
const editBtnStyle = { backgroundColor: '#007bff', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' };
const saveBtnStyle = { backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px', borderRadius: '5px', flex: 1, cursor: 'pointer', fontWeight: 'bold' };
const cancelBtnStyle = { backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '10px', borderRadius: '5px', flex: 1, cursor: 'pointer', fontWeight: 'bold' };

export default Profil;
