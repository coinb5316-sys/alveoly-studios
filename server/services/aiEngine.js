import { Client } from 'magic-hour';

const client = new Client({
  token: process.env.MAGIC_HOUR_API_KEY,
});

/* ─────────── Image ─────────── */
export async function createImageJob(prompt) {
  const response = await client.v1.aiImageGenerator.create({
    imageCount: 1,
    model: 'z-image-turbo',
    aspectRatio: '16:9',
    resolution: '640px',
    style: { prompt, tool: 'general' },
  });
  return response.id;
}

export async function checkImageJob(projectId) {
  const result = await client.v1.imageProjects.get({ id: projectId });
  if (result.status === 'complete') {
    return { status: 'complete', downloadUrl: result.downloads?.[0]?.url };
  }
  if (result.status === 'error' || result.status === 'canceled') {
    return { status: result.status, error: result.error?.message || 'Image generation failed' };
  }
  return { status: 'pending' };
}

/* ─────────── Video (text → video) ─────────── */
export async function createVideoJob(prompt) {
  const response = await client.v1.textToVideo.create({
    endSeconds: 5,
    aspectRatio: '16:9',
    model: 'ltx-2.5',
    resolution: '480p',
    style: { prompt },
  });
  return response.id;
}

export async function checkVideoJob(projectId) {
  const result = await client.v1.videoProjects.get({ id: projectId });
  if (result.status === 'complete') {
    return { status: 'complete', downloadUrl: result.downloads?.[0]?.url };
  }
  if (result.status === 'error' || result.status === 'canceled') {
    return { status: result.status, error: result.error?.message || 'Video generation failed' };
  }
  return { status: 'pending' };
}

/* ─────────── Image → Video ─────────── */
export async function createImageToVideoJob(imageUrl, prompt, opts = {}) {
  const response = await client.v1.imageToVideo.create({
    assets: { imageFilePath: imageUrl },
    endSeconds: opts.endSeconds ?? 5,
    model: opts.model ?? 'ltx-2.5',
    resolution: opts.resolution ?? '480p',
    style: { prompt },
  });
  return response.id;
}

/* ─────────── Video → Video ─────────── */
export async function createVideoToVideoJob(videoUrl, artStyle, prompt, opts = {}) {
  const response = await client.v1.videoToVideo.create({
    assets: {
      videoFilePath: videoUrl,
      videoSource: 'file', // <-- THIS is the missing required field
    },
    startSeconds: 0,
    endSeconds: opts.endSeconds ?? 5,
    fpsResolution: 'HALF',
    style: {
      artStyle: artStyle ?? '3D Render',
      prompt: prompt,
      promptType: 'custom',
      model: 'default',
    },
  });
  return response.id;
}

/* ─────────── Audio (Voiceover / TTS) ─────────── */
export async function createAudioJob(text, opts = {}) {
  const response = await client.v1.aiVoiceGenerator.create({
    style: {
      prompt: text,
      voiceName: opts.voice || 'Morgan Freeman', // Must be a valid enum [citation:2]
    },
  });
  return response.id;
}

export async function checkAudioJob(projectId) {
  const result = await client.v1.audioProjects.get({ id: projectId });

  if (result.status === 'complete') {
    return {
      status: 'complete',
      downloadUrl: result.downloads?.[0]?.url,
    };
  }

  if (result.status === 'error' || result.status === 'canceled') {
    return {
      status: result.status,
      error: result.error?.message || 'Audio generation failed',
    };
  }

  return { status: 'pending' };
}

/* ─────────── Voice Cloning ─────────── */
export async function createVoiceCloneJob(audioFilePath, text, opts = {}) {
  const response = await client.v1.aiVoiceCloner.create({
    assets: {
      audioFilePath: audioFilePath, // Magic Hour file path or stable public URL
    },
    style: {
      prompt: text,
    },
    name: opts.name || `Alveoly Clone ${Date.now()}`,
  });
  return response.id;
}

