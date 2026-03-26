// HTTP request/response işlemleri. Service'i çağırır, sonucu döner.

const applicationsService = require('./applications.service');

// ENDPOINT 1: Başvuruyu Onayla
const approveApplication = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const lawyerId = req.user.id;

    const application = await applicationsService.approveApplication(applicationId, lawyerId);

    res.status(200).json({
      message: 'Başvuru başarıyla onaylandı',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// ENDPOINT 2: Başvuruyu Reddet
const rejectApplication = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const lawyerId = req.user.id;

    const application = await applicationsService.rejectApplication(applicationId, lawyerId);

    res.status(200).json({
      message: 'Başvuru başarıyla reddedildi',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// ENDPOINT 3: Kendi İlanına Yapılan Başvuruları Listele
const getApplicationsByListing = async (req, res, next) => {
  try {
    const { listingId } = req.params;
    const lawyerId = req.user.id;

    const applications = await applicationsService.getApplicationsByListing(listingId, lawyerId);

    res.status(200).json({
      message: 'Başvurular başarıyla getirildi',
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

// ENDPOINT 4: Tevkil İlanına Başvur
const createApplication = async (req, res, next) => {
  try {
    const { listingId } = req.params;
    const lawyerId = req.user.id;
    const { note } = req.body;

    const application = await applicationsService.createApplication(listingId, lawyerId, note);

    res.status(201).json({
      message: 'Başvuru başarıyla oluşturuldu',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// ENDPOINT 5: Yapılan Başvuruyu İptal Et
const cancelApplication = async (req, res, next) => {
  try {
    const { listingId, applicationId } = req.params;
    const lawyerId = req.user.id;

    const application = await applicationsService.cancelApplication(listingId, applicationId, lawyerId);

    res.status(200).json({
      message: 'Başvuru başarıyla iptal edildi',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  approveApplication,
  rejectApplication,
  getApplicationsByListing,
  createApplication,
  cancelApplication,
};