import { ConversionEngine } from './modules/engine.js';
import { presets, buildArgs, validateFile, describeOutput } from './modules/presets.js';
import { detectMedia, imageFormats, describeImage, LARGE_VIDEO_BYTES } from './modules/media.js';
import { ImageEngine } from './modules/image-engine.js';
const $ = (id) => document.getElementById(id);
let engine = new ConversionEngine();
let mediaKind = 'video';
let file = null, sourceURL = null, resultURL = null, busy = false, run = 0;
const status = (text) => { $('status-text').textContent = text; };
const size = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;
const options = () => Object.fromEntries(['format', 'resolution', 'quality', 'fps', 'duration'].map(id => [id, $(id).value]));
function clearResult() { if (resultURL) URL.revokeObjectURL(resultURL); resultURL = null; $('result').hidden = true; $('download').removeAttribute('href'); $('output-preview').replaceChildren(); }
function setBusy(value) {
  busy = value;
  ['format', 'resolution', 'quality', 'fps', 'duration', 'file', 'dropzone', 'remove'].forEach(id => $(id).disabled = value);
  $('resolution').disabled = value || $('format').value === 'mp3';
  $('quality').disabled = value || (mediaKind === 'image' && $('format').value === 'png');
  ['fps','duration'].forEach(id => $(id).disabled = value || $('format').value !== 'gif');
  $('convert').disabled = value || !file;
  $('cancel').hidden = !value;
  $('engine-status').textContent = value ? '처리 중' : '대기 중';
}
function selectionMessage(message, error = false) {
  $('selection-message').textContent = message;
  $('selection-message').dataset.error = String(error);
}
function resetSelection() {
  file = null; $('file').value = ''; clearResult();
  if (sourceURL) URL.revokeObjectURL(sourceURL); sourceURL = null;
  $('source-video').removeAttribute('src'); $('source-video').load();
  $('source-image').removeAttribute('src'); $('source-preview').hidden = true;
  $('file-title').textContent = '이미지나 영상을 여기에 드롭하세요';
  $('file-meta').textContent = '또는 클릭하여 파일 선택';
  $('progress').hidden = true; setBusy(false);
}
function selectFile(next) {
  if (busy) return;
  let nextKind;
  try { nextKind = detectMedia(next); if (nextKind === 'video') validateFile(next); } catch (error) { resetSelection(); const message = `${next.name} (${size(next.size)}) — ${error.message}`; selectionMessage(message, true); status(message); return; }
  clearResult();
  if (sourceURL) URL.revokeObjectURL(sourceURL);
  file = next;
  mediaKind = nextKind;
  const formats = mediaKind === 'image' ? imageFormats : presets;
  $('format').replaceChildren(...Object.entries(formats).map(([value, preset]) => new Option(preset.label, value)));
  updateOptions();
  $('file-title').textContent = file.name;
  $('file-meta').textContent = `${mediaKind === 'image' ? '이미지' : '영상'} · ${size(file.size)} · 클릭하여 파일 변경`;
  selectionMessage(`선택 완료: ${file.name} · ${size(file.size)}. 아래에서 변환 실행을 눌러 주세요.`);
  setBusy(false);
  sourceURL = URL.createObjectURL(file);
  $('source-video').removeAttribute('src'); $('source-video').load();
  $('source-image').removeAttribute('src');
  const isAVI = /\.avi$/i.test(file.name) || /(?:avi|msvideo)/i.test(file.type);
  const skipPreview = isAVI || (mediaKind === 'video' && file.size > LARGE_VIDEO_BYTES);
  $('source-video').hidden = mediaKind === 'image' || skipPreview;
  $('source-image').hidden = mediaKind !== 'image';
  if (!skipPreview) $(mediaKind === 'image' ? 'source-image' : 'source-video').src = sourceURL;
  else selectionMessage(`선택 완료: ${file.name} · ${size(file.size)}. 원본 미리보기 없이 변환할 수 있습니다. 아래에서 변환 실행을 눌러 주세요.`);
  if (mediaKind === 'video' && file.size > LARGE_VIDEO_BYTES) selectionMessage(`선택 완료: ${file.name} · ${size(file.size)}. 큰 영상은 PC 사용을 권장합니다. 모바일에서는 메모리 부족으로 실패하거나 탭이 종료될 수 있습니다. 원본 미리보기는 생략합니다.`);
  $('source-preview').hidden = false;
  $('progress').hidden = true;
  $('logs').textContent = '';
  status('파일 준비 완료. 출력 설정을 확인하고 변환을 실행하세요.');
  setBusy(false);
}
$('file').addEventListener('change', e => { if (e.target.files[0]) selectFile(e.target.files[0]); else selectionMessage('파일을 받지 못했습니다. 기기에 저장한 파일을 다시 선택해 주세요.', true); });
$('file').addEventListener('click', () => { $('file').value = ''; });
$('file').addEventListener('cancel', () => { if (!file) selectionMessage('파일 선택이 취소되었습니다. 클라우드 파일은 기기에 내려받은 뒤 다시 선택해 주세요.'); });
for (const type of ['dragenter', 'dragover']) $('dropzone').addEventListener(type, e => { e.preventDefault(); if (!busy) $('dropzone').classList.add('dragging'); });
for (const type of ['dragleave', 'drop']) $('dropzone').addEventListener(type, e => { e.preventDefault(); $('dropzone').classList.remove('dragging'); });
$('dropzone').addEventListener('drop', e => { if (e.dataTransfer.files.length > 1) { status('한 번에 한 파일씩 선택해 주세요.'); return; } if(e.dataTransfer.files[0]) selectFile(e.dataTransfer.files[0]); });
window.addEventListener('dragover', e => e.preventDefault());
window.addEventListener('drop', e => e.preventDefault());
$('remove').addEventListener('click', () => {
  resetSelection(); selectionMessage('파일을 제거했습니다. 새 파일을 선택해 주세요.');
  status('변환할 이미지나 영상을 선택하세요.');
});
function updateOptions() {
  const value = options();
  $('gif-options').hidden = value.format !== 'gif';
  ['fps','duration'].forEach(id => $(id).disabled = value.format !== 'gif');
  $('resolution').disabled = value.format === 'mp3';
  $('quality').disabled = mediaKind === 'image' && value.format === 'png';
  $('engine-hint').textContent = mediaKind === 'image' ? '브라우저에서 이미지 처리 · 별도 엔진 다운로드 없음' : '첫 영상 변환 시 약 31MB의 엔진을 불러옵니다.';
  $('engine-label').textContent = mediaKind === 'image' ? '변환: 브라우저 이미지 처리' : '변환: FFmpeg';
  $('toggle-log').hidden = mediaKind === 'image';
  if (mediaKind === 'image') { $('logs').hidden = true; $('toggle-log').setAttribute('aria-expanded', 'false'); $('toggle-log').textContent = '로그 보기 +'; }
  $('setting-hint').textContent = mediaKind === 'image' ? (value.format === 'jpg' ? '투명 영역은 흰색으로 저장합니다. 이미지 메타데이터는 유지하지 않습니다.' : value.format === 'png' ? '투명도를 유지하고 무손실로 저장합니다. 품질 옵션은 적용되지 않습니다.' : '투명도를 유지합니다. 브라우저가 WebP 저장을 지원해야 합니다.') : { mp4: 'MP4 영상 품질을 조절합니다. 오디오는 AAC 128kbps로 고정됩니다.', gif: '영상 시작부터 최대 30초. 시작점 지정은 지원하지 않으며 소리는 제외됩니다.', mp3: '원본 영상에 오디오 트랙이 있어야 합니다. 해상도는 적용되지 않습니다.' }[value.format];
  $('output-summary').textContent = mediaKind === 'image' ? describeImage(value) : describeOutput(value);
  clearResult();
}
['format','resolution','quality','fps','duration'].forEach(id => $(id).addEventListener('change', updateOptions));
$('toggle-log').addEventListener('click', () => { const expanded = $('logs').hidden; $('logs').hidden = !expanded; $('toggle-log').setAttribute('aria-expanded', String(expanded)); $('toggle-log').textContent = expanded ? '로그 접기 −' : '로그 보기 +'; });
$('cancel').addEventListener('click', () => { run++; engine.cancel(); setBusy(false); $('progress').hidden = true; status('변환을 중지했습니다. 다시 실행할 수 있습니다.'); });
$('convert-form').addEventListener('submit', async e => {
  e.preventDefault(); if (!file || busy) return;
  const current = ++run;
  const taskEngine = mediaKind === 'image' ? new ImageEngine() : new ConversionEngine();
  engine = taskEngine;
  const selected = options();
  const input = `input.${file.name.split('.').at(-1).toLowerCase()}`;
  let args;
  try { if (mediaKind === 'video') args = buildArgs(input, selected); } catch (error) { status(error.message); return; }
  clearResult(); setBusy(true); $('logs').textContent = ''; $('progress').hidden = false; $('progress').removeAttribute('value');
  status(mediaKind === 'image' ? '이미지를 변환하는 중…' : '변환 엔진을 불러오는 중… 첫 실행에는 시간이 걸릴 수 있습니다.');
  try {
    let data, dimensions;
    if (mediaKind === 'image') {
      const output = await taskEngine.convert(file, selected);
      data = output.blob; dimensions = `${output.width} × ${output.height}px`;
    } else {
    data = await taskEngine.convert(file, args, message => {
      if (current !== run) return;
      $('logs').textContent = ($('logs').textContent + message + '\n').slice(-18000);
      $('logs').scrollTop = $('logs').scrollHeight;
    }, progress => {
      if (current !== run) return;
      const percent = Math.min(99, Math.max(0, Math.round(progress * 100)));
      $('progress').value = percent; status(`변환 중… ${percent}% · 탭을 열어 두세요.`);
    }, (part,total) => { if(current === run) status(`변환 엔진 준비 중… ${part}/${total} 파일 로드 완료`); });
    }
    if (current !== run) return;
    resultURL = URL.createObjectURL(mediaKind === 'image' ? data : new Blob([data], { type: presets[selected.format].mime }));
    $('download').href = resultURL; $('download').download = `${file.name.replace(/\.[^.]+$/, '')}-converted.${selected.format}`;
    $('result-meta').textContent = `${size(file.size)} → ${size(data.size ?? data.length)} · ${selected.format.toUpperCase()}${dimensions ? ` · ${dimensions}` : ''}`;
    const preview = document.createElement(mediaKind === 'image' || selected.format === 'gif' ? 'img' : selected.format === 'mp3' ? 'audio' : 'video');
    preview.src = resultURL; if (preview.tagName === 'IMG') preview.alt = '변환된 이미지 미리보기'; else preview.controls = true;
    $('output-preview').replaceChildren(preview); $('result').hidden = false; $('progress').value = 100;
    status('변환 완료. 파일을 다운로드하세요.');
  } catch (error) {
    if (current === run) { status(`오류: ${error.message || '메모리가 부족하거나 파일을 읽을 수 없습니다. 더 작은 파일로 다시 시도해 주세요.'}`); $('progress').hidden = true; }
  } finally { if (current === run) setBusy(false); }
});
window.addEventListener('pagehide', () => { run++; engine.cancel(); if(sourceURL) URL.revokeObjectURL(sourceURL); clearResult(); });

updateOptions();
