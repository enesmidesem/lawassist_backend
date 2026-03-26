//HTTP katmanı. Service'i çağırır, response döner.

const adminService = require('./admin.service');

// ENDPOINT 3: Admin Giriş Yap
const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await adminService.loginAdmin(email, password);

    res.status(200).json({
      message: 'Admin girişi başarılı',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ENDPOINT 4: Tüm Avukatları Listele
const getAllLawyers = async (req, res, next) => {
  try {
    const result = await adminService.getAllLawyers(req.query);

    res.status(200).json({
      message: 'Avukat listesi başarıyla getirildi',
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

// ENDPOINT 5: Avukat Hesabını Görüntüle
const getLawyerById = async (req, res, next) => {
  try {
    const { lawyerId } = req.params;
    const lawyer = await adminService.getLawyerById(lawyerId);

    res.status(200).json({
      message: 'Avukat detayları başarıyla getirildi',
      data: lawyer,
    });
  } catch (error) {
    next(error);
  }
};

// ENDPOINT 6: Avukat Hesabını Güncelle
const updateLawyer = async (req, res, next) => {
  try {
    const { lawyerId } = req.params;
    const lawyer = await adminService.updateLawyer(lawyerId, req.body);

    res.status(200).json({
      message: 'Avukat bilgileri başarıyla güncellendi',
      data: lawyer,
    });
  } catch (error) {
    next(error);
  }
};

// ENDPOINT 7: Avukat Hesabını Sil
const deleteLawyer = async (req, res, next) => {
  try {
    const { lawyerId } = req.params;
    const result = await adminService.deleteLawyer(lawyerId);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// ENDPOINT 8: Avukat Hesabını Askıya Al
const suspendLawyer = async (req, res, next) => {
  try {
    const { lawyerId } = req.params;
    const { suspendUntil } = req.body;
    const lawyer = await adminService.suspendLawyer(lawyerId, suspendUntil);

    res.status(200).json({
      message: 'Avukat hesabı başarıyla askıya alındı',
      data: lawyer,
    });
  } catch (error) {
    next(error);
  }
};

// ENDPOINT 9: Tüm İlanları Listele
const getAllListings = async (req, res, next) => {
  try {
    const result = await adminService.getAllListings(req.query);

    res.status(200).json({
      message: 'Tüm ilanlar başarıyla listelendi',
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
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