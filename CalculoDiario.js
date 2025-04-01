import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

function CalculoDiario() {
  const [horasTrabajadas, setHorasTrabajadas] = useState(0);
  const [totalPiezas, setTotalPiezas] = useState(0);

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const horas = await AsyncStorage.getItem('horasTrabajadas');
        const piezas = await AsyncStorage.getItem('totalPiezas');

        if (horas !== null) {
          setHorasTrabajadas(JSON.parse(horas));
        }

        if (piezas !== null) {
          setTotalPiezas(JSON.parse(piezas));
        }
      } catch (error) {
        console.error('Error al obtener datos:', error);
      }
    };

    obtenerDatos();
  }, []);

  const tarifaPorHora = 10; // Ejemplo de tarifa por hora
  const pagoTotal = horasTrabajadas * tarifaPorHora + totalPiezas;

  return (
    <View>
      <Text>Horas trabajadas: {horasTrabajadas}</Text>
      <Text>Total por piezas: {totalPiezas}</Text>
      <Text>Pago total: {pagoTotal}</Text>
    </View>
  );
}

export default CalculoDiario;