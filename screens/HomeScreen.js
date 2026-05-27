import { View, Text, Pressable, Animated } from "react-native";
import { useEffect, useRef } from "react";


export default function HomeScreen({ navigation }) {
  const glowAnim = useRef(new Animated.Value(0.7)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),

        Animated.timing(glowAnim, {
          toValue: 0.6,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 2000,
          useNativeDriver: true,
        }),

        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Fade animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-slate-950 px-6">
      {/* Animated Glow */}
      <Animated.View
        style={{
          opacity: glowAnim,
          transform: [{ scale: glowAnim }],
        }}
        className="absolute h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl"
      />

      {/* Main Content */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: floatAnim }],
        }}
        className="w-full items-center"
      >
        {/* Title */}
        <Text className="mb-3 text-center text-5xl font-extrabold tracking-widest text-cyan-400">
          Rudraksham QR
        </Text>

        <Text className="mb-16 text-center text-base tracking-wide text-slate-400">
          Smart QR Scanning & Monitoring System
        </Text>

        {/* Button */}
        <Pressable
          onPress={() => navigation.navigate("QRScanner")}
          className="w-full rounded-3xl border border-cyan-400/40 bg-slate-900 px-8 py-5 active:scale-95"
        >
          {({ pressed }) => (
            <View
              className={`items-center ${
                pressed ? "opacity-70" : "opacity-100"
              }`}
            >
              <Text className="text-lg font-bold tracking-widest text-cyan-400">
                OPEN QR SCANNER
              </Text>

              <Text className="mt-2 text-sm text-slate-400">
                Initialize Scanner Module
              </Text>
            </View>
          )}
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate("SyncLocally")}
          className="mt-5 w-full rounded-3xl border border-cyan-400/40 bg-slate-900 px-6 py-5 active:scale-95"
        >
          {({ pressed }) => (
            <View
              className={`items-center justify-center ${
                pressed ? "opacity-70" : "opacity-100"
              }`}
            >
              <Text className="text-center text-lg font-bold tracking-wide text-cyan-400">
                SYNC DATA LOCALLY
              </Text>

              <Text className="mt-2 text-center text-sm leading-5 text-slate-400">
                Sync data locally without internet connection.
              </Text>
            </View>
          )}
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate("SyncData")}
          className="mt-5 w-full rounded-3xl border border-cyan-400/40 bg-slate-900 px-6 py-5 active:scale-95"
        >
          {({ pressed }) => (
            <View
              className={`items-center justify-center ${
                pressed ? "opacity-70" : "opacity-100"
              }`}
            >
              <Text className="text-center text-lg font-bold tracking-wide text-cyan-400">
                SYNC DATA OVER INTERNET
              </Text>

              <Text className="mt-2 text-center text-sm leading-5 text-slate-400">
                Sync data across devices through internet.
              </Text>
            </View>
          )}
        </Pressable>
      </Animated.View>

      {/* Footer */}
      <Text className="absolute bottom-10 text-xs tracking-[4px] text-slate-600">
        SYSTEM STATUS : ACTIVE
      </Text>
    </View>
  );
}
