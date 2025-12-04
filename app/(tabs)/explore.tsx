import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';

export default function AboutMeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#F3F4F6', dark: '#111827' }}
      headerImage={<Image source={require('../../assets/images/icon.png')} style={styles.headerImage} />}
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={{ fontFamily: Fonts.rounded }}>
          About Me
        </ThemedText>
      </ThemedView>

      <View style={styles.hero}>
        <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
      </View>

      <ThemedText style={styles.paragraph}>
        Hi — I&apos;m Kent Josh M. Gutierrez, the creator of this app. I built this project as the
        final assignment for ADV104 to demonstrate a full-stack mobile app using Expo and Firebase.
      </ThemedText>

      <ThemedText style={styles.paragraph}>
        This app is designed to help manage simple inventory across stores. You can create stores,
        add and edit products, and view logs of changes. I focused on secure access (per-user
        documents enforced by Firestore rules), a clean interface, and realtime updates using
        Firestore listeners.
      </ThemedText>

      <ThemedText style={styles.subTitle}>Technologies</ThemedText>
      <ThemedText style={styles.paragraph}>- Expo / React Native</ThemedText>
      <ThemedText style={styles.paragraph}>- Firebase Authentication & Firestore</ThemedText>
      <ThemedText style={styles.paragraph}>- TypeScript, Expo Router, and modular React hooks</ThemedText>

      <ThemedText style={styles.subTitle}>Planned Improvements</ThemedText>
      <ThemedText style={styles.paragraph}>
        I plan to add better syncing for offline use, performance tuning for large stores, improved
        accessibility, and optional image uploads for product photos. If you&apos;d like to help or
        suggest features, reach out — I appreciate feedback!
      </ThemedText>

      <ThemedText style={styles.subTitle}>Credits</ThemedText>
      <ThemedText style={styles.paragraph}>
        Built by Kent Josh M. Gutierrez for ADV104. Thank you to the course instructors and
        classmates for guidance during development.
      </ThemedText>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 10,
  },
  logo: {
    width: 160,
    height: 160,
    borderRadius: 18,
  },
  paragraph: {
    paddingHorizontal: 16,
    marginTop: 12,
    fontSize: 16,
    color: '#2e3a4cff',
    lineHeight: 22,
  },
  subTitle: {
    paddingHorizontal: 16,
    marginTop: 18,
    fontSize: 18,
    fontWeight: '700',
    color: '#778197ff',
  },
  headerImage: {
    width: 220,
    height: 220,
    alignSelf: 'center',
    opacity: 0.9,
  },
});
