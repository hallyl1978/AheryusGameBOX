# AheryusGameBOX

Bu depo, AheryusGameBOX çok platformlu oyun platformu için proje iskeletini ve dokümantasyonunu içerir.

## Yapı
- `Documentation/`
  - `ProjeBaslangic.md`: Mimari ve domain için ana referans doküman.
  - `anatalimat.md`: Kök dizinde, tüm projelerde geçerli kanonik talimat seti.
  - `Roadmap.md`: Faz bazlı teknik yol haritası (MVP odaklı).
  - `WorkPlan_Detayli.md`: Ayrıntılı iş planı, roller ve kabul kriterleri.
  - `Sessions/`: Oturum kayıt dosyaları.
  - `Testing/`: Test kayıtları ve senaryoları için ayrılmış klasör.
- `Project/`
  - `src/`: Uygulama kodları için ana klasör.
  - `assets/`: Görseller, sesler ve diğer medya.
  - `config/`: Yapılandırma ve şema dosyaları.
  - `_temp/`: Geçici çalışmalar.

## Başlangıç
1. `Documentation/ProjeBaslangic.md`, `Documentation/Roadmap.md` ve `Documentation/Tech_Decisions.md` dokümanlarını okuyun.
2. `Documentation/WorkPlan_Detayli.md` içindeki Faz 0–1 görevlerini baz alarak süre planını yapın.
3. Supabase projenizi oluşturup örnek ortam dosyasını (`Project/config/env/.env.example`) kullanarak kendi `.env.local` dosyanızı üretin.
4. Backend (NestJS + Node.js 20) ve frontend (Flutter 3.24+) projelerini `Project/src/backend` ve `Project/src/frontend` altında başlatın.
5. Veritabanı taslaklarını `Project/config/schema/initial_schema.sql` dosyası üzerinden izleyin, Supabase’e uygarlayın.

## Git ve GitHub
Bu proje Git ile versiyonlanmak ve GitHub’daki repo ile eşleştirilmek üzere hazırlanmıştır. Ayrıntılı adımlar için `Documentation/GitHub_Adimlar.md` dokümanına bakın.

## Konfigürasyon
- `Project/config/env/.env.example`: Supabase ve backend değişkenleri için şablon.
- `Project/config/schema/initial_schema.sql`: Başlangıç veri tabanı şeması.
- Tüm gerçek anahtarlar `.env.local` gibi .gitignore’da olan dosyalarda tutulmalıdır.
