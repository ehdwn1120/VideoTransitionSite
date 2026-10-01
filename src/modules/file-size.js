import { t } from './i18n.js';
export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = bytes === 0 ? 0 : Math.min(3, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${index === 0 ? bytes : Number((bytes / 1024 ** index).toFixed(2))} ${units[index]}`;
}
export function sizeChange(input, output) {
  if (input <= 0 || output === input) return t('용량 동일');
  const percent = Math.abs((output - input) / input * 100).toFixed(1);
  return output < input ? t('{percent}% 감소', {percent}) : t('{percent}% 증가', {percent});
}
