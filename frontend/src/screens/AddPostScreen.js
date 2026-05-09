import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import Button from '../components/Button';
import Input from '../components/Input';
import Chip from '../components/Chip';
import ScreenHeader from '../components/ScreenHeader';
import { CATEGORIES, CONDITIONS, colors, radius, spacing, typography } from '../theme';
import { createPostApi, updatePostApi } from '../api/posts';
import { extractError } from '../api/client';
import { resolveImageUrl } from '../config';

const AddPostScreen = ({ navigation, route }) => {
  const editPost = route?.params?.post;
  const isEdit = Boolean(editPost);

  const [title, setTitle] = useState(editPost?.title || '');
  const [description, setDescription] = useState(editPost?.description || '');
  const [price, setPrice] = useState(editPost ? String(editPost.price) : '');
  const [location, setLocation] = useState(editPost?.location || '');
  const [category, setCategory] = useState(editPost?.category || 'other');
  const [condition, setCondition] = useState(editPost?.condition || 'used');
  const [images, setImages] = useState(
    editPost?.images?.map((p) => ({ uri: resolveImageUrl(p), existing: true })) || []
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const pickImages = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Brak dostępu', 'Zezwól na dostęp do zdjęć, aby dodać zdjęcia do ogłoszenia.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 5,
      quality: 0.7,
    });
    if (result.canceled) return;
    const picked = result.assets.map((a) => ({
      uri: a.uri,
      name: a.fileName || `photo-${Date.now()}.jpg`,
      type: a.mimeType || 'image/jpeg',
      existing: false,
    }));
    setImages((prev) => [...prev, ...picked].slice(0, 5));
  };

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const validate = () => {
    if (!title.trim()) return 'Podaj tytuł';
    if (!description.trim()) return 'Dodaj opis';
    if (!price || isNaN(Number(price)) || Number(price) < 0) return 'Podaj poprawną cenę';
    if (!location.trim()) return 'Podaj miasto';
    return null;
  };

  const handleSubmit = async () => {
    setError('');
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('price', String(Number(price)));
      formData.append('location', location.trim());
      formData.append('category', category);
      formData.append('condition', condition);

      const newImages = images.filter((img) => !img.existing);
      newImages.forEach((img) => {
        formData.append('images', {
          uri: img.uri,
          name: img.name || `photo-${Date.now()}.jpg`,
          type: img.type || 'image/jpeg',
        });
      });

      if (isEdit) {
        await updatePostApi(editPost._id, formData);
      } else {
        await createPostApi(formData);
      }

      Alert.alert(
        isEdit ? 'Ogłoszenie zaktualizowane' : 'Ogłoszenie utworzone',
        '',
        [
          {
            text: 'Gotowe',
            onPress: () => {
              if (isEdit) {
                navigation.goBack();
              } else {
                setTitle('');
                setDescription('');
                setPrice('');
                setLocation('');
                setCategory('other');
                setCondition('used');
                setImages([]);
                navigation.navigate('Home');
              }
            },
          },
        ]
      );
    } catch (e) {
      setError(extractError(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader
        title={isEdit ? 'Edycja ogłoszenia' : 'Nowe ogłoszenie'}
        onBack={isEdit ? () => navigation.goBack() : undefined}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.sectionLabel}>Zdjęcia</Text>
          <Text style={styles.hint}>Do 5 zdjęć, JPEG/PNG/WEBP, do 5 MB.</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesRow}>
            <Pressable onPress={pickImages} style={styles.addImageBtn}>
              <Text style={styles.plusIcon}>+</Text>
              <Text style={styles.addImageText}>Dodaj</Text>
            </Pressable>
            {images.map((img, idx) => (
              <View key={`${img.uri}-${idx}`} style={styles.thumb}>
                <Image source={{ uri: img.uri }} style={styles.thumbImage} />
                <Pressable
                  onPress={() => removeImage(idx)}
                  style={styles.removeBtn}
                  hitSlop={6}
                >
                  <Text style={styles.removeIcon}>✕</Text>
                </Pressable>
              </View>
            ))}
          </ScrollView>

          <Input
            label="Tytuł"
            value={title}
            onChangeText={setTitle}
            placeholder="Np. iPhone 13 Pro 256 GB"
          />

          <Input
            label="Opis"
            value={description}
            onChangeText={setDescription}
            placeholder="Opisz przedmiot szczegółowo"
            multiline
          />

          <Input
            label="Cena (zł)"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            placeholder="0"
          />

          <Input
            label="Miasto"
            value={location}
            onChangeText={setLocation}
            placeholder="Tarnów"
          />

          <Text style={styles.sectionLabel}>Kategoria</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
            {CATEGORIES.map((c) => (
              <Chip
                key={c.id}
                label={c.label}
                active={category === c.id}
                onPress={() => setCategory(c.id)}
              />
            ))}
          </ScrollView>

          <Text style={styles.sectionLabel}>Stan</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
            {CONDITIONS.map((c) => (
              <Chip
                key={c.id}
                label={c.label}
                active={condition === c.id}
                onPress={() => setCondition(c.id)}
              />
            ))}
          </ScrollView>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={{ marginTop: spacing.lg }}>
            <Button
              title={isEdit ? 'Zapisz zmiany' : 'Opublikuj'}
              onPress={handleSubmit}
              loading={submitting}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  sectionLabel: {
    ...typography.small,
    color: colors.textMuted,
    fontWeight: '500',
    marginTop: spacing.md,
    marginBottom: 6,
  },
  hint: { fontSize: 12, color: colors.textLight, marginBottom: spacing.sm },
  imagesRow: { marginBottom: spacing.md },
  addImageBtn: {
    width: 90,
    height: 90,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: colors.primarySoft,
  },
  plusIcon: { fontSize: 24, color: colors.primary, marginBottom: 2 },
  addImageText: { fontSize: 11, color: colors.primaryDark, fontWeight: '600' },
  thumb: {
    width: 90,
    height: 90,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginRight: 8,
    position: 'relative',
  },
  thumbImage: { width: '100%', height: '100%' },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeIcon: { color: '#fff', fontSize: 12 },
  chipsRow: { marginBottom: spacing.sm },
  error: { color: colors.danger, fontSize: 13, marginTop: spacing.sm },
});

export default AddPostScreen;
