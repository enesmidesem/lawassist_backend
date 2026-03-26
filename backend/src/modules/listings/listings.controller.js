// HTTP request/response işlemleri. Service'i çağırır, sonucu döner.

const listingsService = require('./listings.service');

// ENDPOINT 1: İlan Oluştur
const createListing = async (req, res, next) => {
  try {
    const lawyerId = req.user.id;
    const { title, description, city, courthouse, hearing_date } = req.body;

    const listing = await listingsService.createListing(lawyerId, {
      title,
      description,
      city,
      courthouse,
      hearing_date,
    });

    res.status(201).json({
      message: 'İlan başarıyla oluşturuldu',
      data: listing,
    });
  } catch (error) {
    next(error);
  }
};

// ENDPOINT 2-3-4: İlanları Filtrele (city / date / courthouse)
const getListings = async (req, res, next) => {
  try {
    const { city, date, courthouse } = req.query;

    const listings = await listingsService.getListings({ city, date, courthouse });

    res.status(200).json({
      message: 'İlanlar başarıyla getirildi',
      data: listings,
    });
  } catch (error) {
    next(error);
  }
};

// ENDPOINT 5: İlan Güncelle
const updateListing = async (req, res, next) => {
  try {
    const { listingId } = req.params;
    const lawyerId = req.user.id;

    const listing = await listingsService.updateListing(listingId, lawyerId, req.body);

    res.status(200).json({
      message: 'İlan başarıyla güncellendi',
      data: listing,
    });
  } catch (error) {
    next(error);
  }
};

// ENDPOINT 6: İlan Sil / Yayından Kaldır
const deleteListing = async (req, res, next) => {
  try {
    const { listingId } = req.params;
    const lawyerId = req.user.id;

    const listing = await listingsService.deleteListing(listingId, lawyerId);

    res.status(200).json({
      message: 'İlan başarıyla yayından kaldırıldı',
      data: listing,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createListing,
  getListings,
  updateListing,
  deleteListing,
};