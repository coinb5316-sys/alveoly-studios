import express from 'express';
import { protect } from '../middleware/auth.js';
import { requireCredits } from '../middleware/creditCheck.js';
import { generateImageHandler, checkImage } from '../controllers/imageController.js';
import { startVideo, checkVideo } from '../controllers/videoController.js';
import { startImageToVideo, checkImageToVideo } from '../controllers/imageToVideoController.js';
import { startVideoToVideo, checkVideoToVideo } from '../controllers/videoToVideoController.js';
import { startAudio, checkAudio } from '../controllers/audioController.js';
import { checkVoiceClone, startVoiceClone } from '../controllers/voiceCloneController.js';
import { checkBackgroundRemoval, startBackgroundRemoval } from '../controllers/backgroundRemovalController.js';
import { checkTalkingPhoto, continueTalkingPhoto, startTalkingPhoto } from '../controllers/talkingPhotoController.js';
import { checkUpscale, startUpscale } from '../controllers/upscaleController.js';
import { checkLipSync, startLipSync } from '../controllers/lipSyncController.js';
import { checkHeadshot, startHeadshot } from '../controllers/headshotController.js';
import { checkColorize, startColorize } from '../controllers/colorizeController.js';
import { checkFaceSwap, startFaceSwap } from '../controllers/faceSwapController.js';
import { checkImageEdit, startImageEdit } from '../controllers/imageEditorController.js';
import {
  startSubtitle, checkSubtitle,
  startTranslator, checkTranslator,
  startGif, checkGif,
  startAnimation, checkAnimation,
} from '../controllers/toolController.js';

const router = express.Router();

// ── Image ──
router.post('/image', protect, requireCredits('cost_image'), generateImageHandler);
router.get('/image/:projectId', protect, checkImage);

// ── Video (text → video) ──
router.post('/video', protect, requireCredits('cost_video'), startVideo);
router.get('/video/:projectId', protect, checkVideo);

// ── Image → Video ──
router.post('/image-to-video', protect, requireCredits('cost_image_to_video'), startImageToVideo);
router.get('/image-to-video/:projectId', protect, checkImageToVideo);

// ── Video → Video ──
router.post('/video-to-video', protect, requireCredits('cost_video_to_video'), startVideoToVideo);
router.get('/video-to-video/:projectId', protect, checkVideoToVideo);

// ── Audio ──
router.post('/audio', protect, requireCredits('cost_audio'), startAudio);
router.get('/audio/:projectId', protect, checkAudio);

// ── Voice Cloning ──
router.post('/voice-clone', protect, requireCredits('cost_voice_clone'), startVoiceClone);
router.get('/voice-clone/:projectId', protect, checkVoiceClone);

// ── Background Removal ──
router.post('/background-removal', protect, requireCredits('cost_background_removal'), startBackgroundRemoval);
router.get('/background-removal/:projectId', protect, checkBackgroundRemoval);

// ── AI Talking Photo ──
router.post('/talking-photo', protect, requireCredits('cost_talking_photo'), startTalkingPhoto);
router.post('/talking-photo/continue', protect, requireCredits('cost_talking_photo'), continueTalkingPhoto);
router.get('/talking-photo/:projectId', protect, checkTalkingPhoto);

// ── AI Image Upscaler ──
router.post('/upscale', protect, requireCredits('cost_upscale'), startUpscale);
router.get('/upscale/:projectId', protect, checkUpscale);

// ── Lip Sync ──
router.post('/lip-sync', protect, requireCredits('cost_lip_sync'), startLipSync);
router.get('/lip-sync/:projectId', protect, checkLipSync);

// ── AI Headshot Generator ──
router.post('/headshot', protect, requireCredits('cost_headshot'), startHeadshot);
router.get('/headshot/:projectId', protect, checkHeadshot);

// ── Photo Colorizer ──
router.post('/colorize', protect, requireCredits('cost_colorize'), startColorize);
router.get('/colorize/:projectId', protect, checkColorize);

// ── Face Swap Photo ──
router.post('/face-swap', protect, requireCredits('cost_face_swap'), startFaceSwap);
router.get('/face-swap/:projectId', protect, checkFaceSwap);

// ── AI Image Editor ──
router.post('/image-edit', protect, requireCredits('cost_image_edit'), startImageEdit);
router.get('/image-edit/:projectId', protect, checkImageEdit);

// ── Auto Subtitle Generator ──
router.post('/subtitle', protect, requireCredits('cost_subtitle'), startSubtitle);
router.get('/subtitle/:projectId', protect, checkSubtitle);

// ── AI Video Translator ──
router.post('/translate', protect, requireCredits('cost_translate'), startTranslator);
router.get('/translate/:projectId', protect, checkTranslator);

// ── AI GIF Generator ──
router.post('/gif', protect, requireCredits('cost_gif'), startGif);
router.get('/gif/:projectId', protect, checkGif);

// ── Animation ──
router.post('/animation', protect, requireCredits('cost_animation'), startAnimation);
router.get('/animation/:projectId', protect, checkAnimation);

export default router;