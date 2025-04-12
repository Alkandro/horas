import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { doc, updateDoc, getDocs, collection, query, where, setDoc } from 'firebase/firestore';
import { firestore } from '../firebaseConfig';
import dayjs from 'dayjs';

const EditarRegistroScreen = ({ route, navigation }) => {
  const { registro } = route.params;

  const [cantidad, setCantidad] = useState(String(registro.cantidad));
  const [tipoPieza, setTipoPieza] = useState(registro.tipoPieza);
  const [valorNudo] = useState(String(registro.valorNudo)); // solo mostrar
  const [nudos] = useState(String(registro.nudos));         // solo mostrar

  const handleGuardar = async () => {
    try {
      const docRef = doc(firestore, 'production', registro.id);
      const nuevaCantidad = parseFloat(cantidad);
  
      // Actualizar el documento de producción
      await updateDoc(docRef, {
        cantidad: nuevaCantidad,
        tipoPieza,
      });
  
      // Calcular el nuevo total mensual
      const userId = registro.userId;
      const fecha = registro.fecha;
  
      if (!userId || !fecha) {
        throw new Error('userId o fecha no definidos para el registro');
      }
  
      const date = dayjs(fecha);
      const año = date.year();
      const mes = date.month() + 1;
  
      const snapshot = await getDocs(
        query(
          collection(firestore, 'production'),
          where('userId', '==', userId)
        )
      );
  
      const registrosDelMes = snapshot.docs
        .map(doc => doc.data())
        .filter(d => {
          const f = dayjs(d.fecha);
          return f.year() === año && f.month() + 1 === mes;
        });
  
      const nuevoTotal = registrosDelMes.reduce((acc, item) => {
        const v = Number(item.valorNudo);
        const n = Number(item.nudos);
        const c = Number(item.cantidad);
        if (!isNaN(v) && !isNaN(n) && !isNaN(c)) {
          return acc + v * n * c;
        }
        return acc;
      }, 0);
  
      const resumenId = `${userId}_${año}_${mes}`;
      await setDoc(doc(firestore, 'resumenMensual', resumenId), {
        userId,
        año,
        mes,
        total: nuevoTotal,
        actualizadoEl: new Date(),
      });
  
      Alert.alert('Éxito', 'Registro y resumen mensual actualizados');
      navigation.goBack();
    } catch (error) {
      console.error('Error al actualizar:', error);
      Alert.alert('Error', 'No se pudo actualizar el registro y el resumen mensual');
    }
  };
  

  const handleCancelar = () => {
    navigation.goBack();
  };

  const recalcularResumenMensual = async (userId, fechaISO) => {
    const fecha = dayjs(fechaISO);
    const año = fecha.year();
    const mes = fecha.month() + 1;

    const q = query(
      collection(firestore, 'production'),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    const datos = snapshot.docs
      .map(doc => doc.data())
      .filter(item => {
        const itemFecha = dayjs(item.fecha);
        return itemFecha.year() === año && itemFecha.month() + 1 === mes;
      });

    const total = datos.reduce((acc, item) => {
      return acc + Number(item.valorNudo) * Number(item.nudos) * Number(item.cantidad);
    }, 0);

    const resumenId = `${userId}_${año}_${mes}`;
    const resumenDocRef = doc(firestore, 'resumenMensual', resumenId);
    await setDoc(resumenDocRef, {
      userId,
      año,
      mes,
      total,
      actualizadoEl: new Date()
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Editar Registro</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Tipo de pieza</Text>
            <TextInput
              value={tipoPieza}
              onChangeText={setTipoPieza}
              style={styles.input}
              placeholder="Tipo de pieza"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Cantidad</Text>
            <TextInput
              value={cantidad}
              onChangeText={setCantidad}
              style={styles.input}
              placeholder="Cantidad"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Valor por nudo</Text>
            <TextInput
              value={valorNudo}
              editable={false}
              style={[styles.input, styles.readOnly]}
              placeholder="Valor por nudo"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Nudos por pieza</Text>
            <TextInput
              value={nudos}
              editable={false}
              style={[styles.input, styles.readOnly]}
              placeholder="Nudos por pieza"
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button title="Guardar Cambios" onPress={handleGuardar} />
            <View style={{ height: 10 }} />
            <Button title="Cancelar" color="#888" onPress={handleCancelar} />
          </View>
         

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  readOnly: {
    backgroundColor: '#eee',
    color: '#777',
  },
  buttonContainer: {
    marginTop: 20,
  },
});

export default EditarRegistroScreen;
