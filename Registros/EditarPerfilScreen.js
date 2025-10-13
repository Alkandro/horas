import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Text,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, updateDoc } from "firebase/firestore";
import { firestore, auth } from "../firebaseConfig";
import axios from "axios";
import { useTranslation } from "react-i18next";

const EditarPerfilScreen = ({ route, navigation }) => {
  const { userData } = route.params;
  const { t } = useTranslation(); // Hook para traducción
  const [nombre, setNombre] = useState(userData.nombre || "");
  const [apellido, setApellido] = useState(userData.apellido || "");
  const [telefono, setTelefono] = useState(userData.telefono || "");
  const direccion = userData.direccion || {};

  const [prefectura, setPrefectura] = useState(direccion.prefectura || "");
  const [ciudad, setCiudad] = useState(direccion.ciudad || "");
  const [barrio, setBarrio] = useState(direccion.barrio || "");
  const [numero, setNumero] = useState(direccion.numero || "");
  const [codigoPostal, setCodigoPostal] = useState(
    direccion.codigoPostal || ""
  );

  const buscarDireccionPorCodigoPostal = async (codigo) => {
    try {
      const response = await axios.get(
        `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${codigo}`
      );
      const data = response.data;

      if (data.results && data.results.length > 0) {
        const direccionData = data.results[0];
        setPrefectura(direccionData.address1);
        setCiudad(direccionData.address2);
        setBarrio(direccionData.address3);
      } else {
        Alert.alert(
          t("Aviso"),
          t("No se encontró dirección para ese código postal")
        );
      }
    } catch (error) {
      console.error(t("Error al buscar direcció:"), error);
      Alert.alert(t("Error"), t("Hubo un problema al obtener la dirección"));
    }
  };

  const handleGuardar = async () => {
    try {
      const user = auth.currentUser;
      const docRef = doc(firestore, "users", user.uid);
      await updateDoc(docRef, {
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
      Alert.alert(t("Éxito"), t("Perfil actualizado correctamente"));
      navigation.goBack();
    } catch (error) {
      console.error(t("Error al actualizar perfil"), error);
      Alert.alert(t("Error"), t("Hubo un problema al guardar los cambios"));
    }
  };

  const handleCancelar = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>{t("Editar Perfil")}</Text>

          <Text style={styles.label}>{t("Nombre")}</Text>
          <TextInput
            style={styles.input}
            value={nombre}
            onChangeText={setNombre}
          />

          <Text style={styles.label}>{t("Apellido")}</Text>
          <TextInput
            style={styles.input}
            value={apellido}
            onChangeText={setApellido}
          />

          <Text style={styles.label}>{t("Teléfono")}</Text>
          <TextInput
            style={styles.input}
            value={telefono}
            onChangeText={setTelefono}
            keyboardType="phone-pad"
          />
          <Text style={styles.label}>{t("Código Postal")}</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: 1000001"
            value={codigoPostal}
            onChangeText={setCodigoPostal}
            keyboardType="numeric"
          />
          <Button
            title={t("Autocompletar Dirección")}
            onPress={() => buscarDireccionPorCodigoPostal(codigoPostal)}
          />

          <Text style={styles.label}>{t("Provincia")}</Text>
          <TextInput
            style={styles.input}
            value={prefectura}
            onChangeText={setPrefectura}
          />

          <Text style={styles.label}>{t("Ciudad")}</Text>
          <TextInput
            style={styles.input}
            value={ciudad}
            onChangeText={setCiudad}
          />

          <Text style={styles.label}>{t("Barrio")}</Text>
          <TextInput
            style={styles.input}
            value={barrio}
            onChangeText={setBarrio}
          />

          <Text style={styles.label}>{t("Número")}</Text>
          <TextInput
            style={styles.input}
            value={numero}
            onChangeText={setNumero}
          />

          <View style={styles.buttonGroup}>
            <Button title={t("Guardar Cambios")} onPress={handleGuardar} />
            <View style={{ marginTop: 10 }} />
            <Button title={t("Cancelar")} color="#999" onPress={handleCancelar} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 25,
    textAlign: "center",
  },
  label: {
    fontWeight: "bold",
    marginBottom: 5,
    fontSize: 16,
  },
  input: {
    height: 50,
    borderColor: "#aaa",
    borderWidth: 1,
    marginBottom: 15,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: "#f9f9f9",
  },
  input1: {
    height: 50,
    borderColor: "#aaa",
    borderWidth: 1,
    marginBottom: 15,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: "#f9f9f9",
  },
  buttonGroup: {
    marginTop: 20,
  },
});

export default EditarPerfilScreen;
