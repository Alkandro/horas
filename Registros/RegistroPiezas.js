import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, firestore } from '../firebaseConfig'; // Importa tus instancias de Firebase

function RegistroPiezas() {
  const [valorNudo, setValorNudo] = useState('');
  const [cantidadNudosPorPieza, setCantidadNudosPorPieza] = useState('');
  const [cantidadPiezas, setCantidadPiezas] = useState('');
  const [totalDiario, setTotalDiario] = useState(0);

  const calcularTotalDiario = async () => {
    const valorNudoNum = parseFloat(valorNudo) || 0;
    const cantidadNudosNum = parseFloat(cantidadNudosPorPieza) || 0;
    const cantidadPiezasNum = parseFloat(cantidadPiezas) || 0;

    const total = valorNudoNum * cantidadNudosNum * cantidadPiezasNum;
    setTotalDiario(total);

    try {
      const userId = auth.currentUser?.uid;
      if (userId) {
        await firestore().collection('production').add({
          userId: userId,
          cantidad: parseFloat(cantidadPiezas) || 0,
          nudos: parseFloat(cantidadNudosPorPieza) || 0,
          tipoPieza: 'Tipo de Pieza Ejemplo', // Deberías tener un campo para esto
          fecha: new Date().toISOString(),
        });
        console.log('Datos de producción enviados a Firestore');
      } else {
        console.warn('Usuario no autenticado.');
      }
    } catch (error) {
      console.error('Error al enviar datos de producción a Firestore:', error);
    }
  };
  

  return (
    <View>
      <TextInput
        placeholder="Valor por nudo"
        keyboardType="numeric"
        onChangeText={setValorNudo}
      />
      <TextInput
        placeholder="Cantidad de nudos por pieza"
        keyboardType="numeric"
        onChangeText={setCantidadNudosPorPieza}
      />
      <TextInput
        placeholder="Cantidad de piezas"
        keyboardType="numeric"
        onChangeText={setCantidadPiezas}
      />
      <Button title="Calcular Total Diario" onPress={calcularTotalDiario} />
      <Text>Total diario: {totalDiario}</Text>
    </View>
  );
}

export default RegistroPiezas;