const pool = require('../../config/db');
const ApiError = require('../../utils/apiError');

/**
 * Avukat profil bilgilerini getirir
 * @param {string} lawyerId  - URL'den gelen avukat ID'si
 * @param {object} reqUser   - authenticate middleware'inden gelen { id, role }
 */
const getLawyerById = async (lawyerId, reqUser) => {
  // Yetki kontrolü: avukat yalnızca kendi profilini görebilir
  if (reqUser.role === 'lawyer' && reqUser.id !== lawyerId) {
    throw new ApiError(403, 'Yalnızca kendi profilinizi görüntüleyebilirsiniz.');
  }

  const result = await pool.query(
    `SELECT
       l.id,
       l.first_name,
       l.last_name,
       l.email,
       l.phone,
       l.bar_association,
       l.bar_number,
       l.status,
       l.created_at,
       l.updated_at
     FROM lawyers l
     WHERE l.id = $1 AND l.status != 'deleted'`,
    [lawyerId]
  );

  const lawyer = result.rows[0];

  if (!lawyer) {
    throw new ApiError(404, 'Avukat bulunamadı.');
  }

  return lawyer;
};

/**
 * Avukat profil bilgilerini günceller
 * @param {string} lawyerId
 * @param {object} reqUser - { id, role }
 * @param {object} data - güncellenecek alanlar
 */
const updateLawyerById = async (lawyerId, reqUser, data) => {
  // Yetki kontrolü: avukat yalnızca kendi profilini güncelleyebilir
  if (reqUser.role === 'lawyer' && reqUser.id !== lawyerId) {
    throw new ApiError(403, 'Yalnızca kendi profilinizi güncelleyebilirsiniz.');
  }

  // Avukat var mı?
  const existing = await pool.query(
    `SELECT id FROM lawyers WHERE id = $1 AND status != 'deleted'`,
    [lawyerId]
  );
  if (!existing.rows[0]) {
    throw new ApiError(404, 'Avukat bulunamadı.');
  }

  // Email değiştiriliyorsa başkası kullanıyor mu?
  if (data.email) {
    const emailCheck = await pool.query(
      `SELECT id FROM lawyers WHERE email = $1 AND id != $2 AND status != 'deleted'`,
      [data.email.toLowerCase(), lawyerId]
    );
    if (emailCheck.rows[0]) {
      throw new ApiError(409, 'Bu email adresi zaten kullanılmaktadır.');
    }
  }

  // Dinamik SET bloğu oluştur — sadece gönderilen alanları güncelle
  const fields = [];
  const values = [];
  let i = 1;

  if (data.first_name)    { fields.push(`first_name = $${i++}`);    values.push(data.first_name.trim()); }
  if (data.last_name)     { fields.push(`last_name = $${i++}`);     values.push(data.last_name.trim()); }
  if (data.email)         { fields.push(`email = $${i++}`);         values.push(data.email.toLowerCase()); }
  if (data.phone)         { fields.push(`phone = $${i++}`);         values.push(data.phone); }
  if (data.bar_association) { fields.push(`bar_association = $${i++}`); values.push(data.bar_association); }
  if (data.bar_number)    { fields.push(`bar_number = $${i++}`);    values.push(data.bar_number); }

  fields.push(`updated_at = NOW()`);
  values.push(lawyerId);

  const result = await pool.query(
    `UPDATE lawyers SET ${fields.join(', ')}
     WHERE id = $${i}
     RETURNING id, first_name, last_name, email, phone, bar_association, bar_number, status, created_at, updated_at`,
    values
  );

  return result.rows[0];
};

/**
 * Avukatın kendi ilanlarını listeler
 * @param {string} lawyerId
 * @param {object} reqUser - { id, role }
 * @param {string} status - opsiyonel filtre: 'active' | 'closed' | 'cancelled'
 */
const getLawyerListings = async (lawyerId, reqUser, status) => {
  // Yetki kontrolü
  if (reqUser.role === 'lawyer' && reqUser.id !== lawyerId) {
    throw new ApiError(403, 'Yalnızca kendi ilanlarınızı görüntüleyebilirsiniz.');
  }

  // Avukat var mı?
  const lawyerCheck = await pool.query(
    `SELECT id FROM lawyers WHERE id = $1 AND status != 'deleted'`,
    [lawyerId]
  );
  if (!lawyerCheck.rows[0]) {
    throw new ApiError(404, 'Avukat bulunamadı.');
  }

  // Geçerli status değerleri
  const validStatuses = ['active', 'passive', 'cancelled'];
  if (status && !validStatuses.includes(status)) {
    throw new ApiError(400, `Geçersiz status. Geçerli değerler: ${validStatuses.join(', ')}`);
  }

  // Sorgu — status filtresi opsiyonel
  const values = [lawyerId];
  let statusClause = '';
  if (status) {
    statusClause = `AND status = $2`;
    values.push(status);
  }

  const result = await pool.query(
    `SELECT
       id,
       title,
       description,
       city,
       courthouse,
       hearing_date,
       status,
       created_at,
       updated_at
     FROM listings
     WHERE owner_id = $1 ${statusClause}
     ORDER BY created_at DESC`,
    values
  );

  return result.rows;
};

/**
 * Avukat hesabını soft delete yapar (status → deleted)
 * @param {string} lawyerId
 * @param {object} reqUser - { id, role }
 */
const deleteLawyer = async (lawyerId, reqUser) => {
  // Yetki kontrolü: avukat yalnızca kendi hesabını silebilir
  if (reqUser.role === 'lawyer' && reqUser.id !== lawyerId) {
    throw new ApiError(403, 'Yalnızca kendi hesabınızı silebilirsiniz.');
  }

  // Avukat var mı?
  const existing = await pool.query(
    `SELECT id FROM lawyers WHERE id = $1 AND status != 'deleted'`,
    [lawyerId]
  );
  if (!existing.rows[0]) {
    throw new ApiError(404, 'Avukat bulunamadı.');
  }

  // Soft delete
  await pool.query(
    `UPDATE lawyers SET status = 'deleted', updated_at = NOW() WHERE id = $1`,
    [lawyerId]
  );
};

module.exports = { getLawyerById, updateLawyerById, getLawyerListings, deleteLawyer };