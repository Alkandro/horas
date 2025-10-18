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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, updateDoc } from 'firebase/firestore';
import { firestore, auth } from '../firebaseConfig';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

const EditarPerfilScreen = ({ route, navigation }) => {
  const { userData } = route.params;
  const { t } = useTranslation();
  const [nombre, setNombre] = useState(userData.nombre || "");
  const [apellido, setApellido] = useState(userData.apellido || "");
  const [telefono, setTelefono] = useState(userData.telefono || "");
  const direccion = userData.direccion || {};

  const [prefectura, setPrefectura] = useState(direccion.prefectura || "");
  const [ciudad, setCiudad] = useState(direccion.ciudad || "");
  const [barrio, setBarrio] = useState(direccion.barrio || "");
  const [numero, setNumero] = useState(direccion.numero || "");
  const [codigoPostal, setCodigoPostal] = useState(direccion.codigoPostal || "");

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
        Alert.alert(t("Éxito"), t("Dirección autocompletada"));
      } else {
        Alert.alert(
          t("Aviso"),
          t("No se encontró dirección para ese código postal")
        );
      }
    } catch (error) {
      console.error(t("Error al buscar dirección:"), error);
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

  const InputField = ({ icon, label, value, onChangeText, placeholder, keyboardType }) => (
    <View style={styles.field}>
      <Text style={styles.label}>
        <Ionicons name={icon} size={16} color="#b0b0b0" /> {label}
      </Text>
      <View style={styles.inputContainer}>
        <Ionicons name={icon} size={20} color="#b0b0b0" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#666666"
          keyboardType={keyboardType || 'default'}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>{t("Editar Perfil")}</Text>

          {/* Información Personal */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="person-circle-outline" size={20} color="#b0b0b0" /> {t("Información Personal")}
            </Text>

            <InputField
              icon="person-outline"
              label={t("Nombre")}
              value={nombre}
              onChangeText={setNombre}
              placeholder={t("Nombre")}
            />

            <InputField
              icon="person-outline"
              label={t("Apellido")}
              value={apellido}
              onChangeText={setApellido}
              placeholder={t("Apellido")}
            />

            <InputField
              icon="call-outline"
              label={t("Teléfono")}
              value={telefono}
              onChangeText={setTelefono}
              placeholder={t("Teléfono")}
              keyboardType="phone-pad"
            />
          </View>

          {/* Dirección */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="location-outline" size={20} color="#b0b0b0" /> {t("Dirección")}
            </Text>

            <InputField
              icon="mail-outline"
              label={t("Código Postal")}
              value={codigoPostal}
              onChangeText={setCodigoPostal}
              placeholder="Ej: 1000001"
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={styles.autocompleteButton}
              onPress={() => buscarDireccionPorCodigoPostal(codigoPostal)}
            >
              <Ionicons name="search-outline" size={20} color="#1a1a1a" />
              <Text style={styles.autocompleteButtonText}>{t("Autocompletar Dirección")}</Text>
            </TouchableOpacity>

            <InputField
              icon="business-outline"
              label={t("Provincia")}
              value={prefectura}
              onChangeText={setPrefectura}
              placeholder={t("Provincia")}
            />

            <InputField
              icon="location-outline"
              label={t("Ciudad")}
              value={ciudad}
              onChangeText={setCiudad}
              placeholder={t("Ciudad")}
            />

            <InputField
              icon="home-outline"
              label={t("Barrio")}
              value={barrio}
              onChangeText={setBarrio}
              placeholder={t("Barrio")}
            />

            <InputField
              icon="keypad-outline"
              label={t("Número")}
              value={numero}
              onChangeText={setNumero}
              placeholder={t("Número")}
            />
          </View>

          {/* Botones */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.saveButton} onPress={handleGuardar}>
              <Ionicons name="checkmark-circle-outline" size={24} color="#1a1a1a" />
              <Text style={styles.saveButtonText}>{t("Guardar Cambios")}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelar}>
              <Ionicons name="close-circle-outline" size={24} color="#b0b0b0" />
              <Text style={styles.cancelButtonText}>{t("Cancelar")}</Text>
            </TouchableOpacity>
          </View>
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
    flexGrow: 1,
    backgroundColor: "#1a1a1a",
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  field: {
    marginBottom: 15,
  },
  label: {
    fontWeight: "600",
    marginBottom: 8,
    fontSize: 16,
    color: '#b0b0b0',
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
    marginBottom: 20,
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
  buttonContainer: {
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: '#0066ff',
    borderRadius: 12,
    height: 55,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#0066ff',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonText: {
    color: '#1a1a1a',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    height: 55,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3a3a3a',
  },
  cancelButtonText: {
    color: '#b0b0b0',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default EditarPerfilScreen;
