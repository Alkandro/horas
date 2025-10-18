import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { firestore, auth } from '../firebaseConfig';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

const ResumenMensual = () => {
  const { t } = useTranslation();
  const [resumenes, setResumenes] = useState([]);

  const cargarResumenes = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const q = query(collection(firestore, 'resumenMensual'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => doc.data());

    const ordenado = data.sort((a, b) => {
      if (a.año !== b.año) return b.año - a.año;
      return b.mes - a.mes;
    });

    setResumenes(ordenado);
  };

  useFocusEffect(
    useCallback(() => {
      cargarResumenes();
    }, [])
  );

  const getMesNombre = (mes) => {
    const meses = [
      t('Enero'), t('Febrero'), t('Marzo'), t('Abril'), t('Mayo'), t('Junio'),
      t('Julio'), t('Agosto'), t('Septiembre'), t('Octubre'), t('Noviembre'), t('Diciembre')
    ];
    return meses[mes - 1] || mes;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.title}>{t("Resumen Histórico Mensual")}</Text>
        
        <FlatList
          data={resumenes}
          keyExtractor={(item, index) => `${item.año}-${item.mes}-${index}`}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={60} color="#666666" />
              <Text style={styles.emptyText}>{t("No hay resúmenes mensuales")}</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.dateContainer}>
                  <Ionicons name="calendar" size={20} color="#0066ff" />
                  <Text style={styles.mesText}>{getMesNombre(item.mes)}</Text>
                </View>
                <View style={styles.yearBadge}>
                  <Text style={styles.yearText}>{item.año}</Text>
                </View>
              </View>
              
              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>{t("Total")}:</Text>
                <Text style={styles.totalAmount}>¥{Math.round(item.total)}</Text>
              </View>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  container: { 
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: '#1a1a1a',
  },
  title: { 
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#ffffff',
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 15,
  },
  card: {
    backgroundColor: '#252525',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#3a3a3a',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mesText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 10,
  },
  yearBadge: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  yearText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#b0b0b0',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    color: '#b0b0b0',
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00ff88',
  },
});

export default ResumenMensual;