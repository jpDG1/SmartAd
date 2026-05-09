import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

const MAX_WIDTH = 1024;

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * content:// / ph:// — копируем в file:// в cache, иначе FormData.fetch на Android
 * часто читает источник нестабильно при первом обращении.
 */
async function ensureStableFileUri(uri) {
  if (!uri) throw new Error('Brak URI zdjęcia');
  if (/^file:\/\//i.test(uri)) {
    return uri;
  }
  const base = FileSystem.cacheDirectory;
  if (!base) {
    return uri;
  }
  const dest = `${base}avatar-pick-${Date.now()}-${Math.round(Math.random() * 1e6)}.bin`;
  try {
    await FileSystem.copyAsync({ from: uri, to: dest });
    await delay(40);
    return dest;
  } catch {
    return uri;
  }
}

const RETRY_MS = [100, 220, 420, 700, 1100];

async function manipulateToJpeg(sourceUri, attempt = 1) {
  const opts = {
    compress: 0.88,
    format: ImageManipulator.SaveFormat.JPEG,
  };
  try {
    return await ImageManipulator.manipulateAsync(
      sourceUri,
      [{ resize: { width: MAX_WIDTH } }],
      opts
    );
  } catch (e) {
    if (attempt >= RETRY_MS.length + 1) throw e;
    await delay(RETRY_MS[attempt - 1] ?? 400);
    return manipulateToJpeg(sourceUri, attempt + 1);
  }
}

/**
 * После выбора снимка: стабильный file:// как JPEG для multipart на Android/iOS.
 */
export async function prepareAvatarForUpload(asset) {
  const stable = await ensureStableFileUri(asset.uri);

  try {
    await delay(Platform.OS === 'android' ? 60 : 0);
    const manipulated = await manipulateToJpeg(stable);
    return {
      uri: manipulated.uri,
      name: 'avatar.jpg',
      type: 'image/jpeg',
    };
  } catch {
    const lower = stable.toLowerCase();
    return {
      uri: stable,
      name:
        asset.fileName ||
        (Platform.OS === 'android' ? `avatar-${Date.now()}.jpg` : 'avatar.jpg'),
      type:
        asset.mimeType ||
        (lower.endsWith('.png')
          ? 'image/png'
          : lower.endsWith('.webp')
            ? 'image/webp'
            : 'image/jpeg'),
    };
  }
}
