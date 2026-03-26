// İlan iş mantığı. DB sorguları burada.

const pool = require('../../config/db');
const ApiError = require('../../utils/apiError');

// =============================================
// ENDPOINT 1: Tevkil İlanı Oluştur
// POST /api/listings
// =============================================
const createListing = async (lawyerId, { title, description, city, courthouse, hearing_date }) => {
  const { rows } = await pool.query(
    `INSERT INTO listings (owner_id, title, description, city, courthouse, hearing_date)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, owner_id, title, description, city, courthouse, hearing_date, status, created_at, updated_at`,
    [lawyerId, title, description || null, city, courthouse, hearing_date]
  );

  return rows[0];
};

// =============================================
// ENDPOINT 2-3-4: İlanları Filtrele (Şehir / Tarih / Adliye)
// GET /api/listings?city=...&date=...&courthouse=...
// Filtreler birlikte de kullanılabilir (AND mantığı)
// =============================================
const getListings = async ({ city, date, courthouse }) => {
  const conditions = [`l.status = 'active'`];
  const params = [];

  if (city) {
    params.push(city);
    conditions.push(`LOWER(l.city) = LOWER($${params.length})`);
  }

  if (date) {
    params.push(date);
    conditions.push(`l.hearing_date = $${params.length}`);
  }

  if (courthouse) {
    params.push(courthouse);
    conditions.push(`LOWER(l.courthouse) = LOWER($${params.length})`);
  }

  const whereClause = conditions.join(' AND ');

  const { rows } = await pool.query(
    `SELECT
       l.id,
       l.title,
       l.description,
       l.city,
       l.courthouse,
       l.hearing_date,
       l.status,
       l.created_at,
       l.updated_at,
       json_build_object(
         'id',         lw.id,
         'first_name', lw.first_name,
         'last_name',  lw.last_name,
         'bar_association', lw.bar_association
       ) AS owner
     FROM listings l
     JOIN lawyers lw ON lw.id = l.owner_id
     WHERE ${whereClause}
     ORDER BY l.hearing_date ASC, l.created_at DESC`,
    params
  );

  return rows;
};

// =============================================
// ENDPOINT 5: Tevkil İlanını Güncelle
// PUT /api/listings/:listingId
// =============================================
const updateListing = async (listingId, lawyerId, fields) => {
  // 1) İlanı getir
  const { rows: listingRows } = await pool.query(
    `SELECT id, owner_id, status FROM listings WHERE id = $1`,
    [listingId]
  );

  if (listingRows.length === 0) {
    throw ApiError.notFound('İlan bulunamadı');
  }

  const listing = listingRows[0];

  // 2) Sahiplik kontrolü
  if (listing.owner_id !== lawyerId) {
    throw ApiError.forbidden('Bu işlem için yalnızca ilan sahibi yetkilidir');
  }

  // 3) Sadece aktif ilanlar güncellenebilir
  if (listing.status !== 'active') {
    throw ApiError.badRequest('Yalnızca aktif ilanlar güncellenebilir');
  }

  // 4) Dinamik SET bloğu — sadece gönderilen alanlar güncellenir
  const allowedFields = ['title', 'description', 'city', 'courthouse', 'hearing_date'];
  const setClauses = [];
  const params = [];

  for (const field of allowedFields) {
    if (fields[field] !== undefined) {
      params.push(fields[field]);
      setClauses.push(`${field} = $${params.length}`);
    }
  }

  // listingId en sona
  params.push(listingId);

  const { rows } = await pool.query(
    `UPDATE listings
     SET ${setClauses.join(', ')}, updated_at = NOW()
     WHERE id = $${params.length}
     RETURNING id, owner_id, title, description, city, courthouse, hearing_date, status, created_at, updated_at`,
    params
  );

  return rows[0];
};

// =============================================
// ENDPOINT 6: Tevkil İlanını Yayından Kaldır / Sil
// DELETE /api/listings/:listingId
// =============================================
const deleteListing = async (listingId, lawyerId) => {
  // 1) İlanı getir
  const { rows: listingRows } = await pool.query(
    `SELECT id, owner_id, status FROM listings WHERE id = $1`,
    [listingId]
  );

  if (listingRows.length === 0) {
    throw ApiError.notFound('İlan bulunamadı');
  }

  const listing = listingRows[0];

  // 2) Sahiplik kontrolü
  if (listing.owner_id !== lawyerId) {
    throw ApiError.forbidden('Bu işlem için yalnızca ilan sahibi yetkilidir');
  }

  // 3) Transaction — ilan silinince bekleyen başvurular da iptal edilir
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 3a) Pending başvuruları iptal et
    await client.query(
      `UPDATE applications
       SET status = 'cancelled', updated_at = NOW()
       WHERE listing_id = $1 AND status = 'pending'`,
      [listingId]
    );

    // 3b) İlanı pasif yap (soft delete — DB'den fiziksel silmiyoruz)
    const { rows } = await client.query(
      `UPDATE listings
       SET status = 'passive', updated_at = NOW()
       WHERE id = $1
       RETURNING id, owner_id, title, status, updated_at`,
      [listingId]
    );

    await client.query('COMMIT');
    return rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  createListing,
  getListings,
  updateListing,
  deleteListing,
};