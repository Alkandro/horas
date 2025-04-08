import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { firestore } from '../firebaseConfig';

const AdminArticulosScreen = () => {
  const [articulos, setArticulos] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const cargarArticulos = async () => {
    try {
      const snapshot = await getDocs(collection(firestore, 'articulos'));
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setArticulos(items);
    } catch (error) {
      console.error('Error al cargar artículos:', error);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    cargarArticulos().finally(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    cargarArticulos();
  }, []);

  const eliminarArticulo = async (id) => {
    Alert.alert(
      'Confirmar',
      '¿Estás seguro de que deseas eliminar este artículo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          onPress: async () => {
            await deleteDoc(doc(firestore, 'articulos', id));
            cargarArticulos();
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onLongPress={() => eliminarArticulo(item.id)}
    >
      <Text style={styles.nombre}>{item.nombre}</Text>
      <Text>Tipo: {item.tipo}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Artículos Creados</Text>
        <FlatList
          data={articulos}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ paddingBottom: 30 }}
          ListEmptyComponent={<Text style={styles.empty}>No hay artículos creados aún.</Text>}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: {
    padding: 20,
    flex: 1,
  },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  item: {
    padding: 12,
    borderRadius: 5,
    backgroundColor: '#f1f1f1',
    marginBottom: 10,
  },
  nombre: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  empty: {
    textAlign: 'center',
    color: '#777',
    marginTop: 20,
  },
});

export default AdminArticulosScreen;