/* ─────────── Image Background Remover ─────────── */
export async function createBackgroundRemovalJob(imageUrl, opts = {}) {
  const response = await client.v1.imageBackgroundRemover.generate({
    assets: {
      imageFilePath: imageUrl,
    },
    name: opts.name || `Alveoly Cutout ${Date.now()}`,
  });
  return response.id;
}

export async function checkBackgroundRemovalJob(projectId) {
  const result = await client.v1.imageProjects.get({ id: projectId });

  if (result.status === 'complete') {
    return {
      status: 'complete',
      downloadUrl: result.downloads?.[0]?.url,
    };
  }

  if (result.status === 'error' || result.status === 'canceled') {
    return {
      status: result.status,
      error: result.error?.message || 'Background removal failed',
    };
  }

  return { status: 'pending' };
}

/* ─────────── AI Talking Photo ─────────── */
export async function createTalkingPhotoJob(imageUrl, audioUrl, opts = {}) {
  const response = await client.v1.aiTalkingPhoto.create({
    assets: {
      imageFilePath: imageUrl,
      audioFilePath: audioUrl,
    },
    startSeconds: opts.startSeconds ?? 0,
    endSeconds: opts.endSeconds ?? 15,
    style: {
      generationMode: opts.generationMode ?? 'realistic', // 'realistic' | 'prompted'
    },
    name: opts.name || `Alveoly Talking Photo ${Date.now()}`,
  });
  return response.id;
}

export async function checkTalkingPhotoJob(projectId) {
  const result = await client.v1.videoProjects.get({ id: projectId });

  if (result.status === 'complete') {
    return {
      status: 'complete',
      downloadUrl: result.downloads?.[0]?.url,
    };
  }

  if (result.status === 'error' || result.status === 'canceled') {
    return {
      status: result.status,
      error: result.error?.message || 'Talking photo generation failed',
    };
  }

  return { status: 'pending' };
}

/* ─────────── AI Image Upscaler ─────────── */
export async function createUpscaleJob(imageUrl, opts = {}) {
  const response = await client.v1.aiImageUpscaler.generate({
    assets: {
      imageFilePath: imageUrl,
    },
    scaleFactor: opts.scaleFactor ?? 2.0, // 2 or 4
    style: {
      mode: opts.mode ?? 'balanced', // 'preserve' | 'balanced' | 'creative'
      prompt: opts.prompt, // only used with 'creative'
    },
    name: opts.name || `Alveoly Upscale ${Date.now()}`,
  });
  return response.id;
}

export async function checkUpscaleJob(projectId) {
  const result = await client.v1.imageProjects.get({ id: projectId });

  if (result.status === 'complete') {
    return {
      status: 'complete',
      downloadUrl: result.downloads?.[0]?.url,
    };
  }

  if (result.status === 'error' || result.status === 'canceled') {
    return {
      status: result.status,
      error: result.error?.message || 'Upscale failed',
    };
  }

  return { status: 'pending' };
}

/* ─────────── Lip Sync ─────────── */
export async function createLipSyncJob(videoUrl, audioUrl, opts = {}) {
  const response = await client.v1.lipSync.generate({
    assets: {
      videoFilePath: videoUrl,
      videoSource: 'file',
      audioFilePath: audioUrl,
    },
    startSeconds: opts.startSeconds ?? 0,
    endSeconds: opts.endSeconds ?? 5,
    maxFpsLimit: opts.maxFpsLimit ?? 12,
    style: {
      generationMode: opts.generationMode ?? 'lite',
    },
    name: opts.name || `Alveoly Lip Sync ${Date.now()}`,
  });
  return response.id;
}

export async function checkLipSyncJob(projectId) {
  const result = await client.v1.videoProjects.get({ id: projectId });

  if (result.status === 'complete') {
    return { status: 'complete', downloadUrl: result.downloads?.[0]?.url };
  }
  if (result.status === 'error' || result.status === 'canceled') {
    return { status: result.status, error: result.error?.message || 'Lip sync failed' };
  }
  return { status: 'pending' };
}

