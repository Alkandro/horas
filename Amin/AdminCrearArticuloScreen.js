import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, addDoc } from 'firebase/firestore';
import { useTranslation } from "react-i18next";
import { firestore } from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';

const AdminCrearArticuloScreen = () => {
  const { t } = useTranslation();
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('');
  const [valorNudo, setValorNudo] = useState('');
  const [nudos, setNudos] = useState('');
  const [mensaje, setMensaje] = useState('');

  const handleCrearArticulo = async () => {
    Keyboard.dismiss();
    
    if (!nombre || !tipo || !valorNudo || !nudos) {
      Alert.alert(t('Error'), t('Por favor completa todos los campos'));
      return;
    }
  
    const valorNudoNum = parseFloat(valorNudo.replace(',', '.'));
    const nudosNum = parseInt(nudos);
  
    if (isNaN(valorNudoNum) || isNaN(nudosNum)) {
      Alert.alert(t('Error'), t('Ingresa valores numéricos válidos para el valor del nudo y los nudos.'));
      return;
    }
  
    try {
      await addDoc(collection(firestore, 'articulos'), {
        nombre,
        tipo,
        valorNudo: valorNudoNum,
        nudos: nudosNum,
        creadoEn: new Date().toISOString(),
      });
      setMensaje(t('✅ Artículo creado correctamente'));
      setNombre('');
      setTipo('');
      setValorNudo('');
      setNudos('');
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      console.error(t('Error al crear artículo:'), error);
      Alert.alert(t('Error'), t('No se pudo crear el artículo'));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>{t("Crear Artículo")}</Text>

          <View style={styles.card}>
            {/* Campo Modelo */}
            <View style={styles.inputContainer}>
              <Ionicons name="pricetag-outline" size={20} color="#b0b0b0" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t("Modelo")}
                placeholderTextColor="#666666"
                value={nombre}
                onChangeText={setNombre}
              />
            </View>

            {/* Campo Tipo */}
            <View style={styles.inputContainer}>
              <Ionicons name="cube-outline" size={20} color="#b0b0b0" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t("Tipo")}
                placeholderTextColor="#666666"
                value={tipo}
                onChangeText={setTipo}
              />
            </View>

            {/* Campo Valor por nudo */}
            <View style={styles.inputContainer}>
              <Ionicons name="cash-outline" size={20} color="#b0b0b0" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t("Valor por nudo")}
                placeholderTextColor="#666666"
                value={valorNudo}
                onChangeText={setValorNudo}
                keyboardType="numeric"
              />
            </View>

            {/* Campo Cantidad de nudos */}
            <View style={styles.inputContainer}>
              <Ionicons name="git-network-outline" size={20} color="#b0b0b0" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t("Cantidad de nudos por pieza")}
                placeholderTextColor="#666666"
                value={nudos}
                onChangeText={setNudos}
                keyboardType="numeric"
              />
            </View>
          </View>

          <TouchableOpacity style={styles.createButton} onPress={handleCrearArticulo}>
            <Ionicons name="add-circle-outline" size={24} color="#1a1a1a" />
            <Text style={styles.createButtonText}>{t("Crear")}</Text>
          </TouchableOpacity>

          {mensaje ? (
            <View style={styles.successContainer}>
              <Ionicons name="checkmark-circle" size={24} color="#00ff88" />
              <Text style={styles.successText}>{mensaje}</Text>
            </View>
          ) : null}
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
    backgroundColor: '#1a1a1a',
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 100,
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
  createButton: {
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
  createButtonText: {
    color: '#1a1a1a',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a3a2a',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#00ff88',
  },
  successText: {
    marginLeft: 10,
    color: '#00ff88',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AdminCrearArticuloScreen;