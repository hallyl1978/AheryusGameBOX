# anatalimat.md (Kanonik Proje Başlangıç + Oturum + Bağlam Mühendisliği Talimatları --- v1.1)

**Son Güncelleme:** 2025-11\
**Durum:** Aktif -- Tüm projelerde kullanılması gereken kanonik talimat
seti

------------------------------------------------------------------------

# 0. Amaç ve Kapsam

Bu belge; yapay zeka destekli tüm uygulama, oyun, servis, araç ve ürün
geliştirme projeleri için **kanonik başlangıç, oturum yönetimi ve bağlam
mühendisliği kurallarını** tanımlar.\
Tüm yeni oturumlarda yüklenir, projeler boyunca standart rehber olarak
uygulanır.

------------------------------------------------------------------------

# 1. Dil, İletişim ve Genel İlkeler

## 1.1 İletişim dili

-   Tüm yanıtlar **Türkçe** olmalıdır.\
-   UTF‑8 uyumlu metin üretilir.\
-   Bozuk karakter, işlenmemiş veri kullanılmaz.

## 1.2 Tutarlılık

-   Yanıtlar açık, tutarlı ve kontrol edilmiş olmalıdır.\
-   Gereksiz tekrar yapılmaz.\
-   İçerikler modüler, temiz ve doğrudan kullanılabilir hazırlanır.

## 1.3 Talimatlara bağlılık

-   Kullanıcı talimatları ana kaynaktır.\
-   Kullanıcı değiştirmedikçe bu belge sabit kalır.

------------------------------------------------------------------------

# 2. Kodlama ve Teknik Standartlar

## 2.1 Kodlama & İsimlendirme

-   Kod örnekleri doğrudan projeye kopyalanabilir olmalıdır.\
-   İsimlendirme platform standartlarına uygun olacaktır.\
-   Gereksiz boşluk, yanlış indent, karışık blok yapısı bulunmaz.

## 2.2 Dil özel kuralları

-   Dart, TS, Python, C#, C++, UE C++ vb. dillerde doğru modülleme
    yapılır.\
-   Ortak fonksiyonlar `/utils` veya `/shared` klasörüne alınır.\
-   Bağımlılıklar doğru belirtilir.

------------------------------------------------------------------------

# 3. Dosya, Dizin ve Belgeleme Kuralları

## 3.1 Standart klasör yapısı

    Documentation/
        Sessions/
        Testing/
    Project/
        src/
        assets/
        config/
        _temp/

## 3.2 Belgeleme kuralları

-   Her önemli işlem, karar, hata ve yapı değişikliği kaydedilir.\
-   Kayıt otomatik yapılır, kullanıcıdan "kaydet" demesi beklenmez.\
-   Dosyalar tarih-saat biçimiyle saklanır.

------------------------------------------------------------------------

# 4. Oturum Kayıt Sistemi ("Sessions")

Her oturumda otomatik kayıt dosyası oluşturulur:

**Dosya adı:** `YYYY-MM-DD_HHMM_OturumX.md`

## 4.1 Oturum Şablonu

    # Oturum No:
    # Tarih:
    # Saat:
    # Proje:
    # Modül / Alan:

    ## 1. Oturumun Amacı
    ## 2. Kullanıcı Talimatları
    ## 3. Üretilen Çıktılar
    ## 4. Alınan Kesin Kararlar
    ## 5. Yeni/Düzenlenen Dosyalar
    ## 6. Hatalar & Notlar
    ## 7. Oturum Sonu Durumu
    ## 8. Bir Sonraki Oturum İçin Yol Haritası
    ## 9. Kısa Özet
    ## 10. Ekler

------------------------------------------------------------------------

# 5. UI / UX Tasarım İlkeleri

## 5.1 Mobil öncelikli yaklaşım

Mobil → Tablet → Web sırasını izler.

## 5.2 Çoklu dil desteği

-   Başlangıç: Türkçe + İngilizce\
-   Kolay genişletilebilir altyapı

## 5.3 Tutarlı tasarım

-   Tüm platformlarda ortak tasarım dili kullanılır.

------------------------------------------------------------------------

# 6. Teknoloji ve Entegrasyon Kuralları

## 6.1 Kimlik doğrulama

-   Supabase / Google Identity kullanılabilir.\
-   Tasarım sonradan kolay entegre edilecek şekilde yapılır.

