import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, updateDoc } from 'firebase/firestore';
import { firestore, auth } from '../firebaseConfig';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

const EditarPerfilScreen = ({ route, navigation }) => {
  const { t } = useTranslation();
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [prefectura, setPrefectura] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [barrio, setBarrio] = useState("");
  const [numero, setNumero] = useState("");
  const [codigoPostal, setCodigoPostal] = useState("");

  // Cargar datos solo una vez al montar el componente
  useEffect(() => {
    const userData = route.params?.userData;
    if (userData) {
      const direccion = userData.direccion || {};
      setNombre(userData.nombre || "");
      setApellido(userData.apellido || "");
      setTelefono(userData.telefono || "");
      setPrefectura(direccion.prefectura || "");
      setCiudad(direccion.ciudad || "");
      setBarrio(direccion.barrio || "");
      setNumero(direccion.numero || "");
      setCodigoPostal(direccion.codigoPostal || "");
    }
  }, []);

  const buscarDireccionPorCodigoPostal = async (codigo) => {
    Keyboard.dismiss();
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
    Keyboard.dismiss();
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
    Keyboard.dismiss();
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{t("Editar Perfil")}</Text>

        {/* Información Personal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="person-circle-outline" size={20} color="#b0b0b0" /> {t("Información Personal")}
          </Text>

          <View style={styles.field}>
            <Text style={styles.label}>
              <Ionicons name="person-outline" size={16} color="#b0b0b0" /> {t("Nombre")}
            </Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#b0b0b0" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={nombre}
                onChangeText={setNombre}
                placeholder={t("Nombre")}
                placeholderTextColor="#666666"
                autoCorrect={false}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              <Ionicons name="person-outline" size={16} color="#b0b0b0" /> {t("Apellido")}
            </Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#b0b0b0" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={apellido}
                onChangeText={setApellido}
                placeholder={t("Apellido")}
                placeholderTextColor="#666666"
                autoCorrect={false}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              <Ionicons name="call-outline" size={16} color="#b0b0b0" /> {t("Teléfono")}
            </Text>
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color="#b0b0b0" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={telefono}
                onChangeText={setTelefono}
                placeholder={t("Teléfono")}
                placeholderTextColor="#666666"
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>

        {/* Dirección */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="location-outline" size={20} color="#b0b0b0" /> {t("Dirección")}
          </Text>

          <View style={styles.field}>
            <Text style={styles.label}>
              <Ionicons name="mail-outline" size={16} color="#b0b0b0" /> {t("Código Postal")}
            </Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#b0b0b0" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={codigoPostal}
                onChangeText={setCodigoPostal}
                placeholder="Ej: 1000001"
                placeholderTextColor="#666666"
                keyboardType="numeric"
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.autocompleteButton}
            onPress={() => buscarDireccionPorCodigoPostal(codigoPostal)}
            activeOpacity={0.7}
          >
            <Ionicons name="search-outline" size={20} color="#1a1a1a" />
            <Text style={styles.autocompleteButtonText}>{t("Autocompletar Dirección")}</Text>
          </TouchableOpacity>

          <View style={styles.field}>
            <Text style={styles.label}>
              <Ionicons name="business-outline" size={16} color="#b0b0b0" /> {t("Provincia")}
            </Text>
            <View style={styles.inputContainer}>
              <Ionicons name="business-outline" size={20} color="#b0b0b0" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={prefectura}
                onChangeText={setPrefectura}
                placeholder={t("Provincia")}
                placeholderTextColor="#666666"
                autoCorrect={false}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              <Ionicons name="location-outline" size={16} color="#b0b0b0" /> {t("Ciudad")}
            </Text>
            <View style={styles.inputContainer}>
              <Ionicons name="location-outline" size={20} color="#b0b0b0" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={ciudad}
                onChangeText={setCiudad}
                placeholder={t("Ciudad")}
                placeholderTextColor="#666666"
                autoCorrect={false}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              <Ionicons name="home-outline" size={16} color="#b0b0b0" /> {t("Barrio")}
            </Text>
            <View style={styles.inputContainer}>
              <Ionicons name="home-outline" size={20} color="#b0b0b0" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={barrio}
                onChangeText={setBarrio}
                placeholder={t("Barrio")}
                placeholderTextColor="#666666"
                autoCorrect={false}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              <Ionicons name="keypad-outline" size={16} color="#b0b0b0" /> {t("Número")}
            </Text>
            <View style={styles.inputContainer}>
              <Ionicons name="keypad-outline" size={20} color="#b0b0b0" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={numero}
                onChangeText={setNumero}
                placeholder={t("Número")}
                placeholderTextColor="#666666"
              />
            </View>
          </View>
        </View>

        {/* Botones */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={handleGuardar}
            activeOpacity={0.7}
          >
            <Ionicons name="checkmark-circle-outline" size={24} color="#1a1a1a" />
            <Text style={styles.saveButtonText}>{t("Guardar Cambios")}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={handleCancelar}
            activeOpacity={0.7}
          >
            <Ionicons name="close-circle-outline" size={24} color="#b0b0b0" />
            <Text style={styles.cancelButtonText}>{t("Cancelar")}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  scrollView: {
    flex: 1,
  },
  container: {
    padding: 20,
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