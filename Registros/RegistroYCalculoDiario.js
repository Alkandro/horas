import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, firestore } from '../firebaseConfig';
import { collection, getDocs, addDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';
import dayjs from 'dayjs';
import { useTranslation } from "react-i18next";

const RegistroYCalculoDiario = () => {
  const { t } = useTranslation(); // Hook para traducción
  const [cantidadPiezas, setCantidadPiezas] = useState('');
  const [totalDiario, setTotalDiario] = useState(0);
  const [articulos, setArticulos] = useState([]);
  const [tipoPieza, setTipoPieza] = useState('');
  const [valorNudo, setValorNudo] = useState(0);
  const [cantidadNudosPorPieza, setCantidadNudosPorPieza] = useState(0);
  const [detalles, setDetalles] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const cargarArticulos = async () => {
    try {
      const snapshot = await getDocs(collection(firestore, 'articulos'));
      const lista = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          nombre: data.nombre,
          valorNudo: parseFloat(data.valorNudo || 0),
          nudos: parseFloat(data.nudos || 0),
        };
      });
      setArticulos(lista);
    } catch (error) {
      console.error(t('Error al cargar artículos:'), error);
    }
  };

  useEffect(() => {
    cargarArticulos();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    cargarArticulos().then(() => setRefreshing(false));
  }, []);

  const handleSeleccionArticulo = (nombre) => {
    setTipoPieza(nombre);
    const articulo = articulos.find(a => a.nombre === nombre);

    if (articulo) {
      setValorNudo(articulo.valorNudo ?? 0);
      setCantidadNudosPorPieza(articulo.nudos ?? 0);
    } else {
      console.warn(t('Artículo no encontrado:'), nombre);
      setValorNudo(0);
      setCantidadNudosPorPieza(0);
    }
  };

  const agregarAlTotal = () => {
    const piezas = parseFloat(cantidadPiezas);
    if (!tipoPieza || isNaN(piezas) || piezas <= 0) {
      Alert.alert(t('Aviso'), t('Por favor seleccione un artículo y cantidad válida.'));
      return;
    }

    const subtotal = valorNudo * cantidadNudosPorPieza * piezas;
    const nuevoDetalle = {
      tipoPieza,
      piezas,
      nudos: cantidadNudosPorPieza,
      valorNudo: valorNudo,
      subtotal,
    };

    setDetalles(prev => [...prev, nuevoDetalle]);
    setTotalDiario(prev => prev + subtotal);
    setCantidadPiezas('');
  };

  const guardarEnFirestore = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId || detalles.length === 0) return;

      const datosIncompletos = detalles.some((detalle) =>
        !detalle.tipoPieza || detalle.piezas == null || detalle.nudos == null || detalle.valorNudo == null
      );

      if (datosIncompletos) {
        Alert.alert(t('Error'), t('Uno o más artículos tienen datos incompletos. Verifica antes de guardar'));
        return;
      }

      const now = dayjs();
      const año = now.year();
      const mes = now.month() + 1;
      const resumenId = `${userId}_${año}_${mes}`;
      const resumenRef = doc(firestore, 'resumenMensual', resumenId);
      const resumenDoc = await getDoc(resumenRef);
      const totalPrevio = resumenDoc.exists() ? resumenDoc.data().total : 0;

      for (const detalle of detalles) {
        await addDoc(collection(firestore, 'production'), {
          userId,
          cantidad: detalle.piezas,
          nudos: detalle.nudos,
          tipoPieza: detalle.tipoPieza,
          valorNudo: detalle.valorNudo,
          fecha: new Date().toISOString(),
        });
      }

      await setDoc(resumenRef, {
        userId,
        año,
        mes,
        total: totalPrevio + totalDiario,
        creadoEl: new Date(),
      });

      await AsyncStorage.setItem('totalPiezas', JSON.stringify(totalDiario));
      Alert.alert(t('Éxito'), t('Datos guardados correctamente'));
      setDetalles([]);
      setTotalDiario(0);
    } catch (error) {
      console.error(t('Error al guardar en Firestore:'), error);
      Alert.alert(t('Error'), t('No se pudo guardar en Firestore'));
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      keyboardShouldPersistTaps="handled"
    >
      <Picker
        selectedValue={tipoPieza}
        onValueChange={handleSeleccionArticulo}
        style={styles.picker}
      >
        <Picker.Item label={t("Seleccione un artículo")} value="" />
        {articulos.map((articulo) => (
          <Picker.Item key={articulo.id} label={articulo.nombre} value={articulo.nombre} />
        ))}
      </Picker>

      {tipoPieza ? (
        <View style={{ marginBottom: 15 }}>
          <Text style={styles.boldText}>{t("Valor por nudo")}: ¥{valorNudo}</Text>
          <Text style={styles.boldText}>{t("Nudos por pieza")}: {cantidadNudosPorPieza}</Text>
        </View>
      ) : null}

      <TextInput
        placeholder={t("Cantidad de piezas")}
        keyboardType="numeric"
        onChangeText={setCantidadPiezas}
        value={cantidadPiezas}
        style={styles.input}
      />

      <Button title={t("Agregar")} onPress={agregarAlTotal} />

      <View style={{ marginVertical: 20 }}>
        <Text style={styles.subtitle}>{t("Resumen del día")}:</Text>
        {detalles.map((item, index) => (
          <Text key={index} style={styles.item}>
            {item.tipoPieza} - {item.piezas} {t("piezas - Subtotal")}: ¥{item.subtotal.toFixed(0)}
          </Text>
        ))}
      </View>

      <Text style={styles.result}>
        {t("Total diario")}: <Text style={styles.boldText}>¥{totalDiario.toFixed(0)}</Text>
      </Text>

      <Button title={t("Guardar y Enviar")} onPress={guardarEnFirestore} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    padding: 10,
    marginBottom: 12,
    borderRadius: 5,
  },
  picker: {
    marginBottom: 20,
  },
  subtitle: {
    fontWeight: 'bold',
    fontSize: 17,
    marginBottom: 8,
  },
  result: {
    fontSize: 18,
    marginTop: 10,
    marginBottom: 15,
  },
  boldText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  item: {
    fontSize: 15,
    marginBottom: 4,
  },
});

export default RegistroYCalculoDiario;