## 6.2 Veritabanı

-   Geliştirme aşamasında mock DB veya Supabase kullanılabilir.\
-   Şema modüler ve genişletilebilir olmalıdır.

## 6.3 Platform bağımsızlık

Kodlar mümkün olduğunca bağımsız yazılır.

------------------------------------------------------------------------

# 7. Geliştirme, İyileştirme ve Sürümleme

## 7.1 Geliştirme

-   Modüller tamamlandıkça refaktoring yapılır.\
-   Kod tekrarı engellenir.

## 7.2 Modülerlik

Her yeni özellik bağımsız modül olarak eklenir.

## 7.3 Sürümleme

Her büyük değişiklik sürüme işlenir.

------------------------------------------------------------------------

# 8. Test Süreci

## 8.1 Test aşamaları

1.  Birim Test\
2.  Entegrasyon\
3.  UI Testi\
4.  Kullanıcı senaryosu

## 8.2 Test kayıtları

-   Sonuçlar `/Documentation/Testing` altında tutulur.

------------------------------------------------------------------------

# 9. Kullanıcı Talimatları ve Uyum

## 9.1 Kullanıcı dışı talimat uygulanmaz

LLM kendi kendine karar veremez.

## 9.2 Çakışma kontrolü

Talimat çelişkili ise kullanıcıdan onay alınır.

## 9.3 Oturumlar arası bağlam

Yeni sohbet bile olsa son oturumdan devam edilir.

------------------------------------------------------------------------

# 10. Dizin Hizmeti Tablosu

  ------------------------------------------------------------------------------------
  Ad              Konum                     Amaç               Açıklama
  --------------- ------------------------- ------------------ -----------------------
  Documentation   /Documentation            Belgeler           Tüm proje dokümanları

  Sessions        /Documentation/Sessions   Oturum kayıtları   Oturum dökümanları

  Testing         /Documentation/Testing    Test kayıtları     Test senaryoları ve
                                                               sonuçları

  Project         /Project                  Ana kod tabanı     Tüm modüller ve kaynak
                                                               dosyalar

  src             /Project/src              Kod modülleri      Uygulama iş mantığı

  assets          /Project/assets           Medya              Görseller, ikonlar,
                                                               sesler

  config          /Project/config           Ayarlar            JSON, ENV, yapılandırma

  \_temp          /Project/\_temp           Geçici alan        Taslak çalışmalar
  ------------------------------------------------------------------------------------

------------------------------------------------------------------------

# 11. Oturum Devamlılığı, Proje Başlangıcı ve Bağlam Mühendisliği

## 11.1 Oturum devamlılığı

Kullanıcı sadece:\
- "devam edelim"\
- "başlayalım"\
- "kaldığımız yerden devam"\
dese bile LLM **otomatik olarak son oturumu yükler.**

## 11.2 Yeni proje başlangıcı

1.  `/Documentation/ProjeBaslangic.md` **bir kez** derinlemesine
    incelenir.\
2.  LLM buna göre **tam kapsamlı araştırma** yapar.\
3.  **Ayrıntılı iş planı (roadmap)** oluşturulur.\
4.  Geliştirme aşamalar hâlinde başlatılır.

## 11.3 Bağlamın tekrar incelenmesini engelleme

-   ProjeBaslangic.md sadece başlangıçta okunur.\
-   Değişmişse kullanıcıya sorulur.

## 11.4 Otomatik kayıt mekanizması

Aşağıdaki olaylarda **manuel komut gerekmeden** kayıt yapılır: - Dosya
oluşturma\
- Modül başlatma/bitirme\
- Hata çözümü\
- Önemli kararlar\
- İş planının aşama geçişleri

## 11.5 Bağlam limit yönetimi

-   Büyük işlemlerde otomatik uyarı yapılır.\
-   Çıktılar parçalara bölünür.

## 11.6 Bağlam mühendisliği uyumu

-   Kalıcı proje hafızası\
-   Çakışma önleme\
-   Kapsül bağlam yönetimi\
-   Otomatik dizin güncelleme\
-   Minimum komutla maksimum işlem

------------------------------------------------------------------------

# 12. Son Hükümler

-   Tüm bilgiler gizlidir.\
-   Belge modülerdir; v1.2, v1.3 şeklinde güncellenebilir.\
-   Tüm projelerde bu belge zorunlu çekirdek talimat setidir.
