// Registros/RegistroYCalculoDiario.js

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, firestore } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';

const RegistroYCalculoDiario = () => {
  const [valorNudo, setValorNudo] = useState('');
  const [cantidadNudosPorPieza, setCantidadNudosPorPieza] = useState('');
  const [cantidadPiezas, setCantidadPiezas] = useState('');
  const [tipoPieza, setTipoPieza] = useState('Ejemplo A');
  const [totalPiezas, setTotalPiezas] = useState(0);
  const [horasTrabajadas, setHorasTrabajadas] = useState(0);

  const tarifaPorHora = 10;
  const pagoTotal = horasTrabajadas * tarifaPorHora + totalPiezas;

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const horas = await AsyncStorage.getItem('horasTrabajadas');
        if (horas !== null) {
          setHorasTrabajadas(parseFloat(horas));
        }
      } catch (error) {
        console.error('Error al obtener horas:', error);
      }
    };

    obtenerDatos();
  }, []);

  const calcularYRegistrar = async () => {
    const valorNudoNum = parseFloat(valorNudo) || 0;
    const cantidadNudosNum = parseFloat(cantidadNudosPorPieza) || 0;
    const cantidadPiezasNum = parseFloat(cantidadPiezas) || 0;

    const total = valorNudoNum * cantidadNudosNum * cantidadPiezasNum;
    setTotalPiezas(total);
    await AsyncStorage.setItem('totalPiezas', JSON.stringify(total));

    try {
      const userId = auth.currentUser?.uid;
      if (userId) {
        await addDoc(collection(firestore, 'production'), {
          userId,
          cantidad: cantidadPiezasNum,
          nudos: cantidadNudosNum,
          tipoPieza,
          fecha: new Date().toISOString(),
        });
        Alert.alert('Éxito', 'Producción registrada correctamente');
      } else {
        Alert.alert('Atención', 'Usuario no autenticado');
      }
    } catch (error) {
      console.error('Error al enviar datos a Firestore:', error);
      Alert.alert('Error', 'No se pudo registrar la producción.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro y Cálculo Diario</Text>

      <Text style={styles.label}>Tipo de Pieza</Text>
      <Picker
        selectedValue={tipoPieza}
        onValueChange={(itemValue) => setTipoPieza(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Ejemplo A" value="Ejemplo A" />
        <Picker.Item label="Ejemplo B" value="Ejemplo B" />
        <Picker.Item label="Ejemplo C" value="Ejemplo C" />
      </Picker>

      <TextInput
        style={styles.input}
        placeholder="Valor por nudo"
        keyboardType="numeric"
        onChangeText={setValorNudo}
      />
      <TextInput
        style={styles.input}
        placeholder="Cantidad de nudos por pieza"
        keyboardType="numeric"
        onChangeText={setCantidadNudosPorPieza}
      />
      <TextInput
        style={styles.input}
        placeholder="Cantidad de piezas"
        keyboardType="numeric"
        onChangeText={setCantidadPiezas}
      />

      <Button title="Calcular y Registrar Producción" onPress={calcularYRegistrar} />

      <View style={styles.resultBox}>
        <Text style={styles.result}>Horas trabajadas: {horasTrabajadas}</Text>
        <Text style={styles.result}>Total por piezas: {totalPiezas}</Text>
        <Text style={styles.resultBold}>Pago total estimado: {pagoTotal}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 12,
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 15,
  },
  resultBox: {
    marginTop: 20,
  },
  result: {
    fontSize: 16,
    marginBottom: 5,
  },
  resultBold: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
});

export default RegistroYCalculoDiario;
