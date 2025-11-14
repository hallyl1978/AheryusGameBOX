# AheryusGameBOX – GitHub Yükleme Adımları

Bu doküman, yerel olarak hazırlanmış projeyi GitHub üzerindeki
`https://github.com/hallyl1978/AheryusGameBOX.git` deposuna göndermek için izlenecek adımları özetler.

> Not: Bu adımların bazıları GitHub kimlik doğrulaması gerektirir. Bu kimlik
> bilgileri (PAT, SSH anahtarı vb.) yalnızca sizin tarafınızda kullanılmalı,
> hiçbir şekilde dokümana veya koda gömülmemelidir.

## 1. Ön Koşullar
- Bu klasörde (`D:\YapayZeka\gameBOX`) git reposu zaten başlatılmış ve ilk commit yapılmıştır.
- Git kullanıcı bilgilerinizi (global veya local) tanımlamış olmanız önerilir:

```bash
git config --global user.name "Ad Soyad"
git config --global user.email "mail@ornek.com"
```

## 2. Uzak Depoyu (Remote) Tanımlama

GitHub’da hedef repo URL’si:
- `https://github.com/hallyl1978/AheryusGameBOX.git`

Bu klasörde aşağıdaki komutu çalıştırın:

```bash
git remote add origin https://github.com/hallyl1978/AheryusGameBOX.git
```

Zaten `origin` tanımlıysa ve değiştirmek istiyorsanız:

```bash
git remote set-url origin https://github.com/hallyl1978/AheryusGameBOX.git
```

Kontrol için:

```bash
git remote -v
```

## 3. Ana Branch İsmini Ayarlama (İsteğe Bağlı)

Git bazı ortamlarda varsayılan branch adını `master` olarak oluşturur. GitHub tarafında `main` kullanmak istiyorsanız:

```bash
git branch -M main
```

## 4. İlk Push İşlemi

Tüm dokümanlar ve klasör yapısı ilk commit olarak eklenmiş durumda.
Uzak depoya göndermek için:

```bash
git push -u origin main
```

veya branch adınız `master` ise:

```bash
git push -u origin master
```

Bu aşamada GitHub sizden kullanıcı adı / parola veya kişisel erişim token’ı
isteyebilir. Gerekli bilgileri yalnızca siz girmelisiniz.

## 5. Sonraki Çalışmalar İçin Önerilen Akış

1. Yeni bir özellik veya düzeltme için branch açın:

```bash
git checkout -b feature/ilk-oyun-modulu
```

2. Değişikliklerinizi yaptıktan sonra:

```bash
git add .
git commit -m "Ilk oyun modulu icin temel iskelet"
git push -u origin feature/ilk-oyun-modulu
```

3. GitHub üzerinde pull request açarak kod inceleme / merge sürecini yönetin.

Bu adımlarla proje, hazırlanan iş planı ve roadmap dokümanlarıyla birlikte GitHub’daki depo ile uyumlu hale gelir ve geliştirme aşamasına hazır olur.

