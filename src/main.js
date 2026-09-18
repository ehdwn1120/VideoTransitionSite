import { ConversionEngine } from './modules/engine.js';
import { presets, buildArgs, validateFile } from './modules/presets.js';
const $ = (id) => document.getElementById(id);
let engine = new ConversionEngine();
let file = null, sourceURL = null, resultURL = null, busy = false, run = 0;
const status = (text) => { $('status-text').textContent = text; };
const size = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;
const options = () => Object.fromEntries(['format', 'resolution', 'quality', 'fps', 'duration'].map(id => [id, $(id).value]));
function clearResult() { if (resultURL) URL.revokeObjectURL(resultURL); resultURL = null; $('result').hidden = true; $('download').removeAttribute('href'); $('output-preview').replaceChildren(); }
function setBusy(value) {
  busy = value;
  ['format', 'resolution', 'quality', 'fps', 'duration', 'file', 'dropzone', 'remove'].forEach(id => $(id).disabled = value);
  $('resolution').disabled = value || $('format').value === 'mp3';
  ['fps','duration'].forEach(id => $(id).disabled = value || $('format').value !== 'gif');
  $('convert').disabled = value || !file;
  $('cancel').hidden = !value;
  $('engine-status').textContent = value ? 'ENGINE RUNNING' : 'ENGINE STANDBY';
}
function selectFile(next) {
  if (busy) return;
  try { validateFile(next); } catch (error) { status(error.message); $('file').value = ''; return; }
  clearResult();
  if (sourceURL) URL.revokeObjectURL(sourceURL);
  file = next;
  $('file-title').textContent = file.name;
  $('file-meta').textContent = `${size(file.size)} · 클릭하여 파일 변경`;
  sourceURL = URL.createObjectURL(file);
  $('source-video').src = sourceURL;
  $('source-preview').hidden = false;
  $('progress').hidden = true;
  $('logs').textContent = '';
  status('파일 준비 완료. 출력 설정을 확인하고 변환을 실행하세요.');
  setBusy(false);
}
$('file').addEventListener('change', e => { if (e.target.files[0]) selectFile(e.target.files[0]); });
$('dropzone').addEventListener('click', () => { $('file').value = ''; $('file').click(); });
for (const type of ['dragenter', 'dragover']) $('dropzone').addEventListener(type, e => { e.preventDefault(); if (!busy) $('dropzone').classList.add('dragging'); });
for (const type of ['dragleave', 'drop']) $('dropzone').addEventListener(type, e => { e.preventDefault(); $('dropzone').classList.remove('dragging'); });
$('dropzone').addEventListener('drop', e => { if (e.dataTransfer.files.length > 1) { status('한 번에 한 파일씩 선택해 주세요.'); return; } if(e.dataTransfer.files[0]) selectFile(e.dataTransfer.files[0]); });
window.addEventListener('dragover', e => e.preventDefault());
window.addEventListener('drop', e => e.preventDefault());
$('remove').addEventListener('click', () => {
  file = null; $('file').value = ''; clearResult();
  URL.revokeObjectURL(sourceURL); sourceURL = null;
  $('source-video').removeAttribute('src'); $('source-video').load(); $('source-preview').hidden = true;
  $('file-title').textContent = '영상을 여기에 드롭하세요'; $('file-meta').textContent = '또는 클릭하여 파일 선택';
  $('progress').hidden = true; status('ready. 변환할 영상을 선택하세요.'); setBusy(false);
});
function updateOptions() {
  const value = options();
  $('gif-options').hidden = value.format !== 'gif';
  ['fps','duration'].forEach(id => $(id).disabled = value.format !== 'gif');
  $('resolution').disabled = value.format === 'mp3';
  $('setting-hint').textContent = { mp4: '호환성이 좋은 H.264 + AAC 형식으로 변환합니다.', gif: '영상 시작부터 최대 30초. GIF에는 소리가 포함되지 않습니다.', mp3: '원본 영상에 오디오 트랙이 있어야 합니다. 해상도는 적용되지 않습니다.' }[value.format];
  $('command').textContent = `convert --to ${value.format} --quality ${value.quality}${value.format !== 'mp3' && value.resolution !== 'original' ? ` --height ${value.resolution}` : ''}`;
  clearResult();
}
['format','resolution','quality','fps','duration'].forEach(id => $(id).addEventListener('change', updateOptions));
$('toggle-log').addEventListener('click', () => { const expanded = $('logs').hidden; $('logs').hidden = !expanded; $('toggle-log').setAttribute('aria-expanded', String(expanded)); $('toggle-log').textContent = expanded ? '로그 접기 −' : '로그 보기 +'; });
$('cancel').addEventListener('click', () => { run++; engine.cancel(); setBusy(false); $('progress').hidden = true; status('변환을 중지했습니다. 다시 실행할 수 있습니다.'); });
$('convert-form').addEventListener('submit', async e => {
  e.preventDefault(); if (!file || busy) return;
  const current = ++run;
  const taskEngine = new ConversionEngine();
  engine = taskEngine;
  const selected = options();
  const input = `input.${file.name.split('.').at(-1).toLowerCase()}`;
  let args;
  try { args = buildArgs(input, selected); } catch (error) { status(error.message); return; }
  clearResult(); setBusy(true); $('logs').textContent = ''; $('progress').hidden = false; $('progress').removeAttribute('value');
  status('변환 엔진을 불러오는 중… 첫 실행에는 시간이 걸릴 수 있습니다.');
  try {
    const data = await taskEngine.convert(file, args, message => {
      if (current !== run) return;
      $('logs').textContent = ($('logs').textContent + message + '\n').slice(-18000);
      $('logs').scrollTop = $('logs').scrollHeight;
    }, progress => {
      if (current !== run) return;
      const percent = Math.min(99, Math.max(0, Math.round(progress * 100)));
      $('progress').value = percent; status(`변환 중… ${percent}% · 탭을 열어 두세요. (진행률은 추정치)`);
    }, (part,total) => { if(current === run) status(`변환 엔진 준비 중… ${part}/${total} 파일 로드 완료`); });
    if (current !== run) return;
    resultURL = URL.createObjectURL(new Blob([data], { type: presets[selected.format].mime }));
    $('download').href = resultURL; $('download').download = `${file.name.replace(/\.[^.]+$/, '')}-converted.${selected.format}`;
    $('result-meta').textContent = `${size(file.size)} → ${size(data.length)} · ${selected.format.toUpperCase()}`;
    const preview = document.createElement(selected.format === 'gif' ? 'img' : selected.format === 'mp3' ? 'audio' : 'video');
    preview.src = resultURL; if (selected.format === 'gif') preview.alt = '변환된 GIF 미리보기'; else preview.controls = true;
    $('output-preview').replaceChildren(preview); $('result').hidden = false; $('progress').value = 100;
    status('done. 변환 완료! 파일을 다운로드하세요.');
  } catch (error) {
    if (current === run) { status(`오류: ${error.message || '메모리가 부족하거나 파일을 읽을 수 없습니다. 더 작은 파일로 다시 시도해 주세요.'}`); $('progress').hidden = true; }
  } finally { if (current === run) setBusy(false); }
});
window.addEventListener('pagehide', () => { run++; engine.cancel(); if(sourceURL) URL.revokeObjectURL(sourceURL); clearResult(); });

updateOptions();
