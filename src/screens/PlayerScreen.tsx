import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, AppState, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import YoutubePlayer, { PLAYER_ERRORS, PLAYER_STATES } from 'react-native-youtube-iframe';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useIsaiyaTheme } from '../theme/ThemeContext';
import { typography } from '../theme/typography';
import { useQueue } from '../state/QueueContext';
import { useFavorites } from '../state/FavoritesContext';
import { useRecentlyPlayed } from '../state/RecentlyPlayedContext';
import { useLanguage } from '../state/LanguageContext';
import { ErrorNotice } from '../components/ErrorNotice';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Player'>;

const ERROR_MESSAGES: Record<string, string> = {
  [PLAYER_ERRORS.INVALID_PARAMETER]: "This video isn't available.",
  [PLAYER_ERRORS.HTML5_ERROR]: 'Playback failed. Please try again.',
  [PLAYER_ERRORS.VIDEO_NOT_FOUND]: "This video isn't available. It may have been removed.",
  [PLAYER_ERRORS.EMBED_NOT_ALLOWED]: "The owner of this video doesn't allow it to be played here.",
};

export function PlayerScreen({ navigation }: Props) {
  const { colors } = useIsaiyaTheme();
  const { width } = useWindowDimensions();
  const playerHeight = Math.round((width * 9) / 16);
  const isFocused = useIsFocused();
  const { current, hasNext, hasPrevious, next, previous } = useQueue();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { recordPlayed } = useRecentlyPlayed();
  const { language } = useLanguage();

  const [playing, setPlaying] = useState(true);
  const [ready, setReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAppActive, setIsAppActive] = useState(AppState.currentState === 'active');
  const heartScale = useRef(new Animated.Value(1)).current;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => navigation.navigate('Queue')}
          accessibilityRole="button"
          accessibilityLabel="Queue"
          hitSlop={8}
        >
          <Ionicons name="list" size={22} color={colors.onSurface} style={styles.queueIcon} />
        </Pressable>
      ),
    });
  }, [navigation, colors.onSurface]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => setIsAppActive(state === 'active'));
    return () => subscription.remove();
  }, []);

  // A new queue item means a new embedded video; reset per-video playback UI state
  // and record it as recently played (selecting/auto-advancing to it counts as a play).
  useEffect(() => {
    setReady(false);
    setErrorMessage(null);
    setPlaying(true);
    if (current) recordPlayed(current, language.code);
  }, [current?.videoId]);

  const onChangeState = useCallback(
    (state: PLAYER_STATES) => {
      if (state === PLAYER_STATES.ENDED) {
        if (hasNext) {
          next();
        } else {
          setPlaying(false);
        }
        return;
      }
      if (state === PLAYER_STATES.PLAYING) setPlaying(true);
      if (state === PLAYER_STATES.PAUSED) setPlaying(false);
    },
    [hasNext, next]
  );

  const onError = useCallback((error: string) => {
    setErrorMessage(ERROR_MESSAGES[error] ?? 'Playback failed. Please try again.');
    setPlaying(false);
  }, []);

  const handleToggleFavorite = useCallback(() => {
    if (!current) return;
    toggleFavorite(current, language.code);
    heartScale.setValue(0.7);
    Animated.spring(heartScale, { toValue: 1, useNativeDriver: true, friction: 4 }).start();
  }, [current, toggleFavorite, heartScale, language.code]);

  // Compliant with YouTube's ban on "background player" audio: playback only
  // ever runs while this screen is focused and the app is in the foreground.
  const effectivePlay = playing && isFocused && isAppActive && !errorMessage;

  if (!current) {
    return (
      <View style={[styles.container, styles.centeredFill, { backgroundColor: colors.background }]}>
        <Text style={[typography.body, { color: colors.onSurfaceMuted }]}>Nothing is playing.</Text>
      </View>
    );
  }

  const favorited = isFavorite(current.videoId);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.playerWrapper, { height: playerHeight }]}>
        {errorMessage ? (
          <View style={[styles.errorBox, { backgroundColor: colors.surfaceVariant }]}>
            <ErrorNotice message={errorMessage} />
          </View>
        ) : (
          <>
            {!ready && (
              <View style={[styles.loadingOverlay, { backgroundColor: colors.surfaceVariant }]}>
                <ActivityIndicator color={colors.primary} />
              </View>
            )}
            <YoutubePlayer
              height={playerHeight}
              width={width}
              play={effectivePlay}
              videoId={current.videoId}
              onChangeState={onChangeState}
              onError={onError}
              onReady={() => setReady(true)}
            />
          </>
        )}
      </View>

      <View style={styles.info}>
        <View style={styles.infoText}>
          <Text style={[typography.screenTitle, styles.title, { color: colors.onSurface }]} numberOfLines={2}>
            {current.title}
          </Text>
          <Text style={[typography.body, { color: colors.onSurfaceMuted }]} numberOfLines={1}>
            {current.channelTitle}
          </Text>
        </View>
        <Pressable
          onPress={handleToggleFavorite}
          style={styles.favoriteButton}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={favorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
            <Ionicons name={favorited ? 'heart' : 'heart-outline'} size={26} color={favorited ? colors.primary : colors.onSurfaceMuted} />
          </Animated.View>
        </Pressable>
      </View>

      <View style={styles.controlsRow}>
        <Pressable
          onPress={previous}
          disabled={!hasPrevious}
          hitSlop={8}
          style={({ pressed }) => [styles.sideButton, { opacity: !hasPrevious ? 0.3 : pressed ? 0.6 : 1 }]}
          accessibilityRole="button"
          accessibilityLabel="Previous"
        >
          <Ionicons name="play-skip-back" size={26} color={colors.onSurface} />
        </Pressable>

        <Pressable
          onPress={() => setPlaying((prev) => !prev)}
          disabled={!ready || !!errorMessage}
          style={({ pressed }) => [
            styles.playButton,
            {
              backgroundColor: colors.primary,
              opacity: !ready || !!errorMessage ? 0.5 : pressed ? 0.8 : 1,
              transform: [{ scale: pressed ? 0.95 : 1 }],
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={playing ? 'Pause' : 'Play'}
        >
          <Ionicons name={playing ? 'pause' : 'play'} size={28} color="#FFFFFF" />
        </Pressable>

        <Pressable
          onPress={next}
          disabled={!hasNext}
          hitSlop={8}
          style={({ pressed }) => [styles.sideButton, { opacity: !hasNext ? 0.3 : pressed ? 0.6 : 1 }]}
          accessibilityRole="button"
          accessibilityLabel="Next / Skip"
        >
          <Ionicons name="play-skip-forward" size={26} color={colors.onSurface} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredFill: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerWrapper: {
    width: '100%',
    justifyContent: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  errorBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  infoText: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    marginBottom: 4,
  },
  favoriteButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  sideButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  queueIcon: {
    marginRight: 8,
  },
});
