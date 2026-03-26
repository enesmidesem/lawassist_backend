1. **Tevkil İlanı Oluştur**
   - **API Metodu:** `POST /listings`
   - **Açıklama:** Kullanıcıların yeni bir tevkil ilanı oluşturmasını sağlar. İlan başlığı, açıklama, şehir, adliye ve tarih gibi bilgilerin girilmesini içerir. Güvenlik için giriş yapmış olmak gerekir ve yalnızca yetkili kullanıcılar ilan oluşturabilir.

2. **İlanları Şehre Göre Filtrele**
   - **API Metodu:** `GET /listings?city={city}`
   - **Açıklama:** Mevcut tevkil ilanlarının belirtilen şehre göre filtrelenerek listelenmesini sağlar. Kullanıcılar yalnızca ilgili şehirdeki ilanları görüntüleyebilir. Herkese açık bir endpoint olup giriş yapılmadan da erişilebilir.

3. **İlanları Tarihe Göre Filtrele**
   - **API Metodu:** `GET /listings?date={date}`
   - **Açıklama:** Mevcut tevkil ilanlarının belirtilen tarihe göre filtrelenerek listelenmesini sağlar. Kullanıcılar belirli bir tarihteki ilanları görüntüleyebilir. Herkese açık bir endpoint olup giriş yapılmadan da erişilebilir.

4. **İlanları Adliyeye Göre Filtrele**
   - **API Metodu:** `GET /listings?courthouse={courthouse}`
   - **Açıklama:** Mevcut tevkil ilanlarının belirtilen adliyeye göre filtrelenerek listelenmesini sağlar. Kullanıcılar yalnızca ilgili adliyedeki ilanları görüntüleyebilir. Herkese açık bir endpoint olup giriş yapılmadan da erişilebilir.

5. **Tevkil İlanını Güncelle**
   - **API Metodu:** `PUT /listings/{listingId}`
   - **Açıklama:** Kullanıcının daha önce oluşturduğu tevkil ilanını güncellemesini sağlar. İlan başlığı, açıklama, şehir, adliye ve tarih gibi bilgiler değiştirilebilir. Güvenlik için giriş yapmış olmak gerekir ve kullanıcılar yalnızca kendi ilanlarını güncelleyebilir.

6. **Tevkil İlanını Yayından Kaldır / Sil**
   - **API Metodu:** `DELETE /listings/{listingId}`
   - **Açıklama:** Kullanıcının daha önce oluşturduğu tevkil ilanını yayından kaldırmasını veya kalıcı olarak silmesini sağlar. İlan silindiğinde ilgili tüm başvurular da iptal edilir. Güvenlik için giriş yapmış olmak gerekir ve kullanıcılar yalnızca kendi ilanlarını silebilir.

7. **Kişinin Kendi İlanına Yapılan Başvuruları Listele**
   - **API Metodu:** `GET /listings/{listingId}/applications`
   - **Açıklama:** İlan sahibinin kendi ilanına yapılan tüm başvuruları görüntülemesini sağlar. Başvuran kullanıcı bilgileri, başvuru tarihi ve başvuru durumu gibi bilgiler listelenir. Güvenlik için giriş yapmış olmak gerekir ve yalnızca ilan sahibi kendi ilanına gelen başvuruları görebilir.

8. **Tevkil İlanına Başvur**
   - **API Metodu:** `POST /listings/{listingId}/applications`
   - **Açıklama:** Kullanıcıların mevcut bir tevkil ilanına başvurmasını sağlar. Başvuru sırasında kullanıcı bilgileri ve varsa ek notlar iletilebilir. Güvenlik için giriş yapmış olmak gerekir ve kullanıcılar kendi ilanlarına başvuramaz.

9. **Yapılan Başvuruyu İptal Et**
   - **API Metodu:** `DELETE /listings/{listingId}/applications/{applicationId}`
   - **Açıklama:** Kullanıcının daha önce yaptığı bir başvuruyu iptal etmesini sağlar. Başvuru iptal edildiğinde ilan sahibi bilgilendirilir. Güvenlik için giriş yapmış olmak gerekir ve kullanıcılar yalnızca kendi başvurularını iptal edebilir.