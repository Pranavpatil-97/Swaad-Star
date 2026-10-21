import QRCode from 'qrcode';

const OPTIONS = {
  errorCorrectionLevel: 'M',
  margin: 2, // quiet zone, in modules
  color: { dark: '#000000', light: '#FFFFFF' },
};

function checkUrl(url) {
  if (typeof url !== 'string' || !url.trim()) throw new TypeError('qr: url must be a non-empty string');
  const text = url.trim();
  let parsed;
  try {
    parsed = new URL(text);
  } catch {
    throw new Error('qr: invalid URL');
  }
  const isHttps = parsed.protocol === 'https:';
  const isLocalDev =
    parsed.protocol === 'http:' &&
    parsed.hostname === 'localhost' &&
    process.env.NODE_ENV !== 'production';
  if (!isHttps && !isLocalDev) {
    throw new Error('qr: only https:// URLs are allowed (http://localhost in development)');
  }
  return text;
}

export async function qrPng(url, { size = 512 } = {}) {
  const text = checkUrl(url);
  if (!Number.isInteger(size) || size < 128 || size > 2048) {
    throw new RangeError('qr: size must be an integer from 128 to 2048');
  }
  return QRCode.toBuffer(text, { ...OPTIONS, type: 'png', width: size });
}

export async function qrSvg(url) {
  const text = checkUrl(url);
  return QRCode.toString(text, { ...OPTIONS, type: 'svg' });
}