/* ─────────── AI Headshot Generator ─────────── */
export async function createHeadshotJob(imageUrl, opts = {}) {
  const response = await client.v1.aiHeadshotGenerator.create({
    assets: {
      imageFilePath: imageUrl,
    },
    style: {
      prompt:
        opts.prompt ||
        'Professional corporate headshot with neutral background, natural lighting, business attire',
    },
    name: opts.name || `Alveoly Headshot ${Date.now()}`,
  });
  return response.id;
}

export async function checkHeadshotJob(projectId) {
  const result = await client.v1.imageProjects.get({ id: projectId });

  if (result.status === 'complete') {
    return {
      status: 'complete',
      downloadUrl: result.downloads?.[0]?.url,
    };
  }

  if (result.status === 'error' || result.status === 'canceled') {
    return {
      status: result.status,
      error: result.error?.message || 'Headshot generation failed',
    };
  }

  return { status: 'pending' };
}

/* ─────────── Photo Colorizer ─────────── */
export async function createColorizeJob(imageUrl, opts = {}) {
  const response = await client.v1.photoColorizer.generate({
    assets: {
      imageFilePath: imageUrl,
    },
    name: opts.name || `Alveoly Colorize ${Date.now()}`,
  });
  return response.id;
}

export async function checkColorizeJob(projectId) {
  const result = await client.v1.imageProjects.get({ id: projectId });

  if (result.status === 'complete') {
    return {
      status: 'complete',
      downloadUrl: result.downloads?.[0]?.url,
    };
  }

  if (result.status === 'error' || result.status === 'canceled') {
    return {
      status: result.status,
      error: result.error?.message || 'Colorization failed',
    };
  }

  return { status: 'pending' };
}

/* ─────────── Face Swap Photo ─────────── */
export async function createFaceSwapPhotoJob(sourceUrl, targetUrl, opts = {}) {
  const response = await client.v1.faceSwapPhoto.create({
    assets: {
      faceSwapMode: opts.faceSwapMode ?? 'all-faces', // 'all-faces' | 'individual-faces'
      sourceFilePath: sourceUrl,
      targetFilePath: targetUrl,
    },
    name: opts.name || `Alveoly Face Swap ${Date.now()}`,
  });
  return response.id;
}

export async function checkFaceSwapPhotoJob(projectId) {
  const result = await client.v1.imageProjects.get({ id: projectId });

  if (result.status === 'complete') {
    return { status: 'complete', downloadUrl: result.downloads?.[0]?.url };
  }
  if (result.status === 'error' || result.status === 'canceled') {
    return { status: result.status, error: result.error?.message || 'Face swap failed' };
  }
  return { status: 'pending' };
}

/* ─────────── AI Image Editor ─────────── */
export async function createImageEditorJob(imageUrl, prompt, opts = {}) {
  const response = await client.v1.aiImageEditor.create({
    assets: {
      imageFilePaths: [imageUrl],
    },
    style: {
      prompt: prompt,
    },
    name: opts.name || `Alveoly Image Edit ${Date.now()}`,
    model: opts.model || 'flux-2-klein', // cheapest default, 5 credits
    aspectRatio: opts.aspectRatio || '1:1',
    resolution: opts.resolution || '640px',
  });
  return response.id;
}

export async function checkImageEditorJob(projectId) {
  const result = await client.v1.imageProjects.get({ id: projectId });

  if (result.status === 'complete') {
    return { status: 'complete', downloadUrl: result.downloads?.[0]?.url };
  }
  if (result.status === 'error' || result.status === 'canceled') {
    return { status: result.status, error: result.error?.message || 'Image edit failed' };
  }
  return { status: 'pending' };
}

/* ─────────── Auto Subtitle Generator ─────────── */
export async function createSubtitleJob(videoUrl, opts = {}) {
  const response = await client.v1.autoSubtitleGenerator.generate({
    assets: { videoFilePath: videoUrl },
    startSeconds: opts.startSeconds ?? 0,
    endSeconds: opts.endSeconds ?? 15,
    style: {
      template: opts.template ?? 'karaoke', // Must be: cinematic | highlight | karaoke | minimalist
    },
    name: opts.name || `Alveoly Subtitle ${Date.now()}`,
  });
  return response.id;
}

