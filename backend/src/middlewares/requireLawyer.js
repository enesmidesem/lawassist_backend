const ApiError = require('../utils/apiError');

const requireLawyer = (req, res, next) => {
  if (req.user && req.user.role === 'lawyer') {
    return next();
  }
  return next(new ApiError(403, 'Bu işlem yalnızca avukat yetkisiyle erişilebilir.'));
};

module.exports = requireLawyer;