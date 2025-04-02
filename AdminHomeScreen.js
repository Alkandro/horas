import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { firestore } from './firebaseConfig'; // Importa tu instancia de Firestore

const AdminHomeScreen = () => {
  const [usersData, setUsersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        const usersCollection = firestore().collection('users');
        const snapshot = await usersCollection.get();
        const usersList = snapshot.docs.map(doc => ({
          userId: doc.id,
          ...doc.data(),
        }));
        setUsersData(usersList);
      } catch (e) {
        setError('Error al obtener datos de usuarios.');
        console.error('Error fetching admin data:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchUsersData();
  }, []);

  if (loading) {
    return <View><Text>Cargando datos...</Text></View>;
  }

  if (error) {
    return <View><Text>Error: {error}</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel de Administración</Text>
      <FlatList
        data={usersData}
        keyExtractor={(item) => item.userId}
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <Text style={styles.userName}>Usuario: {item.email}</Text>
            <Text>Próximamente: Datos de producción por usuario</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  userCard: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  userName: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  productionItem: { // Asegúrate de que este estilo esté definido si lo usas
    marginLeft: 10,
    marginBottom: 5,
    borderLeftWidth: 1,
    borderColor: '#ccc',
    paddingLeft: 10,
  },
});

export default AdminHomeScreen;