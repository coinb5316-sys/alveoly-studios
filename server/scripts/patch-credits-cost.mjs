// scripts/patch-credits-cost.mjs
import fs from 'fs';
import path from 'path';

const COST = {
  image: 1, 'image-edit': 1, 'background-removal': 1, colorize: 1,
  'face-swap': 1, headshot: 1, upscale: 1, gif: 1,
  audio: 1, 'voice-clone': 1,
  video: 5, 'image-to-video': 5, 'video-to-video': 5, 'talking-photo': 5,
  'lip-sync': 5, subtitle: 5, translate: 5, animation: 5,
};

const files = [
  'audioController.js',
  'backgroundRemovalController.js',
  'colorizeController.js',
  'faceSwapController.js',
  'headshotController.js',
  'imageController.js',
  'imageEditorController.js',
  'imageToVideoController.js',
  'lipSyncController.js',
  'talkingPhotoController.js',
  'upscaleController.js',
  'videoController.js',
  'videoToVideoController.js',
  'voiceCloneController.js',
  'toolController.js',
];

let touched = 0;
for (const file of files) {
  const p = path.join('controllers', file);
  if (!fs.existsSync(p)) {
    console.log(`skip: ${file} missing`);
    continue;
  }
  let src = fs.readFileSync(p, 'utf8');
  const original = src;

  src = src.replace(
    /Asset\.create\(\{([\s\S]*?)\}\)/g,
    (block, body) => {
      if (/creditsCost\s*:/.test(body)) return block;

      let kind = 'image';
      const kindMatch = body.match(/kind\s*:\s*['"]([^'"]+)['"]/);
      if (kindMatch) kind = kindMatch[1];
      else {
        const typeMatch = body.match(/type\s*:\s*['"]([^'"]+)['"]/);
        if (typeMatch) kind = typeMatch[1];
      }
      const cost = COST[kind] ?? 1;

      if (/cloudinaryUrl\s*:\s*[^,\n]+,/.test(body)) {
        body = body.replace(
          /(cloudinaryUrl\s*:\s*[^,\n]+,)/,
          `$1 creditsCost: ${cost},`
        );
      } else {
        body = body.replace(
          /(cloudinaryUrl\s*:\s*[^,\n}\s]+)/,
          `$1, creditsCost: ${cost}`
        );
      }
      return `Asset.create({${body}})`;
    }
  );

  if (src !== original) {
    fs.writeFileSync(p, src, 'utf8');
    const count = (src.match(/creditsCost:/g) || []).length;
    console.log(`OK ${file} — ${count} insert(s)`);
    touched++;
  } else {
    console.log(`-- ${file} — no changes`);
  }
}
console.log(`\nDone. Files modified: ${touched}/${files.length}`);