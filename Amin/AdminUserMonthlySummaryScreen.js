import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { firestore } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import dayjs from 'dayjs';
import { useTranslation } from "react-i18next";

const AdminUserMonthlySummaryScreen = ({ route }) => {
  const { t } = useTranslation(); // Hook para traducción
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
        />

        <DropDownPicker
          open={openAño}
          value={añoSeleccionado}
          items={itemsAño}
          setOpen={setOpenAño}
          setValue={setAñoSeleccionado}
          setItems={setItemsAño}
          containerStyle={{ flex: 1, marginLeft: 5 }}
        />
      </View>

      {resumenMensual ? (
        <View style={styles.resumenContainer}>
          <Text style={styles.label}>{t("Total del mes")}:</Text>
          <Text style={styles.valor}>¥{Math.round(resumenMensual.total)}</Text>
        </View>
      ) : (
        <Text style={styles.mensaje}>{t("No hay resumen para este mes")}.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  dropdowns: { flexDirection: 'row', marginBottom: 20 },
  resumenContainer: { backgroundColor: '#e0e0e0', padding: 15, borderRadius: 8 },
  label: { fontWeight: 'bold', fontSize: 16 },
  valor: { fontSize: 20, fontWeight: 'bold', marginTop: 5 },
  mensaje: { textAlign: 'center', marginTop: 30, fontStyle: 'italic' },
});

export default AdminUserMonthlySummaryScreen;
