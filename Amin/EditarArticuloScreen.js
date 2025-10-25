import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, updateDoc } from 'firebase/firestore';
import { firestore } from '../firebaseConfig';
import { useTranslation } from "react-i18next";
import { Ionicons } from '@expo/vector-icons';

const EditarArticuloScreen = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { articulo } = route.params;
  const [nombre, setNombre] = useState(articulo.nombre);
  const [tipo, setTipo] = useState(articulo.tipo);
  const [valorNudo, setValorNudo] = useState(String(articulo.valorNudo));
  const [nudos, setNudos] = useState(String(articulo.nudos));

  const handleGuardar = async () => {
    try {
      const docRef = doc(firestore, 'articulos', articulo.id);
      await updateDoc(docRef, {
        nombre,
        tipo,
        valorNudo: parseFloat(valorNudo),
        nudos: parseInt(nudos),
      });
      Alert.alert(t('Éxito'), t('Artículo actualizado'));
      navigation.goBack();
    } catch (error) {
      console.error(t('Error al actualizar artículo:'), error);
      Alert.alert(t('Error'), t('No se pudo actualizar el artículo'));
    }
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
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>{t("Editar Artículo")}</Text>

          <View style={styles.card}>
            <InputField
              icon="pricetag-outline"
              label={t("Nombre")}
              value={nombre}
              onChangeText={setNombre}
              placeholder={t("Nombre del artículo")}
            />

            <InputField
              icon="cube-outline"
              label={t("Tipo")}
              value={tipo}
              onChangeText={setTipo}
              placeholder={t("Tipo de artículo")}
            />

            <InputField
              icon="cash-outline"
              label={`${t("Valor por nudo")} (¥)`}
              value={valorNudo}
              onChangeText={setValorNudo}
              placeholder={t("Valor por nudo")}
              keyboardType="numeric"
            />

            <InputField
              icon="git-network-outline"
              label={t("Cantidad de nudos")}
              value={nudos}
              onChangeText={setNudos}
              placeholder={t("Nudos por pieza")}
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleGuardar}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#1a1a1a" />
            <Text style={styles.saveButtonText}>{t("Guardar Cambios")}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Ionicons name="close-circle-outline" size={24} color="#b0b0b0" />
            <Text style={styles.cancelButtonText}>{t("Cancelar")}</Text>
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
    flexGrow: 1,
    backgroundColor: '#1a1a1a',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
    color: '#ffffff',
  },
  card: {
    backgroundColor: '#252525',
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
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

export default EditarArticuloScreen;
