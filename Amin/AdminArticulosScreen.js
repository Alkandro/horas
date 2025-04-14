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
import Icon from 'react-native-vector-icons/Feather'; // O Ionicons si prefieres
import { useTranslation } from "react-i18next";

const AdminArticulosScreen = ({ navigation }) => {
  const { t } = useTranslation(); // Hook para traducción
  const [articulos, setArticulos] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const cargarArticulos = async () => {
    try {
      const snapshot = await getDocs(collection(firestore, 'articulos'));
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setArticulos(items);
    } catch (error) {
      console.error(t('Error al cargar artículos'), error);
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
      t('Confirmar'),
      t('¿Deseas eliminar este artículo?'),
      [
        { text: t('Cancelar'), style: 'cancel' },
        {
          text: t('Eliminar'),
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
    <View style={styles.item}>
      <View style={styles.row}>
        <Text style={styles.nombre}>{item.nombre}</Text>
        <View style={styles.iconos}>
          <TouchableOpacity onPress={() => navigation.navigate('EditarArticulo', { articulo: item })}>
            <Icon name="edit" size={18} color="#007bff" style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => eliminarArticulo(item.id)}>
            <Icon name="trash-2" size={18} color="#ff4444" style={styles.icon} />
          </TouchableOpacity>
        </View>
      </View>
      <Text>{t("Tipo")}: {item.tipo}</Text>
      <Text>{t("Valor por nudo")}: ¥{item.valorNudo}</Text>
      <Text>{t("Nudos por pieza")}: {item.nudos}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>{t("Artículos Creados")}</Text>
        <FlatList
          data={articulos}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ paddingBottom: 30 }}
          ListEmptyComponent={<Text style={styles.empty}>{t("No hay artículos creados aún")}</Text>}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 20, flex: 1 },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  item: {
    padding: 12,
    borderRadius: 5,
    backgroundColor: '#f1f1f1',
    marginBottom: 10,
  },
  nombre: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconos: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginLeft: 20,
  },
  empty: {
    textAlign: 'center',
    color: '#777',
    marginTop: 20,
  },
});

export default AdminArticulosScreen;
