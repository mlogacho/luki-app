import { View, TouchableOpacity, Platform, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ResizeMode, Video } from 'expo-av';
import { useState, useRef, useEffect } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useContentStore } from '@/src/modules/content/store/contentStore';
import { useAdminStore } from '@/services/adminStore';
import * as ScreenOrientation from 'expo-screen-orientation';
import { StatusBar } from 'expo-status-bar';

// Web-only HLS player using hls.js
function WebHLSPlayer({ url, onBack }: { url: string; onBack: () => void }) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        let hls: any = null;

        const setup = async () => {
            // Check if browser supports HLS natively (Safari)
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
                video.play().catch(() => {});
                return;
            }
            // Use hls.js for Chrome/Firefox/Edge
            const Hls = (await import('hls.js')).default;
            if (Hls.isSupported()) {
                hls = new Hls({ enableWorker: true });
                hls.loadSource(url);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    video.play().catch(() => {});
                });
            }
        };

        setup();
        return () => { if (hls) hls.destroy(); };
    }, [url]);

    return (
        <View style={{ flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
            {/* @ts-ignore */}
            <video
                ref={videoRef}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                controls
                autoPlay
                playsInline
            />
            <TouchableOpacity
                style={{ position: 'absolute', top: 20, left: 20, backgroundColor: 'rgba(0,0,0,0.6)', padding: 10, borderRadius: 20 }}
                onPress={onBack}
            >
                <FontAwesome name="arrow-left" size={22} color="white" />
            </TouchableOpacity>
        </View>
    );
}

export default function Player() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const videoRef = useRef<Video>(null);
    const [status, setStatus] = useState<any>({});
    const { getChannelById, featuredChannel } = useContentStore();
    const adminChannels = useAdminStore((state) => state.channels);

    // Lock to landscape on native
    useEffect(() => {
        if (Platform.OS === 'web') return;
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        return () => {
            ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
        };
    }, []);

    // Resolve video URL: check admin channels first, then content store
    const adminChannel = id ? adminChannels.find((ch) => ch.id === id) : null;
    const storeChannel = id ? getChannelById(id as string) : undefined;
    const videoUrl = adminChannel?.videoUrl ?? storeChannel?.videoUrl ?? featuredChannel?.videoUrl ?? '';

    const handleBack = () => router.back();

    // Show error if no valid URL is available
    if (!videoUrl) {
        return (
            <View style={{ flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
                <StatusBar hidden />
                <TouchableOpacity
                    style={{ position: 'absolute', top: 40, left: 40, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 20 }}
                    onPress={handleBack}
                >
                    <FontAwesome name="arrow-left" size={24} color="white" />
                </TouchableOpacity>
                <FontAwesome name="exclamation-triangle" size={48} color="#FFC107" />
                {/* eslint-disable-next-line react-native/no-inline-styles */}
                <Text style={{ color: 'white', marginTop: 16, fontSize: 16 }}>
                    No se pudo cargar el video
                </Text>
            </View>
        );
    }

    // Use web HLS player on browser
    if (Platform.OS === 'web') {
        return (
            <View style={{ flex: 1, backgroundColor: 'black' }}>
                <StatusBar hidden />
                <WebHLSPlayer url={videoUrl} onBack={handleBack} />
            </View>
        );
    }

    // Native player (iOS/Android)
    return (
        <View style={{ flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
            <StatusBar hidden />
            <Video
                ref={videoRef}
                style={{ width: '100%', height: '100%' }}
                source={{ uri: videoUrl }}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                isLooping={false}
                shouldPlay
                onPlaybackStatusUpdate={(s) => setStatus(() => s)}
            />
            <TouchableOpacity
                style={{ position: 'absolute', top: 40, left: 40, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 20 }}
                onPress={handleBack}
            >
                <FontAwesome name="arrow-left" size={24} color="white" />
            </TouchableOpacity>
        </View>
    );
}
