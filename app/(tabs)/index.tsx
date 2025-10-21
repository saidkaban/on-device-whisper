import { Pressable, StyleSheet, View } from 'react-native';

import { useEffect, useState } from 'react';
import { AudioManager, AudioRecorder } from 'react-native-audio-api';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  // Audio recorder will be used for microphone functionality
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [recorder] = useState(
    () =>
      new AudioRecorder({
        sampleRate: 16000,        // Whisper's expected sample rate
        bufferLengthInSamples: 1600,  // 100ms chunks for real-time processing
      })
  );

  useEffect(() => {
    // Configure audio session for optimal speech recording
    AudioManager.setAudioSessionOptions({
      iosCategory: 'playAndRecord',
      iosMode: 'spokenAudio',     // Optimized for speech
      iosOptions: ['allowBluetooth', 'defaultToSpeaker'],
    });

    // Request recording permissions at runtime
    AudioManager.requestRecordingPermissions();
  }, []);

  const handleMicrophonePress = () => {
    console.log('Microphone pressed');
    // Add microphone functionality here
  };

  return (
    <SafeAreaView style={styles.container}>
      <Pressable
        style={({ pressed }) => [
          styles.microphoneButton,
          pressed && styles.microphoneButtonPressed
        ]}
        onPress={handleMicrophonePress}
      >
        <View style={styles.microphoneIcon}>
          <View style={styles.microphoneBody} />
          <View style={styles.microphoneStand} />
        </View>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  microphoneButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  microphoneButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  microphoneIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  microphoneBody: {
    width: 40,
    height: 50,
    backgroundColor: 'white',
    borderRadius: 20,
    marginBottom: 8,
  },
  microphoneStand: {
    width: 60,
    height: 8,
    backgroundColor: 'white',
    borderRadius: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
