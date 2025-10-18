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
import { doc, updateDoc, getDocs, setDoc, query, collection, where } from 'firebase/firestore';
import { firestore } from '../firebaseConfig';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

const EditarRegistroScreen = ({ route, navigation }) => {
  const { registro } = route.params;
  const { t } = useTranslation();
  const [cantidad, setCantidad] = useState(String(registro.cantidad));
  const [tipoPieza, setTipoPieza] = useState(registro.tipoPieza);
  const [valorNudo] = useState(String(registro.valorNudo));
  const [nudos] = useState(String(registro.nudos));

  const handleGuardar = async () => {
    try {
      const docRef = doc(firestore, 'production', registro.id);
      const nuevaCantidad = parseFloat(cantidad);
  
      // Actualizar el documento de producción
      await updateDoc(docRef, {
        cantidad: nuevaCantidad,
        tipoPieza,
      });
  
      // Calcular el nuevo total mensual
      const userId = registro.userId;
      const fecha = registro.fecha;
  
      if (!userId || !fecha) {
        throw new Error('userId o fecha no definidos para el registro');
      }
  
      const date = dayjs(fecha);
      const año = date.year();
      const mes = date.month() + 1;
  
      const snapshot = await getDocs(
        query(
          collection(firestore, 'production'),
          where('userId', '==', userId)
        )
      );
  
      const registrosDelMes = snapshot.docs
        .map(doc => doc.data())
        .filter(d => {
          const f = dayjs(d.fecha);
          return f.year() === año && f.month() + 1 === mes;
        });
  
      const nuevoTotal = registrosDelMes.reduce((acc, item) => {
        const v = Number(item.valorNudo);
        const n = Number(item.nudos);
        const c = Number(item.cantidad);
        if (!isNaN(v) && !isNaN(n) && !isNaN(c)) {
          return acc + v * n * c;
        }
        return acc;
      }, 0);
  
      const resumenId = `${userId}_${año}_${mes}`;
      await setDoc(doc(firestore, 'resumenMensual', resumenId), {
        userId,
        año,
        mes,
        total: nuevoTotal,
        actualizadoEl: new Date(),
      });
  
      Alert.alert(t('Éxito'), t('Registro y resumen mensual actualizados'));
      navigation.goBack();
    } catch (error) {
      console.error(t('Error al actualizar:'), error);
      Alert.alert(t('Error'), t('No se pudo actualizar el registro y el resumen mensual'));
    }
  };

  const handleCancelar = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>{t("Editar Registro")}</Text>

          {/* Card de información */}
          <View style={styles.card}>
            {/* Tipo de pieza */}
            <View style={styles.field}>
              <Text style={styles.label}>
                <Ionicons name="cube-outline" size={16} color="#b0b0b0" /> {t("Tipo de pieza")}
              </Text>
              <View style={styles.inputContainer}>
                <Ionicons name="pricetag-outline" size={20} color="#b0b0b0" style={styles.inputIcon} />
                <TextInput
                  value={tipoPieza}
                  onChangeText={setTipoPieza}
                  style={styles.input}
                  placeholder={t("Tipo de pieza")}
                  placeholderTextColor="#666666"
                />
              </View>
            </View>

            {/* Cantidad */}
            <View style={styles.field}>
              <Text style={styles.label}>
                <Ionicons name="calculator-outline" size={16} color="#b0b0b0" /> {t("Cantidad")}
              </Text>
              <View style={styles.inputContainer}>
                <Ionicons name="layers-outline" size={20} color="#b0b0b0" style={styles.inputIcon} />
                <TextInput
                  value={cantidad}
                  onChangeText={setCantidad}
                  style={styles.input}
                  placeholder={t("Cantidad")}
                  placeholderTextColor="#666666"
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Valor por nudo (solo lectura) */}
            <View style={styles.field}>
              <Text style={styles.label}>
                <Ionicons name="cash-outline" size={16} color="#b0b0b0" /> {t("Valor por nudo")}
              </Text>
              <View style={[styles.inputContainer, styles.readOnlyContainer]}>
                <Ionicons name="lock-closed-outline" size={20} color="#666666" style={styles.inputIcon} />
                <TextInput
                  value={valorNudo}
                  editable={false}
                  style={[styles.input, styles.readOnly]}
                  placeholder={t("Valor por nudo")}
                  placeholderTextColor="#666666"
                />
              </View>
            </View>

            {/* Nudos por pieza (solo lectura) */}
            <View style={styles.field}>
              <Text style={styles.label}>
                <Ionicons name="git-network-outline" size={16} color="#b0b0b0" /> {t("Nudos por pieza")}
              </Text>
              <View style={[styles.inputContainer, styles.readOnlyContainer]}>
                <Ionicons name="lock-closed-outline" size={20} color="#666666" style={styles.inputIcon} />
                <TextInput
                  value={nudos}
                  editable={false}
                  style={[styles.input, styles.readOnly]}
                  placeholder={t("Nudos por pieza")}
                  placeholderTextColor="#666666"
                />
              </View>
            </View>
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
  readOnlyContainer: {
    backgroundColor: '#1f1f1f',
    borderColor: '#2a2a2a',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
  },
  readOnly: {
    color: '#666666',
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

export default EditarRegistroScreen;