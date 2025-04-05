import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Button,SafeAreaView } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import { firestore, auth } from '../firebaseConfig';

const AdminHomeScreen = ({ navigation }) => {
  const [usersData, setUsersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);


  const fetchUsersData = async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
  
      const usersCollection = collection(firestore, 'users');
      const snapshot = await getDocs(usersCollection);
  
      const usersList = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const userData = docSnap.data();
          const userId = docSnap.id;
  
          const productionQuery = query(
            collection(firestore, 'production'),
            where('userId', '==', userId)
          );
          const productionSnapshot = await getDocs(productionQuery);
          const productionData = productionSnapshot.docs.map((prodDoc) => prodDoc.data());
  
          return {
            userId,
            ...userData,
            productionData: productionData.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)),
          };
        })
      );
  
      setUsersData(usersList);
    } catch (e) {
      setError('Error al obtener datos de usuarios.');
      console.error('Error fetching admin data:', e);
    } finally {
      if (isRefreshing) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  // 🔁 Se ejecuta cada vez que la pantalla vuelve a estar activa
  useFocusEffect(
    useCallback(() => {
      fetchUsersData();
    }, [])
  );
  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleUserPress = (user) => {
    navigation.navigate('AdminUserDetails', { user });
  };

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
    <TouchableOpacity onPress={() => handleUserPress(item)} style={styles.userCard}>
      <Text style={styles.userName}>Usuario: {item.email}</Text>
      <Text>Piezas Hechas: {item.productionData?.reduce((sum, prod) => sum + prod.cantidad, 0)}</Text>
      <Text>Nudos Totales: {item.productionData?.reduce((sum, prod) => sum + prod.nudos, 0)}</Text>
    </TouchableOpacity>
  )}
  refreshing={refreshing}
  onRefresh={() => fetchUsersData(true)}
/>

      <Button title="Crear Nuevo Usuario" onPress={() => navigation.navigate('AdminCreateUser')} />
      <Button title="Cerrar Sesión" onPress={handleLogout} />
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
    marginTop:60,
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
});

export default AdminHomeScreen;
