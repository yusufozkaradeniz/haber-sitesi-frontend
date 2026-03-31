import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Profil({ dil }) {
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        // 1. ADIM: Hafızadan (localStorage) kimin girdiğini bul
        const kayitliVeri = localStorage.getItem('haberSitesiKullanici');
        
        if (kayitliVeri) {
            const aktifKullanici = JSON.parse(kayitliVeri);
            
            setUser(aktifKullanici);
            setFormData(aktifKullanici);

            // 2. ADIM: Arka planda internetten (backend) güncel halini çek
            axios.get(`http://localhost:8080/api/kullanici/${aktifKullanici.id}`)
                .then(res => {
                    setUser(res.data);
                    setFormData(res.data);
                    localStorage.setItem('haberSitesiKullanici', JSON.stringify(res.data));
                })
                .catch(err => console.log("Profil güncellenirken hata oluştu:", err));
        }
    }, []);

    const handleUpdate = () => {
        axios.put(`http://localhost:8080/api/kullanici/${user.id}`, formData)
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
        if (!user.unvan) return dil === 'tr' ? "Yeni Yazar" : "New Author";
        if (user.unvan !== "Baş Editör") return user.unvan;
        const unvanlar = { tr: "Baş Editör", en: "Chief Editor", de: "Chefredakteur", es: "Editor Jefe", fr: "Rédacteur en Chef" };
        return unvanlar[dil] || unvanlar['en'];
    };

    const hakkimdaCevir = () => {
        if (!user.hakkimda) return ""; 
        if (!user.hakkimda.includes("Haber sitesi projesini")) return user.hakkimda;
        const aciklamalar = { tr: "Haber sitesi projesini geliştiren ve yöneten yazılım geliştiricisi.", en: "Software developer developing and managing the news site project.", de: "Softwareentwickler, der das Nachrichtenseitenprojekt entwickelt und verwaltet.", es: "Desarrollador de software que desarrolla ve gestiona el proyecto del sitio de noticias.", fr: "Développeur de logiciels développant et gérant le projet de site d'information." };
        return aciklamalar[dil] || aciklamalar['en'];
    };

    return (
        <div style={{ border: '2px solid #007bff', padding: '20px', borderRadius: '15px', margin: '20px auto', maxWidth: '400px', backgroundColor: '#fff', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
            {!isEditing ? (
                <div style={{ textAlign: 'center' }}>
                    {/* 🔥 GÜNCELLEME: Dış link kaldırıldı, kalıcı YÖ eklendi */}
                    <div style={{ 
                        width: '100px', 
                        height: '100px', 
                        borderRadius: '50%', 
                        backgroundColor: '#007bff', 
                        color: 'white', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: '32px', 
                        fontWeight: 'bold', 
                        margin: '0 auto 15px', 
                        border: '3px solid #fff', 
                        boxShadow: '0 4px 10px rgba(0,123,255,0.3)' 
                    }}>
                        YÖ
                    </div>

                    <h2 style={{margin: '5px 0'}}>{user.isim} {user.soyisim}</h2>
                    <p style={{color: '#007bff', fontWeight: 'bold'}}>{unvanCevir()}</p>
                    <p style={{fontSize: '14px', color: '#666'}}>{hakkimdaCevir()}</p>
                    <p style={{fontSize: '13px', color: '#888', fontStyle: 'italic', margin: '5px 0'}}>{user.email}</p>
                    <button onClick={() => setIsEditing(true)} style={{backgroundColor: '#007bff', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px'}}>
                        {dil === 'tr' ? 'Düzenle' : 'Edit'} 
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <h3 style={{textAlign: 'center', color: '#007bff'}}>{dil === 'tr' ? 'Profili Düzenle' : 'Edit Profile'}</h3>
                    <input placeholder="İsim" value={formData.isim || ''} onChange={e => setFormData({...formData, isim: e.target.value})} style={inputStyle} />
                    <input placeholder="Soyisim" value={formData.soyisim || ''} onChange={e => setFormData({...formData, soyisim: e.target.value})} style={inputStyle} />
                    <input placeholder="Unvan" value={formData.unvan || ''} onChange={e => setFormData({...formData, unvan: e.target.value})} style={inputStyle} />
                    <textarea placeholder="Hakkımda" value={formData.hakkimda || ''} onChange={e => setFormData({...formData, hakkimda: e.target.value})} style={{...inputStyle, height: '60px'}} />
                    
                    {/* 🔥 GÜNCELLEME: Link/URL inputu buradan da kaldırıldı */}
                    
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button onClick={handleUpdate} style={{backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px', borderRadius: '5px', flex: 1, cursor: 'pointer', fontWeight: 'bold'}}>
                            {dil === 'tr' ? 'Kaydet' : 'Save'}
                        </button>
                        <button onClick={() => setIsEditing(false)} style={{backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '10px', borderRadius: '5px', flex: 1, cursor: 'pointer', fontWeight: 'bold'}}>
                            {dil === 'tr' ? 'İptal' : 'Cancel'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

const inputStyle = { padding: '8px', borderRadius: '5px', border: '1px solid #ccc', width: '100%', boxSizing: 'border-box', outline: 'none' };

export default Profil;