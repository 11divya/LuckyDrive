function bannerShape(doc) {
  return {
    id: doc._id.toString(),
    headline: doc.headline,
    message: doc.message || '',
    vehicleName: doc.vehicleName || '',
    announcementDate: doc.announcementDate,
    active: Boolean(doc.active),
    sortOrder: doc.sortOrder ?? 0,
  };
}

function activeBanners(settings) {
  return (settings.announcementBanners || [])
    .filter((b) => b.active)
    .sort((a, b) => {
      const order = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
      if (order !== 0) return order;
      return new Date(a.announcementDate) - new Date(b.announcementDate);
    })
    .map(bannerShape);
}

function allBanners(settings) {
  return [...(settings.announcementBanners || [])]
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map(bannerShape);
}

function normalizeBannerInput(raw, index) {
  return {
    headline: (raw.headline || '').trim(),
    message: (raw.message || '').trim(),
    vehicleName: (raw.vehicleName || '').trim(),
    announcementDate: new Date(raw.announcementDate),
    active: raw.active !== false,
    sortOrder: Number.isFinite(raw.sortOrder) ? raw.sortOrder : index,
  };
}

module.exports = {
  bannerShape,
  activeBanners,
  allBanners,
  normalizeBannerInput,
};
