import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, firestore } from "../firebaseConfig";
import axios from "axios";
import { useTranslation } from "react-i18next";

const RegisterScreen = ({ navigation }) => {
  const { t } = useTranslation(); // Hook para traducción
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

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={80}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>{t("Crear Cuenta")}</Text>

          <TextInput style={styles.input} placeholder={t("Nombre")} value={nombre} onChangeText={setNombre} />
          <TextInput style={styles.input} placeholder={t("Apellido")} value={apellido} onChangeText={setApellido} />
          <TextInput
            style={styles.input}
            placeholder={t("Teléfono")}
            value={telefono}
            onChangeText={setTelefono}
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            placeholder={t("Correo Electrónico")}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder={t("Código Postal")}
            value={codigoPostal}
            onChangeText={setCodigoPostal}
            keyboardType="numeric"
          />
          <Button title={t("Autocompletar Dirección")} onPress={handleAutoCompletarDireccion} />
          {cargandoDireccion && <ActivityIndicator size="small" style={{ marginVertical: 10 }} />}

          <TextInput style={styles.input} placeholder={t("Provincia")} value={prefectura} onChangeText={setPrefectura} />
          <TextInput style={styles.input} placeholder={t("Ciudad")} value={ciudad} onChangeText={setCiudad} />
          <TextInput style={styles.input} placeholder={t("Barrio")} value={barrio} onChangeText={setBarrio} />
          <TextInput
            style={styles.input}
            placeholder="Ej. 1-1-1"
            value={numero}
            onChangeText={setNumero}
          />

          <TextInput
            style={styles.input}
            placeholder={t("Contraseña")}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TextInput
            style={styles.input}
            placeholder={t("Confirmar Contraseña")}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button title={t("Crear Cuenta")} onPress={handleRegister} disabled={loading} />
          {loading && <ActivityIndicator style={styles.loading} />}

          <View style={{ marginTop: 20 }}>
            <Button title={t("¿Ya tienes una cuenta? Iniciar Sesión")} onPress={() => navigation.goBack()} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f5f5f5",
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 50,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: "white",
  },
  error: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
  loading: {
    marginTop: 15,
  },
});

export default RegisterScreen;
