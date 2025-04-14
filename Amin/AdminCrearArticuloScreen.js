import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { useTranslation } from "react-i18next";
import { firestore } from '../firebaseConfig';

const AdminCrearArticuloScreen = () => {
  const { t } = useTranslation(); // Hook para traducción
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('');
  const [valorNudo, setValorNudo] = useState('');
  const [nudos, setNudos] = useState('');
  const [mensaje, setMensaje] = useState('');

  const handleCrearArticulo = async () => {
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
    } catch (error) {
      console.error(t('Error al crear artículo:'), error);
      Alert.alert(t('Error'), t('No se pudo crear el artículo'));
    }
  };
  

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{t("Crear Artículo")}</Text>

        <TextInput
          placeholder={t("Modelo")}
          style={styles.input}
          value={nombre}
          onChangeText={setNombre}
        />
        <TextInput
          placeholder={t("Tipo")}
          style={styles.input}
          value={tipo}
          onChangeText={setTipo}
        />
        <TextInput
          placeholder={t("Valor por nudo")}
          style={styles.input}
          value={valorNudo}
          keyboardType="numeric"
          onChangeText={setValorNudo}
        />
        <TextInput
          placeholder={t("Cantidad de nudos por pieza")}
          style={styles.input}
          value={nudos}
          keyboardType="numeric"
          onChangeText={setNudos}
        />
        <Button title="Crear" onPress={handleCrearArticulo} />

        {mensaje ? <Text style={styles.mensaje}>{mensaje}</Text> : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
  },
  mensaje: {
    marginTop: 15,
    color: 'green',
    textAlign: 'center',
  },
});

export default AdminCrearArticuloScreen;