export async function checkSubtitleJob(projectId) {
  const result = await client.v1.videoProjects.get({ id: projectId });
  if (result.status === 'complete') {
    return { status: 'complete', downloadUrl: result.downloads?.[0]?.url };
  }
  if (result.status === 'error' || result.status === 'canceled') {
    return { status: result.status, error: result.error?.message || 'Subtitle generation failed' };
  }
  return { status: 'pending' };
}

/* ─────────── AI Video Translator ─────────── */
export async function createTranslatorJob(videoUrl, targetLanguage, opts = {}) {
  const response = await client.v1.aiVideoTranslator.generate({
    assets: { videoFilePath: videoUrl },
    startSeconds: opts.startSeconds ?? 0,
    endSeconds: opts.endSeconds ?? 15,
    targetLanguage: targetLanguage,
    resolution: opts.resolution ?? '480p',
    name: opts.name || `Alveoly Translation ${Date.now()}`,
  });
  return response.id;
}

export async function checkTranslatorJob(projectId) {
  // Use the low-level project get, not generate
  const result = await client.v1.videoProjects.get({ id: projectId });

  if (result.status === 'complete') {
    // The SDK may return downloads as URLs, not local paths
    const url = result.downloads?.[0]?.url;
    if (!url) {
      throw new Error('Magic Hour returned no download URL');
    }
    return { status: 'complete', downloadUrl: url };
  }
  if (result.status === 'error' || result.status === 'canceled') {
    return { status: result.status, error: result.error?.message || 'Translation failed' };
  }
  return { status: 'pending' };
}

/* ─────────── AI GIF Generator ─────────── */
export async function createGifJob(prompt, opts = {}) {
  const response = await client.v1.aiGifGenerator.generate({
    style: { prompt: prompt },
    outputFormat: opts.outputFormat ?? 'gif', // 'gif' | 'mp4' | 'webm'
    name: opts.name || `Alveoly GIF ${Date.now()}`,
  });
  return response.id;
}

export async function checkGifJob(projectId) {
  const result = await client.v1.imageProjects.get({ id: projectId });
  if (result.status === 'complete') {
    return { status: 'complete', downloadUrl: result.downloads?.[0]?.url };
  }
  if (result.status === 'error' || result.status === 'canceled') {
    return { status: result.status, error: result.error?.message || 'GIF generation failed' };
  }
  return { status: 'pending' };
}

/* ─────────── Animation ─────────── */
/* ─────────── Animation ─────────── */
export async function createAnimationJob(imageUrl, prompt, opts = {}) {
  const response = await client.v1.animation.generate({
    assets: { 
      imageFilePath: imageUrl,
      audioSource: 'none', // Required: tells the API no audio is provided
    },
    endSeconds: opts.endSeconds ?? 3,
    fps: opts.fps ?? 8,
    height: opts.height ?? 512,
    width: opts.width ?? 512,
    style: {
      artStyle: opts.artStyle ?? 'Studio Ghibli Film Still',
      cameraEffect: opts.cameraEffect ?? 'Dramatic Zoom In',
      prompt: prompt,
      promptType: 'custom',
      transitionSpeed: opts.transitionSpeed ?? 5, // Required: controls frame transitions
    },
    name: opts.name || `Alveoly Animation ${Date.now()}`,
  });
  return response.id;
}

export async function checkAnimationJob(projectId) {
  const result = await client.v1.videoProjects.get({ id: projectId });
  if (result.status === 'complete') {
    return { status: 'complete', downloadUrl: result.downloads?.[0]?.url };
  }
  if (result.status === 'error' || result.status === 'canceled') {
    return { status: result.status, error: result.error?.message || 'Animation failed' };
  }
  return { status: 'pending' };
}