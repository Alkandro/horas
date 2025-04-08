import React from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView } from 'react-native';

const AdminUserDetailsScreen = ({ route }) => {
  const { user } = route.params;

  const renderItem = ({ item }) => (
    <View style={styles.productionItem}>
      <Text>Tipo de Pieza: {item.tipoPieza}</Text>
      <Text>Cantidad: {item.cantidad}</Text>
      <Text>Nudos: {item.nudos}</Text>
      <Text>Fecha: {new Date(item.fecha).toLocaleDateString()}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Detalles de {user.email}</Text>

            <View style={styles.userInfo}>
              <Text>
                <Text style={styles.label}>Nombre:</Text> {user.nombre}
              </Text>
              <Text>
                <Text style={styles.label}>Apellido:</Text> {user.apellido}
              </Text>
              <Text>
                <Text style={styles.label}>Teléfono:</Text> {user.telefono}
              </Text>
              <Text style={styles.label}>Dirección:</Text>
              <Text>
                {`${user.direccion?.prefectura || ''}, ${user.direccion?.ciudad || ''}, ${user.direccion?.barrio || ''}, ${user.direccion?.numero || ''}`}
              </Text>
              <Text style={styles.label}>Código Postal:</Text>
              <Text>{user.direccion?.codigoPostal || 'No disponible'}</Text>
              <Text style={styles.subtitle}>Producción</Text>
            </View>
          </View>
        }
        data={user.productionData || []}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 30, paddingHorizontal: 16 }}
        ListEmptyComponent={<Text>No hay datos de producción para este usuario.</Text>}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    paddingVertical: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  userInfo: {
    backgroundColor: '#f3f3f3',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  label: {
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
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
