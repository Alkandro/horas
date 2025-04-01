import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      await AsyncStorage.setItem('totalPiezas', JSON.stringify(total));
      console.log('Total de piezas guardado con éxito');
    } catch (error) {
      console.error('Error al guardar total de piezas:', error);
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