1. **Kullanıcı Kayıt Ol**
   - **API Metodu:** `POST /auth/register`
   - **Açıklama:** Kullanıcıların yeni hesaplar oluşturarak sisteme kayıt olmasını sağlar. Ad, soyad, email ve şifre gibi kişisel bilgilerin toplanmasını ve hesap oluşturma işlemlerini içerir. Kullanıcılar email adresi ve şifre belirleyerek hesap oluşturur.

2. **Kullanıcı Giriş Yap**
   - **API Metodu:** `POST /auth/login`
   - **Açıklama:** Kayıtlı kullanıcıların sisteme giriş yapmasını sağlar. Email ve şifre bilgileriyle kimlik doğrulaması gerçekleştirilir. Başarılı girişin ardından kullanıcıya bir erişim token'ı (JWT) döndürülür ve bu token sonraki isteklerde kullanılır.

3. **Şifremi Unuttum – Şifre Sıfırlama Maili Gönder**
   - **API Metodu:** `POST /auth/forgot-password`
   - **Açıklama:** Şifresini unutan kullanıcıların şifre sıfırlama sürecini başlatmasını sağlar. Kullanıcı kayıtlı email adresini girer, sisteme bu adrese sıfırlama bağlantısı içeren bir mail gönderilir. Güvenlik amacıyla bağlantının geçerlilik süresi sınırlıdır.

4. **Yeni Şifre Belirleme**
   - **API Metodu:** `POST /auth/reset-password`
   - **Açıklama:** Şifre sıfırlama mailiyle gelen bağlantı aracılığıyla kullanıcının yeni şifresini belirlemesini sağlar. Geçerli bir sıfırlama token'ı ile birlikte yeni şifre gönderilir. Token doğrulandıktan sonra şifre güncellenir ve bağlantı geçersiz hale gelir.

5. **Avukat Profil Bilgilerini Görüntüle**
   - **API Metodu:** `GET /lawyers/{lawyerId}`
   - **Açıklama:** Avukata ait profil bilgilerinin görüntülenmesini sağlar. Ad, soyad, email, telefon, uzmanlık alanları ve baro bilgisi gibi kişisel ve mesleki bilgiler döndürülür. Avukatlar kendi profillerini görüntüleyebilir; yöneticiler ise diğer avukatların bilgilerini inceleyebilir. Bu işlem için giriş yapılmış olması gerekir.

6. **Avukat Profil Bilgilerini Güncelle**
   - **API Metodu:** `PUT /lawyers/{lawyerId}`
   - **Açıklama:** Avukatın profil bilgilerini güncellemesini sağlar. Ad, soyad, email, telefon ve uzmanlık alanı gibi kişisel ve mesleki bilgiler değiştirilebilir. Bu işlem için giriş yapılmış olması gerekir ve avukatlar yalnızca kendi profillerini güncelleyebilir.

7. **Avukat Hesabını Sil**
   - **API Metodu:** `DELETE /lawyers/{lawyerId}`
   - **Açıklama:** Avukatın hesabını sistemden kalıcı olarak silmesini sağlar. Hesabını kapatmak isteyen avukat ya da yetkili yönetici tarafından kullanılır. Bu işlem geri alınamaz; avukata ait tüm veriler ve ilanlar sistemden kaldırılır. İşlem için giriş yapılmış olması zorunludur.

8. **Avukatın Kendi Açtığı İlanları Listele**
   - **API Metodu:** `GET /lawyers/{lawyerId}/listings`
   - **Açıklama:** Giriş yapmış avukatın kendi oluşturduğu ilanların listelenmesini sağlar. Aktif, pasif veya tüm ilanlar sorgu parametresiyle filtrelenebilir. Yalnızca ilgili avukat kendi ilanlarını görüntüleyebilir. Bu işlem için giriş yapılmış olması gerekir.