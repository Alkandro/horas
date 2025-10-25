import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { firestore } from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from "react-i18next";

const AdminArticulosScreen = ({ navigation }) => {
  const { t } = useTranslation();
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
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="cube" size={24} color="#0066ff" />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.nombre}>{item.nombre}</Text>
          <Text style={styles.tipo}>{t("Tipo")}: {item.tipo}</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => navigation.navigate('EditarArticulo', { articulo: item })}
          >
            <Ionicons name="create-outline" size={22} color="#0066ff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => eliminarArticulo(item.id)}
          >
            <Ionicons name="trash-outline" size={22} color="#ff4444" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Ionicons name="cash-outline" size={18} color="#b0b0b0" />
          <Text style={styles.detailLabel}>{t("Valor por nudo")}:</Text>
          <Text style={styles.detailValue}>¥{item.valorNudo}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="git-network-outline" size={18} color="#b0b0b0" />
          <Text style={styles.detailLabel}>{t("Nudos por pieza")}:</Text>
          <Text style={styles.detailValue}>{item.nudos}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.title}>{t("Artículos Creados")}</Text>
        <FlatList
          data={articulos}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor="#0066ff"
              colors={['#0066ff']}
            />
          }
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={64} color="#3a3a3a" />
              <Text style={styles.emptyText}>{t("No hay artículos creados aún")}</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#1a1a1a' 
  },
  container: { 
    padding: 20, 
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#ffffff',
  },
  card: {
    backgroundColor: '#252525',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1a2a3a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  headerText: {
    flex: 1,
  },
  nombre: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 4,
  },
  tipo: {
    fontSize: 14,
    color: '#b0b0b0',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a2a3a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#3a3a3a',
    marginBottom: 15,
  },
  details: {
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#b0b0b0',
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666666',
    marginTop: 20,
    fontSize: 16,
  },
});

export default AdminArticulosScreen;
