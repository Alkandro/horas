import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { auth } from './firebaseConfig';

const UserProfileScreen = ({ navigation }) => { // Recibe la prop navigation aquí
  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigation.navigate('Login'); // Navega a la pantalla de Login (el nombre que le diste en Stack.Navigator)
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Perfil de Usuario</Text>
      {/* Aquí podrías agregar más información del perfil */}
      <Button title="Cerrar Sesión" onPress={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default UserProfileScreen;