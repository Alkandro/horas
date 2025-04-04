import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const AdminUserDetailsScreen = ({ route }) => {
  const { user } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalles de {user.email}</Text>
      {user.productionData && user.productionData.length > 0 ? (
        <FlatList
          data={user.productionData}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.productionItem}>
              <Text>Tipo de Pieza: {item.tipoPieza}</Text>
              <Text>Cantidad: {item.cantidad}</Text>
              <Text>Nudos: {item.nudos}</Text>
              <Text>Fecha: {new Date(item.fecha).toLocaleDateString()}</Text>
            </View>
          )}
        />
      ) : (
        <Text>No hay datos de producción para este usuario.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  productionItem: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    marginBottom: 8,
    borderRadius: 4,
  },
});

export default AdminUserDetailsScreen;