import React, { useState, useEffect } from 'react';
import { View, Text, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Importa AsyncStorage

function Historial() {
  const [registros, setRegistros] = useState([]);

  useEffect(() => {
    const obtenerRegistros = async () => {
      try {
        const horas = await AsyncStorage.getItem('horasTrabajadas');
        if (horas !== null) {
          setRegistros([{ id: '1', fecha: new Date().toLocaleDateString(), horas: JSON.parse(horas) }]);
        }
      } catch (error) {
        console.error('Error al obtener registros:', error);
      }
    };

    obtenerRegistros();
  }, []);

  return (
    <View>
      <FlatList
        data={registros}
        renderItem={({ item }) => (
          <View>
            <Text>Fecha: {item.fecha}</Text>
            <Text>Horas: {item.horas}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

export default Historial;