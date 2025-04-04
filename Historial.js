import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from './firebaseConfig'; // Importa auth
import { useNavigation } from '@react-navigation/native'; // Importa useNavigation

function Historial() {
  const [registros, setRegistros] = useState([]);
  const navigation = useNavigation(); // Obtén el objeto navigation

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

  const handleLogout = async () => {
    try {
      
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={registros}
        renderItem={({ item }) => (
          <View style={styles.registroItem}>
            <Text>Fecha: {item.fecha}</Text>
            <Text>Horas: {item.horas}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />
      <Button title="Cerrar Sesión" onPress={handleLogout} /> 
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  registroItem: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    marginBottom: 8,
    borderRadius: 4,
  },
});

export default Historial;