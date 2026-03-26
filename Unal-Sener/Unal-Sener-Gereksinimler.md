1. **Tevkil Başvurusunu Onayla**
   - **API Metodu:** `PUT /applications/{applicationId}/approve`
   - **Açıklama:** İlanı veren kişinin, başvuran avukatlardan birini seçip kabul etmesini sağlar. İlan sahibi gelen tevkil başvurularını inceleyerek uygun gördüğü avukatı onaylar. Bu işlem için giriş yapmış ve ilgili ilanın sahibi olmak gerekir.

2. **Tevkil Başvurusunu Reddet**
   - **API Metodu:** `PUT /applications/{applicationId}/reject`
   - **Açıklama:** İlanı veren kişinin, uygun bulmadığı başvuruyu geri çevirmesini sağlar. İlan sahibi değerlendirdiği başvuruyu reddederek avukata bildirim gönderilmesini tetikler. Bu işlem için giriş yapmış ve ilgili ilanın sahibi olmak gerekir.

3. **Admin Giriş Yap**
   - **API Metodu:** `POST /admin/auth/login`
   - **Açıklama:** Sistem yöneticisinin özel yetkilerle panele giriş yapmasını sağlar. Admin kullanıcı adı ve şifresiyle kimlik doğrulaması yaparak yönetim paneline erişim kazanır. Standart kullanıcı girişinden farklı olarak yönetici ayrıcalıkları tanır.

4. **Tüm Avukatları Listele**
   - **API Metodu:** `GET /admin/lawyers`
   - **Açıklama:** Sistemdeki tüm kayıtlı avukatların admin panelinde listelenmesini sağlar. Admin, aktif, pasif veya askıya alınmış tüm avukat hesaplarını görebilir. Bu işlem yalnızca admin yetkisiyle erişilebilir.

5. **Avukat Hesabını Görüntüle**
   - **API Metodu:** `GET /admin/lawyers/{lawyerId}`
   - **Açıklama:** Adminin belirli bir avukatın tüm detaylarını ve geçmiş işlemlerini incelemesini sağlar. Avukatın kişisel bilgileri, ilanları, başvuruları ve hesap geçmişi görüntülenebilir. Bu işlem yalnızca admin yetkisiyle erişilebilir.

6. **Avukat Hesabını Güncelle**
   - **API Metodu:** `PUT /admin/lawyers/{lawyerId}`
   - **Açıklama:** Adminin gerekli durumlarda avukat bilgilerini güncellemesini sağlar. Hatalı veya eksik bilgilerin düzeltilmesi amacıyla admin tarafından avukat profilinde değişiklik yapılabilir. Bu işlem yalnızca admin yetkisiyle erişilebilir.

7. **Avukat Hesabını Sil**
   - **API Metodu:** `DELETE /admin/lawyers/{lawyerId}`
   - **Açıklama:** Sistemi kötüye kullanan avukatın hesabının admin tarafından tamamen silinmesini sağlar. Bu işlem geri alınamaz; avukata ait tüm veriler sistemden kalıcı olarak kaldırılır. Bu işlem yalnızca admin yetkisiyle erişilebilir.

8. **Avukat Hesabını Belli Bir Süreliğine Pasif Hale Getir**
   - **API Metodu:** `PUT /admin/lawyers/{lawyerId}/suspend`
   - **Açıklama:** Avukatın hesabının kalıcı silinmeden, geçici olarak durdurulmasını/askıya alınmasını sağlar. Admin belirli bir süre veya koşul belirterek hesabı devre dışı bırakabilir. Süre dolduğunda veya koşul kalktığında hesap yeniden aktif hale getirilebilir. Bu işlem yalnızca admin yetkisiyle erişilebilir.

9. **Konumdan Bağımsız Tüm İlanları Listele**
   - **API Metodu:** `GET /admin/listings`
   - **Açıklama:** Sistemdeki bütün ilanların durumlarının denetim amaçlı listelenmesini sağlar. Admin, konum filtresi olmaksızın tüm aktif, pasif veya beklemedeki ilanları görebilir. Bu işlem yalnızca admin yetkisiyle erişilebilir.