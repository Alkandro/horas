import React from 'react';
import { View, Text, FlatList, StyleSheet, ScrollView } from 'react-native';

const AdminUserDetailsScreen = ({ route }) => {
  const { user } = route.params;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Detalles de {user.email}</Text>

      {/* ✅ Detalles del usuario */}
      <View style={styles.userInfo}>
        <Text><Text style={styles.label}>Nombre:</Text> {user.nombre}</Text>
        <Text><Text style={styles.label}>Apellido:</Text> {user.apellido}</Text>
        <Text><Text style={styles.label}>Teléfono:</Text> {user.telefono}</Text>
        <Text><Text style={styles.label}>Dirección:</Text> {user.direccion}</Text>
      </View>

      <Text style={styles.subtitle}>Producción</Text>

      {/* ✅ Producción */}
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  userInfo: {
    marginBottom: 20,
    backgroundColor: '#f3f3f3',
    padding: 15,
    borderRadius: 8,
  },
  label: {
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  productionItem: {
    backgroundColor: '#eaeaea',
    padding: 12,
    marginBottom: 8,
    borderRadius: 6,
  },
});

export default AdminUserDetailsScreen;
