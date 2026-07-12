export const companyQuery = (req, extra = {}) => ({
  company: req.companyId,
  ...extra,
});
