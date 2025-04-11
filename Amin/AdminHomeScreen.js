import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Button,SafeAreaView,Alert } from 'react-native';
import { collection, getDocs, query, where, doc, deleteDoc } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
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
        snapshot.docs
          .filter((docSnap) => docSnap.data().role !== 'admin') // ⛔ excluir admin
          .map(async (docSnap) => {
      
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
  const confirmarEliminacionUsuario = (userId) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que quieres eliminar este usuario?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(firestore, 'users', userId));
              fetchUsersData(true); // Refrescar lista
            } catch (error) {
              console.error('Error al eliminar usuario:', error);
              Alert.alert('Error', 'No se pudo eliminar el usuario.');
            }
          },
        },
      ]
    );
  };
  
  const eliminarUsuario = async (userId) => {
    try {
      await deleteDoc(doc(firestore, 'users', userId));
      setUsersData(usersData.filter(u => u.userId !== userId));
      Alert.alert('Usuario eliminado');
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      Alert.alert('Error', 'No se pudo eliminar el usuario');
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel de Administración</Text>
      <FlatList
  data={usersData}
  keyExtractor={(item) => item.userId}
  renderItem={({ item }) => (
    <TouchableOpacity onPress={() => handleUserPress(item)} style={styles.userCard}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>{item.nombre} {item.apellido}</Text>
          <Text>Teléfono: {item.telefono || 'No disponible'}</Text>
          <Text style={styles.userName}>Usuario: {item.email}</Text>
        </View>
        <TouchableOpacity
          onPress={() => confirmarEliminacionUsuario(item.userId)}
          style={styles.iconContainer}
        >
          <Icon name="delete" size={20} color="#d32f2f" />
        </TouchableOpacity>
      </View>
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
  iconContainer: {
    paddingLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
});

export default AdminHomeScreen;
