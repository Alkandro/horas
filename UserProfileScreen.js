import React, { useEffect, useState }from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { auth, firestore } from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';




const UserProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(firestore, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      }
    };
  
    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil del Usuario</Text>
      {user && userData ? (
  <>
    <Text style={styles.label}>Correo: {user.email}</Text>
    <Text style={styles.label}>Nombre: {userData.nombre}</Text>
    <Text style={styles.label}>Apellido: {userData.apellido}</Text>
    <Text style={styles.label}>Teléfono: {userData.telefono}</Text>
    <Text style={styles.label}>Dirección: {userData.direccion}</Text>
  </>
) : (
  <Text>Cargando información del perfil...</Text>
)}
      <Button title="Cerrar Sesión" onPress={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  value: {
    marginBottom: 20,
    fontSize: 16,
  },
});

export default UserProfileScreen;
