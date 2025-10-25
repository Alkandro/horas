import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DropDownPicker from 'react-native-dropdown-picker';
import { firestore } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import dayjs from 'dayjs';
import { useTranslation } from "react-i18next";
import { Ionicons } from '@expo/vector-icons';

const AdminUserMonthlySummaryScreen = ({ route }) => {
  const { t } = useTranslation();
  const { userId } = route.params;
  const currentDate = dayjs();
  const [mesSeleccionado, setMesSeleccionado] = useState(currentDate.month() + 1);
  const [añoSeleccionado, setAñoSeleccionado] = useState(currentDate.year());
  const [resumenMensual, setResumenMensual] = useState(null);
  const [openMes, setOpenMes] = useState(false);
  const [openAño, setOpenAño] = useState(false);
  const [itemsMes, setItemsMes] = useState(
    [...Array(12)].map((_, i) => ({ label: `${i + 1}月`, value: i + 1 }))
  );
  const [itemsAño, setItemsAño] = useState(
    [...Array(5)].map((_, i) => {
      const y = currentDate.year() - i;
      return { label: `${y}`, value: y };
    })
  );

  useEffect(() => {
    const fetchResumen = async () => {
      try {
        const q = query(
          collection(firestore, 'resumenMensual'),
          where('userId', '==', userId),
          where('año', '==', añoSeleccionado),
          where('mes', '==', mesSeleccionado)
        );

        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const data = snapshot.docs[0].data();
          setResumenMensual(data);
        } else {
          setResumenMensual(null);
        }
      } catch (error) {
        console.error(t('Error al obtener el resumen mensual:'), error);
      }
    };

    fetchResumen();
  }, [mesSeleccionado, añoSeleccionado, userId]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.title}>{t("Resumen Mensual del Usuario")}</Text>

        <View style={styles.dropdowns}>
          <DropDownPicker
            open={openMes}
            value={mesSeleccionado}
            items={itemsMes}
            setOpen={setOpenMes}
            setValue={setMesSeleccionado}
            setItems={setItemsMes}
            containerStyle={{ flex: 1, marginRight: 5 }}
            style={styles.dropdown}
            textStyle={styles.dropdownText}
            dropDownContainerStyle={styles.dropdownListMeses}
          />

          <DropDownPicker
            open={openAño}
            value={añoSeleccionado}
            items={itemsAño}
            setOpen={setOpenAño}
            setValue={setAñoSeleccionado}
            setItems={setItemsAño}
            containerStyle={{ flex: 1, marginLeft: 5 }}
            style={styles.dropdown}
            textStyle={styles.dropdownText}
            dropDownContainerStyle={styles.dropdownListAños}
          />
        </View>

        {resumenMensual ? (
          <View style={styles.summaryCard}>
            <View style={styles.iconContainer}>
              <Ionicons name="calendar" size={48} color="#0066ff" />
            </View>
            <Text style={styles.label}>{t("Total del mes")}:</Text>
            <Text style={styles.value}>¥{Math.round(resumenMensual.total)}</Text>
            <View style={styles.badge}>
              <Ionicons name="checkmark-circle" size={20} color="#00ff88" />
              <Text style={styles.badgeText}>{t("Calculado")}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#3a3a3a" />
            <Text style={styles.emptyText}>{t("No hay resumen para este mes")}.</Text>
          </View>
        )}
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
    padding: 20,
    backgroundColor: '#1a1a1a',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
    color: '#ffffff',
  },
  dropdowns: {
    flexDirection: 'row',
    marginBottom: 20,
    zIndex: 1000,
  },
  dropdown: {
    backgroundColor: '#2a2a2a',
    borderColor: '#3a3a3a',
    borderRadius: 10,
  },
  dropdownText: {
    color: '#ffffff',
    fontSize: 16,
  },
  dropdownListMeses: {
    backgroundColor: '#2a2a2a',
    borderColor: '#3a3a3a',
    maxHeight: 500, // Altura suficiente para mostrar todos los 12 meses
  },
  dropdownListAños: {
    backgroundColor: '#2a2a2a',
    borderColor: '#3a3a3a',
    maxHeight: 500, // Altura suficiente para 5 años
  },
  summaryCard: {
    backgroundColor: '#252525',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1a2a3a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#b0b0b0',
    marginBottom: 10,
  },
  value: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#00ff88',
    marginBottom: 20,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a3a2a',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#00ff88',
  },
  badgeText: {
    color: '#00ff88',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666666',
    marginTop: 20,
    fontSize: 16,
    fontStyle: 'italic',
  },
});

export default AdminUserMonthlySummaryScreen;