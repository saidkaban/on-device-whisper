import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { AudioManager, AudioRecorder } from 'react-native-audio-api';
import { useSpeechToText, WHISPER_TINY_EN } from 'react-native-executorch';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
    const model = useSpeechToText({
        model: WHISPER_TINY_EN,
    });
    // Audio recorder will be used for microphone functionality
    const [recorder] = useState(
        () =>
            new AudioRecorder({
                sampleRate: 16000,        // Whisper's expected sample rate
                bufferLengthInSamples: 1600,  // 100ms chunks for real-time processing
            })
    );

    // Recording state and animation
    const [isRecording, setIsRecording] = useState(false);
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const startRecordingAnimation = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 0.9,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };

    const stopRecordingAnimation = () => {
        scaleAnim.stopAnimation();
        Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
        }).start();
    };

    const handleStartStreaming = async () => {
        setIsRecording(true);
        startRecordingAnimation();

        // Set up audio buffer processing
        recorder.onAudioReady(async ({ buffer }) => {
            // Convert Float32Array to regular array for model processing
            const bufferArray = Array.from(buffer.getChannelData(0));
            model.streamInsert(bufferArray);
        });

        // Begin recording
        recorder.start();

        try {
            // Start streaming transcription with overlapping chunks
            await model.stream();
        } catch (error) {
            console.error('Transcription error:', error);
            // Handle model errors gracefully
            handleStopStreaming();
        }
    };

    const handleStopStreaming = () => {
        setIsRecording(false);
        stopRecordingAnimation();
        recorder.stop();
        model.streamStop(); // Signal end of audio stream
    };

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

    const handleMicrophoneToggle = () => {
        if (isRecording) {
            handleStopStreaming();
        } else {
            handleStartStreaming();
        }
    };

    console.log(model.downloadProgress);

    return (
        <SafeAreaView style={styles.container}>
            {!model.isReady ? (
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading Whisper model...</Text>
                    <View style={styles.progressBarContainer}>
                        <View
                            style={[
                                styles.progressBar,
                                { width: `${Math.round(model.downloadProgress * 100)}%` }
                            ]}
                        />
                    </View>
                    <Text style={styles.progressText}>
                        {Math.round(model.downloadProgress * 100)}%
                    </Text>
                </View>
            ) : (
                <Pressable
                    style={({ pressed }) => [
                        styles.microphoneButton,
                        isRecording && styles.microphoneButtonRecording,
                        pressed && styles.microphoneButtonPressed
                    ]}
                    onPress={handleMicrophoneToggle}
                >
                    <Animated.View
                        style={[
                            styles.microphoneIcon,
                            { transform: [{ scale: scaleAnim }] }
                        ]}
                    >
                        <View style={styles.microphoneBody} />
                        <View style={styles.microphoneStand} />
                    </Animated.View>
                </Pressable>
            )}
            <Text style={styles.transcriptionText}>{model.committedTranscription}</Text>
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
    microphoneButtonRecording: {
        backgroundColor: '#ff6666',
        shadowColor: '#ff4444',
        shadowOpacity: 0.5,
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
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    loadingText: {
        fontSize: 18,
        color: '#ffffff',
        marginBottom: 20,
        textAlign: 'center',
    },
    progressBarContainer: {
        width: '100%',
        height: 8,
        backgroundColor: '#333333',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 12,
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#ff4444',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 16,
        color: '#cccccc',
        fontWeight: '600',
    },
    transcriptionText: {
        fontSize: 16,
        color: '#ffffff',
        marginTop: 20,
        textAlign: 'center',
    },
});
