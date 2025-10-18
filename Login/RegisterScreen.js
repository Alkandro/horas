import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, firestore } from '../firebaseConfig';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

const RegisterScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [codigoPostal, setCodigoPostal] = useState("");
  const [prefectura, setPrefectura] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [barrio, setBarrio] = useState("");
  const [numero, setNumero] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cargandoDireccion, setCargandoDireccion] = useState(false);

  const handleAutoCompletarDireccion = async () => {
    setCargandoDireccion(true);
    try {
      const response = await axios.get(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${codigoPostal}`);
      const data = response.data;
      if (data.results && data.results.length > 0) {
        const d = data.results[0];
        setPrefectura(d.address1);
        setCiudad(d.address2);
        setBarrio(d.address3);
        Alert.alert(t("Éxito"), t("Dirección autocompletada"));
      } else {
        Alert.alert(t("Aviso"), t("No se encontró dirección para ese código postal"));
      }
    } catch (error) {
      console.error(t("Error buscando dirección"), error);
      Alert.alert(t("Error"), t("No se pudo obtener la dirección"));
    } finally {
      setCargandoDireccion(false);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError(t("Las contraseñas no coinciden"));
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const role = email === "anne@a.com" ? "admin" : "user";
      await setDoc(doc(firestore, "users", user.uid), {
        email,
        role,
        nombre,
        apellido,
        telefono,
        direccion: {
          prefectura,
          ciudad,
          barrio,
          numero,
          codigoPostal,
        },
      });

      console.log(t("Usuario registrado con rol"), role);
    } catch (e) {
      setError(e.message || t("Error al crear la cuenta"));
      console.error(t("Error de registro"), e);
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ icon, placeholder, value, onChangeText, secureTextEntry, keyboardType }) => (
    <View style={styles.inputContainer}>
      <Ionicons name={icon} size={20} color="#b0b0b0" style={styles.inputIcon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#666666"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType || 'default'}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={80}
      >
        <ScrollView 
          contentContainerStyle={styles.container} 
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>{t("Crear Cuenta")}</Text>

          {/* Información Personal */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="person-circle-outline" size={18} color="#b0b0b0" /> {t("Información Personal")}
            </Text>

            <InputField
              icon="person-outline"
              placeholder={t("Nombre")}
              value={nombre}
              onChangeText={setNombre}
            />

            <InputField
              icon="person-outline"
              placeholder={t("Apellido")}
              value={apellido}
              onChangeText={setApellido}
            />

            <InputField
              icon="call-outline"
              placeholder={t("Teléfono")}
              value={telefono}
              onChangeText={setTelefono}
              keyboardType="phone-pad"
            />

            <InputField
              icon="mail-outline"
              placeholder={t("Correo Electrónico")}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
          </View>

          {/* Dirección */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="location-outline" size={18} color="#b0b0b0" /> {t("Dirección")}
            </Text>

            <InputField
              icon="mail-outline"
              placeholder={t("Código Postal")}
              value={codigoPostal}
              onChangeText={setCodigoPostal}
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={styles.autocompleteButton}
              onPress={handleAutoCompletarDireccion}
              disabled={cargandoDireccion}
            >
              {cargandoDireccion ? (
                <ActivityIndicator size="small" color="#1a1a1a" />
              ) : (
                <>
                  <Ionicons name="search-outline" size={20} color="#1a1a1a" />
                  <Text style={styles.autocompleteButtonText}>{t("Autocompletar Dirección")}</Text>
                </>
              )}
            </TouchableOpacity>

            <InputField
              icon="business-outline"
              placeholder={t("Provincia")}
              value={prefectura}
              onChangeText={setPrefectura}
            />

            <InputField
              icon="location-outline"
              placeholder={t("Ciudad")}
              value={ciudad}
              onChangeText={setCiudad}
            />

            <InputField
              icon="home-outline"
              placeholder={t("Barrio")}
              value={barrio}
              onChangeText={setBarrio}
            />

            <InputField
              icon="keypad-outline"
              placeholder="Ej. 1-1-1"
              value={numero}
              onChangeText={setNumero}
            />
          </View>

          {/* Contraseña */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="lock-closed-outline" size={18} color="#b0b0b0" /> {t("Seguridad")}
            </Text>

            <InputField
              icon="lock-closed-outline"
              placeholder={t("Contraseña")}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <InputField
              icon="lock-closed-outline"
              placeholder={t("Confirmar Contraseña")}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color="#ff4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Botón Crear Cuenta */}
          <TouchableOpacity
            style={[styles.registerButton, loading && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#1a1a1a" />
            ) : (
              <>
                <Ionicons name="person-add-outline" size={24} color="#1a1a1a" />
                <Text style={styles.registerButtonText}>{t("Crear Cuenta")}</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Link a Login */}
          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.loginLinkText}>
              {t("¿Ya tienes una cuenta?")} <Text style={styles.loginLinkBold}>{t("Iniciar Sesión")}</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  container: {
    padding: 20,
    backgroundColor: "#1a1a1a",
    flexGrow: 1,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 25,
    textAlign: "center",
    color: '#ffffff',
  },
  section: {
    backgroundColor: '#252525',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3a3a3a',
    paddingHorizontal: 15,
    height: 55,
    marginBottom: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
  },
  autocompleteButton: {
    backgroundColor: '#00ff88',
    borderRadius: 10,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#00ff88',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  autocompleteButtonText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3a1a1a',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  errorText: {
    color: "#ff4444",
    marginLeft: 10,
    fontSize: 14,
    flex: 1,
  },
  registerButton: {
    backgroundColor: '#0066ff',
    borderRadius: 12,
    height: 55,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#0066ff',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#1a1a1a',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  loginLinkText: {
    color: '#b0b0b0',
    fontSize: 16,
  },
  loginLinkBold: {
    color: '#0066ff',
    fontWeight: 'bold',
  },
});

export default RegisterScreen;

