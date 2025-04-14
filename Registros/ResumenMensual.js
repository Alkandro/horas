import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore, auth } from '../firebaseConfig';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from "react-i18next";

const ResumenMensual = () => {
  const { t } = useTranslation(); // Hook para traducción
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("Resumen Histórico Mensual")}</Text>
      <FlatList
        data={resumenes}
        keyExtractor={(item, index) => `${item.año}-${item.mes}-${index}`}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.text}>{item.año}.{item.mes}</Text>
            <Text style={styles.total}>{t("Total")}: ¥{Math.round(item.total)}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  item: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  text: { fontSize: 16 },
  total: { fontWeight: 'bold', marginTop: 4 },
});

export default ResumenMensual;
