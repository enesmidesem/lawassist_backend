//Admin modülünün tüm iş mantığı ve DB sorguları.

const pool = require('../../config/db');
const ApiError = require('../../utils/apiError');
const { comparePassword } = require('../../utils/hashPassword');
const { generateAccessToken } = require('../../utils/generateToken');

// =============================================
// ENDPOINT 3: Admin Giriş Yap
// POST /api/admin/login
// =============================================
const loginAdmin = async (email, password) => {
  const { rows } = await pool.query(
    'SELECT id, email, password_hash FROM admins WHERE LOWER(email) = LOWER($1)',
    [email]
  );

  if (rows.length === 0) {
    throw ApiError.unauthorized('Email veya şifre hatalı');
  }

  const admin = rows[0];

  const isMatch = await comparePassword(password, admin.password_hash);
  if (!isMatch) {
    throw ApiError.unauthorized('Email veya şifre hatalı');
  }

  // JWT üret — role: 'admin'
  const token = generateAccessToken({ id: admin.id, role: 'admin' });

  return {
    token,
    admin: {
      id: admin.id,
      email: admin.email,
    },
  };
};

// =============================================
// ENDPOINT 4: Tüm Avukatları Listele
// GET /api/admin/lawyers
// Query params: ?status=active|suspended|deleted|all  &page=1  &limit=20
// =============================================
const getAllLawyers = async (query) => {
  const { status, page = 1, limit = 20 } = query;
  const offset = (page - 1) * limit;

  let sql = `
    SELECT id, first_name, last_name, email, phone,
           bar_association, bar_number, status, suspended_until,
           created_at, updated_at
    FROM lawyers
  `;
  const params = [];
  let paramIndex = 1;

  if (status && status !== 'all') {
    sql += ` WHERE status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  sql += ` ORDER BY created_at DESC`;
  sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(parseInt(limit), parseInt(offset));

  const { rows } = await pool.query(sql, params);

  // Toplam sayı (pagination için)
  let countSql = 'SELECT COUNT(*) FROM lawyers';
  const countParams = [];
  if (status && status !== 'all') {
    countSql += ' WHERE status = $1';
    countParams.push(status);
  }
  const { rows: countRows } = await pool.query(countSql, countParams);
  const total = parseInt(countRows[0].count);

  return {
    data: rows,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

// =============================================
// ENDPOINT 5: Avukat Hesabını Görüntüle
// GET /api/admin/lawyers/:lawyerId
// =============================================
const getLawyerById = async (lawyerId) => {
  // Avukat bilgileri
  const { rows: lawyerRows } = await pool.query(
    `SELECT id, first_name, last_name, email, phone,
            bar_association, bar_number, status, suspended_until,
            created_at, updated_at
     FROM lawyers WHERE id = $1`,
    [lawyerId]
  );

  if (lawyerRows.length === 0) {
    throw ApiError.notFound('Avukat bulunamadı');
  }

  const lawyer = lawyerRows[0];

  // Uzmanlık alanları (specializations + lawyer_specializations join)
  const { rows: specRows } = await pool.query(
    `SELECT s.id, s.name
     FROM specializations s
     JOIN lawyer_specializations ls ON ls.specialization_id = s.id
     WHERE ls.lawyer_id = $1`,
    [lawyerId]
  );

  // Avukatın ilanları
  const { rows: listingRows } = await pool.query(
    `SELECT id, title, description, city, courthouse, hearing_date,
            status, accepted_application_id, created_at, updated_at
     FROM listings WHERE owner_id = $1
     ORDER BY created_at DESC`,
    [lawyerId]
  );

  // Avukatın başvuruları
  const { rows: applicationRows } = await pool.query(
    `SELECT a.id, a.listing_id, a.note, a.status, a.created_at, a.updated_at,
            l.title AS listing_title, l.city AS listing_city,
            l.courthouse AS listing_courthouse, l.hearing_date AS listing_hearing_date
     FROM applications a
     JOIN listings l ON l.id = a.listing_id
     WHERE a.applicant_id = $1
     ORDER BY a.created_at DESC`,
    [lawyerId]
  );

  return {
    ...lawyer,
    specializations: specRows,
    listings: listingRows,
    applications: applicationRows,
  };
};

// =============================================
// ENDPOINT 6: Avukat Hesabını Güncelle
// PUT /api/admin/lawyers/:lawyerId
// =============================================
const updateLawyer = async (lawyerId, updateData) => {
  const { firstName, lastName, email, phone } = updateData;

  // Avukat var mı?
  const { rows: existing } = await pool.query(
    'SELECT id FROM lawyers WHERE id = $1',
    [lawyerId]
  );

  if (existing.length === 0) {
    throw ApiError.notFound('Avukat bulunamadı');
  }

  // Email benzersizlik kontrolü
  if (email) {
    const { rows: emailCheck } = await pool.query(
      'SELECT id FROM lawyers WHERE LOWER(email) = LOWER($1) AND id != $2',
      [email, lawyerId]
    );
    if (emailCheck.length > 0) {
      throw ApiError.conflict('Bu email adresi zaten kullanılıyor');
    }
  }

  // Dinamik UPDATE SQL'i oluştur
  const fields = [];
  const values = [];
  let paramIndex = 1;

  if (firstName) {
    fields.push(`first_name = $${paramIndex++}`);
    values.push(firstName);
  }
  if (lastName) {
    fields.push(`last_name = $${paramIndex++}`);
    values.push(lastName);
  }
  if (email) {
    fields.push(`email = $${paramIndex++}`);
    values.push(email);
  }
  if (phone) {
    fields.push(`phone = $${paramIndex++}`);
    values.push(phone);
  }

  values.push(lawyerId);
  const sql = `
    UPDATE lawyers SET ${fields.join(', ')}, updated_at = NOW()
    WHERE id = $${paramIndex}
    RETURNING id, first_name, last_name, email, phone,
              bar_association, bar_number, status, suspended_until,
              created_at, updated_at
  `;

  const { rows } = await pool.query(sql, values);
  return rows[0];
};

// =============================================
// ENDPOINT 7: Avukat Hesabını Sil (Soft Delete)
// DELETE /api/admin/lawyers/:lawyerId
// status → 'deleted' yapılır, fiziksel silme YOK
// =============================================
const deleteLawyer = async (lawyerId) => {
  const { rows: existing } = await pool.query(
    'SELECT id, status FROM lawyers WHERE id = $1',
    [lawyerId]
  );

  if (existing.length === 0) {
    throw ApiError.notFound('Avukat bulunamadı');
  }

  if (existing[0].status === 'deleted') {
    throw ApiError.badRequest('Bu hesap zaten silinmiş');
  }

  await pool.query(
    "UPDATE lawyers SET status = 'deleted', updated_at = NOW() WHERE id = $1",
    [lawyerId]
  );

  return { message: 'Avukat hesabı başarıyla silindi' };
};

// =============================================
// ENDPOINT 8: Avukat Hesabını Askıya Al
// PATCH /api/admin/lawyers/:lawyerId/suspend
// =============================================
const suspendLawyer = async (lawyerId, suspendUntil) => {
  const { rows: existing } = await pool.query(
    'SELECT id, status FROM lawyers WHERE id = $1',
    [lawyerId]
  );

  if (existing.length === 0) {
    throw ApiError.notFound('Avukat bulunamadı');
  }

  if (existing[0].status === 'deleted') {
    throw ApiError.badRequest('Silinmiş bir hesap askıya alınamaz');
  }

  const { rows } = await pool.query(
    `UPDATE lawyers SET status = 'suspended', suspended_until = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, first_name, last_name, email, phone,
               bar_association, bar_number, status, suspended_until,
               created_at, updated_at`,
    [suspendUntil, lawyerId]
  );

  return rows[0];
};

// =============================================
// ENDPOINT 9: Konumdan Bağımsız Tüm İlanları Listele
// GET /api/admin/listings
// Query params: ?status=active|passive|cancelled|all  &page=1  &limit=20
// =============================================
const getAllListings = async (query) => {
  const { status, page = 1, limit = 20 } = query;
  const offset = (page - 1) * limit;

  let sql = `
    SELECT l.id, l.title, l.description, l.city, l.courthouse, l.hearing_date,
           l.status, l.accepted_application_id, l.created_at, l.updated_at,
           l.owner_id,
           lw.first_name AS owner_first_name,
           lw.last_name AS owner_last_name,
           lw.email AS owner_email
    FROM listings l
    JOIN lawyers lw ON lw.id = l.owner_id
  `;
  const params = [];
  let paramIndex = 1;

  if (status && status !== 'all') {
    sql += ` WHERE l.status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  sql += ` ORDER BY l.created_at DESC`;
  sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(parseInt(limit), parseInt(offset));

  const { rows } = await pool.query(sql, params);

  // Toplam sayı
  let countSql = 'SELECT COUNT(*) FROM listings';
  const countParams = [];
  if (status && status !== 'all') {
    countSql += ' WHERE status = $1';
    countParams.push(status);
  }
  const { rows: countRows } = await pool.query(countSql, countParams);
  const total = parseInt(countRows[0].count);

  return {
    data: rows,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

module.exports = {
  loginAdmin,
  getAllLawyers,
  getLawyerById,
  updateLawyer,
  deleteLawyer,
  suspendLawyer,
  getAllListings,
};