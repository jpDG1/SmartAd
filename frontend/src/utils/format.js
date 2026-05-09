export const formatPrice = (price) => {
  if (price === 0 || price === '0') return 'Za darmo';
  if (price === null || price === undefined) return '';
  const n = Number(price);
  if (Number.isNaN(n)) return String(price);
  return `${n.toLocaleString('pl-PL')} zł`;
};

export const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  const now = new Date();
  const diff = (now - date) / 1000;
  if (diff < 60) return 'przed chwilą';
  if (diff < 3600) return `${Math.floor(diff / 60)} min temu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} godz. temu`;
  if (diff < 7 * 86400) return `${Math.floor(diff / 86400)} dni temu`;
  return date.toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatTime = (value) => {
  if (!value) return '';
  const d = new Date(value);
  return d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
};
