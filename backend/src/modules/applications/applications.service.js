// Başvuru iş mantığı. DB sorguları burada.

const pool = require('../../config/db');
const ApiError = require('../../utils/apiError');

// =============================================
// ENDPOINT 1: Tevkil Başvurusunu Onayla
// PATCH /api/applications/:applicationId/approve
// =============================================
const approveApplication = async (applicationId, lawyerId) => {
  // 1) Başvuruyu ve ilişkili ilanı getir
  const { rows: appRows } = await pool.query(
    `SELECT a.id, a.listing_id, a.applicant_id, a.status,
            l.owner_id, l.status AS listing_status
     FROM applications a
     JOIN listings l ON l.id = a.listing_id
     WHERE a.id = $1`,
    [applicationId]
  );

  if (appRows.length === 0) {
    throw ApiError.notFound('Başvuru bulunamadı');
  }

  const application = appRows[0];

  // 2) İlan sahibi mi kontrol et
  if (application.owner_id !== lawyerId) {
    throw ApiError.forbidden('Bu işlem için yalnızca ilan sahibi yetkilidir');
  }

  // 3) Sadece pending başvurular onaylanabilir
  if (application.status !== 'pending') {
    throw ApiError.badRequest('Yalnızca beklemede olan başvurular onaylanabilir');
  }

  // 4) İlan aktif mi kontrol et
  if (application.listing_status !== 'active') {
    throw ApiError.badRequest('Bu ilan artık aktif değil');
  }

  // 5) Transaction başlat — 3 işlem atomik olmalı
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 5a) Başvuruyu onayla
    const { rows: updatedApp } = await client.query(
      `UPDATE applications SET status = 'approved', updated_at = NOW()
       WHERE id = $1
       RETURNING id, listing_id, applicant_id, note, status, created_at, updated_at`,
      [applicationId]
    );

    // 5b) İlanı kapat + accepted_application_id güncelle
    await client.query(
      `UPDATE listings SET status = 'cancelled', accepted_application_id = $1, updated_at = NOW()
       WHERE id = $2`,
      [applicationId, application.listing_id]
    );

    // 5c) Aynı ilandaki diğer bekleyen başvuruları reddet
    await client.query(
      `UPDATE applications SET status = 'rejected', updated_at = NOW()
       WHERE listing_id = $1 AND id != $2 AND status = 'pending'`,
      [application.listing_id, applicationId]
    );

    await client.query('COMMIT');
    return updatedApp[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// =============================================
// ENDPOINT 2: Tevkil Başvurusunu Reddet
// PATCH /api/applications/:applicationId/reject
// =============================================
const rejectApplication = async (applicationId, lawyerId) => {
  // 1) Başvuruyu ve ilişkili ilanı getir
  const { rows: appRows } = await pool.query(
    `SELECT a.id, a.listing_id, a.applicant_id, a.status,
            l.owner_id
     FROM applications a
     JOIN listings l ON l.id = a.listing_id
     WHERE a.id = $1`,
    [applicationId]
  );

  if (appRows.length === 0) {
    throw ApiError.notFound('Başvuru bulunamadı');
  }

  const application = appRows[0];

  // 2) İlan sahibi mi kontrol et
  if (application.owner_id !== lawyerId) {
    throw ApiError.forbidden('Bu işlem için yalnızca ilan sahibi yetkilidir');
  }

  // 3) Sadece pending başvurular reddedilebilir
  if (application.status !== 'pending') {
    throw ApiError.badRequest('Yalnızca beklemede olan başvurular reddedilebilir');
  }

  // 4) Başvuruyu reddet
  const { rows: updatedApp } = await pool.query(
    `UPDATE applications SET status = 'rejected', updated_at = NOW()
     WHERE id = $1
     RETURNING id, listing_id, applicant_id, note, status, created_at, updated_at`,
    [applicationId]
  );

  return updatedApp[0];
};

// =============================================
// ENDPOINT 3: Kendi İlanına Yapılan Başvuruları Listele
// GET /api/listings/:listingId/applications
// =============================================
const getApplicationsByListing = async (listingId, lawyerId) => {
  // 1) İlanı getir ve sahipliği kontrol et
  const { rows: listingRows } = await pool.query(
    `SELECT id, owner_id FROM listings WHERE id = $1`,
    [listingId]
  );

  if (listingRows.length === 0) {
    throw ApiError.notFound('İlan bulunamadı');
  }

  if (listingRows[0].owner_id !== lawyerId) {
    throw ApiError.forbidden('Bu işlem için yalnızca ilan sahibi yetkilidir');
  }

  // 2) İlana yapılan tüm başvuruları başvuran bilgileriyle getir
  const { rows } = await pool.query(
    `SELECT
       a.id,
       a.listing_id,
       a.note,
       a.status,
       a.created_at,
       a.updated_at,
       json_build_object(
         'id',              lw.id,
         'first_name',      lw.first_name,
         'last_name',       lw.last_name,
         'email',           lw.email,
         'phone',           lw.phone,
         'bar_association', lw.bar_association,
         'bar_number',      lw.bar_number
       ) AS applicant
     FROM applications a
     JOIN lawyers lw ON lw.id = a.applicant_id
     WHERE a.listing_id = $1
     ORDER BY a.created_at DESC`,
    [listingId]
  );

  return rows;
};

// =============================================
// ENDPOINT 4: Tevkil İlanına Başvur
// POST /api/listings/:listingId/applications
// =============================================
const createApplication = async (listingId, lawyerId, note) => {
  // 1) İlanı getir
  const { rows: listingRows } = await pool.query(
    `SELECT id, owner_id, status FROM listings WHERE id = $1`,
    [listingId]
  );

  if (listingRows.length === 0) {
    throw ApiError.notFound('İlan bulunamadı');
  }

  const listing = listingRows[0];

  // 2) Kendi ilanına başvurulamaz
  if (listing.owner_id === lawyerId) {
    throw ApiError.badRequest('Kendi ilanınıza başvuramazsınız');
  }

  // 3) Sadece aktif ilanlara başvurulabilir
  if (listing.status !== 'active') {
    throw ApiError.badRequest('Bu ilan artık aktif değil');
  }

  // 4) Aynı ilana daha önce başvurulmuş mu? (UNIQUE constraint yansıması)
  const { rows: existingRows } = await pool.query(
    `SELECT id FROM applications WHERE listing_id = $1 AND applicant_id = $2`,
    [listingId, lawyerId]
  );

  if (existingRows.length > 0) {
    throw ApiError.badRequest('Bu ilana zaten başvurdunuz');
  }

  // 5) Başvuruyu oluştur
  const { rows } = await pool.query(
    `INSERT INTO applications (listing_id, applicant_id, note)
     VALUES ($1, $2, $3)
     RETURNING id, listing_id, applicant_id, note, status, created_at, updated_at`,
    [listingId, lawyerId, note || null]
  );

  return rows[0];
};

// =============================================
// ENDPOINT 5: Yapılan Başvuruyu İptal Et
// DELETE /api/listings/:listingId/applications/:applicationId
// =============================================
const cancelApplication = async (listingId, applicationId, lawyerId) => {
  // 1) Başvuruyu getir
  const { rows: appRows } = await pool.query(
    `SELECT a.id, a.listing_id, a.applicant_id, a.status
     FROM applications a
     WHERE a.id = $1 AND a.listing_id = $2`,
    [applicationId, listingId]
  );

  if (appRows.length === 0) {
    throw ApiError.notFound('Başvuru bulunamadı');
  }

  const application = appRows[0];

  // 2) Yalnızca kendi başvurusunu iptal edebilir
  if (application.applicant_id !== lawyerId) {
    throw ApiError.forbidden('Yalnızca kendi başvurunuzu iptal edebilirsiniz');
  }

  // 3) Sadece pending başvurular iptal edilebilir
  if (application.status !== 'pending') {
    throw ApiError.badRequest('Yalnızca beklemede olan başvurular iptal edilebilir');
  }

  // 4) Başvuruyu iptal et
  const { rows: updatedApp } = await pool.query(
    `UPDATE applications SET status = 'cancelled', updated_at = NOW()
     WHERE id = $1
     RETURNING id, listing_id, applicant_id, note, status, created_at, updated_at`,
    [applicationId]
  );

  return updatedApp[0];
};

module.exports = {
  approveApplication,
  rejectApplication,
  getApplicationsByListing,
  createApplication,
  cancelApplication,
};