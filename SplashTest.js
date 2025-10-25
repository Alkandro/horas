// SplashTest.js
import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";

const SplashTest = () => {
  const [showLoader, setShowLoader] = useState(false);

  // Control de duración total del splash
  useEffect(() => {
    const timer = setTimeout(() => setShowLoader(true), 5000); // splash visible 5s
    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={["#1a1a1a", "#0f2027", "#203a43", "#2c5364"]}
      style={styles.container}
    >
      {/* Logo animado */}
      <MotiView
        from={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "timing", duration: 2800 }}
      >
        <Image
          source={require("./assets/prk.png")} // tu logo
          style={styles.logo}
          resizeMode="contain"
        />
      </MotiView>

      {/* Texto animado */}
      <MotiView
        from={{ opacity: 0, translateY: 15 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 500, duration: 700 }}
      >
        <Text style={styles.title}>Iniciando sesión...</Text>
      </MotiView>

      {/* Loader opcional */}
      {showLoader && (
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 800 }}
        >
          <ActivityIndicator size="large" color="#00eaff" style={{ marginTop: 20 }} />
        </MotiView>
      )}

      {/* Fondo animado pulse infinito */}
      <MotiView
        style={styles.pulse}
        from={{ opacity: 0.1, scale: 1 }}
        animate={{ opacity: 0.3, scale: 1.2 }}
        transition={{
          loop: true,
          type: "timing",
          duration: 3000,
        }}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 15,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.8,
  },
  pulse: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "#00eaff",
    opacity: 0.2,
  },
});

export default SplashTest;
