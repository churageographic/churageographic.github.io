export const isCacheValid = (cacheKey: string): boolean => {
  const expireDateStr = localStorage.getItem(`${cacheKey}-expire`);
  if (!expireDateStr) return false;
  
  const expireDate = new Date(expireDateStr);
  const now = new Date();
  return now <= expireDate;
};

export const clearExpiredCache = (): void => {
  const now = new Date();
  
  // キャッシュのキーを取得
  const cacheKeys = Object.keys(localStorage)
    .filter(key => key.endsWith('-expire'))
    .map(key => key.replace('-expire', ''));
  
  // 有効期限切れのキャッシュを削除
  cacheKeys.forEach(key => {
    const expireDateStr = localStorage.getItem(`${key}-expire`);
    if (expireDateStr) {
      const expireDate = new Date(expireDateStr);
      if (now > expireDate) {
        localStorage.removeItem(key);
        localStorage.removeItem(`${key}-expire`);
      }
    }
  });
};
