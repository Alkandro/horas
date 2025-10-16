import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, firestore } from "../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Toast from "react-native-toast-message";
import { changeLanguage } from "../i18n";
import { useTranslation } from "react-i18next";
import { Ionicons } from '@expo/vector-icons'; // Para los iconos

const LoginScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const userDocRef = doc(firestore, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        const role = email === "anne@a.com" ? "admin" : "user";
        await setDoc(userDocRef, { email: user.email, role });
        console.log("Nuevo usuario creado en Firestore con rol:", role);
      }
    } catch (e) {
      let mensaje = t("Ocurrió un error inesperado. Intenta nuevamente.");

      if (e.code === "auth/invalid-credential") {
        mensaje = t(
          "Correo o contraseña inválidos, o tu cuenta ha sido deshabilitada."
        );
      } else if (e.code === "auth/user-disabled") {
        mensaje = t("Tu cuenta ha sido deshabilitada por un administrador.");
      } else if (e.code === "auth/user-not-found") {
        mensaje = t("Usuario no encontrado.");
      }

      Toast.show({
        type: "error",
        text1: t("Error de inicio de sesión"),
        text2: mensaje,
        position: "top",
      });
    }

    setLoading(false);
  };

  const renderFlag = (lang, icon) => (
    <TouchableOpacity 
      onPress={() => changeLanguage(lang)}
      style={styles.flagButton}
    >
      <Image source={icon} style={styles.flag} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Título principal */}
        <Text style={styles.title}>{t("Iniciar Sesión")}</Text>

        {/* Card del formulario */}
        <View style={styles.formCard}>
          {/* Campo de Email con icono */}
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#b0b0b0" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder={t("Correo Electrónico")}
              placeholderTextColor="#666666"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Campo de Contraseña con icono */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#b0b0b0" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder={t("Contraseña")}
              placeholderTextColor="#666666"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* Mensaje de error */}
          {error ? <Text style={styles.error}>{error}</Text> : null}

          {/* Botón de Login */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.loginButtonText}>{t("Iniciar Sesión")}</Text>
            )}
          </TouchableOpacity>

          {/* Link para crear cuenta */}
          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => navigation.navigate("Register")}
          >
            <Text style={styles.registerLinkText}>
              {t("¿No tienes una cuenta? Crear una")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Selector de idiomas con banderas */}
        <View style={styles.flagsContainer}>
          {renderFlag("es", require("../assets/flags/flag.png"))}
          {renderFlag("en", require("../assets/flags/united-states.png"))}
          {renderFlag("ja", require("../assets/flags/japan.png"))}
          {renderFlag("pt", require("../assets/flags/brazil.png"))}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#1a1a1a",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 40,
    textAlign: "center",
    color: "#ffffff",
  },
  formCard: {
    backgroundColor: "#2a2a2a",
    borderRadius: 20,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 15,
    height: 55,
    borderWidth: 1,
    borderColor: "#3a3a3a",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#ffffff",
  },
  error: {
    color: "#ff4444",
    marginBottom: 15,
    textAlign: "center",
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: "#0066ff",
    borderRadius: 12,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#0066ff",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonDisabled: {
    backgroundColor: "#004499",
  },
  loginButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  registerLink: {
    marginTop: 20,
    alignItems: "center",
  },
  registerLinkText: {
    color: "#b0b0b0",
    fontSize: 15,
  },
  flagsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 40,
    paddingHorizontal: 30,
  },
  flagButton: {
    padding: 5,
  },
  flag: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});

export default LoginScreen;
