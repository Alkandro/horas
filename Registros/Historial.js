import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  RefreshControl,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { firestore, auth } from '../firebaseConfig';
import { Picker } from '@react-native-picker/picker';
import dayjs from 'dayjs';
import { useNavigation } from '@react-navigation/native';
import { Swipeable } from 'react-native-gesture-handler';

const Historial = ({ navigation }) => {
  const [historial, setHistorial] = useState([]);
  const [añoSeleccionado, setAñoSeleccionado] = useState(dayjs().year());
  const [mesSeleccionado, setMesSeleccionado] = useState(dayjs().month() + 1);
  const [refreshing, setRefreshing] = useState(false);
  

  const cargarHistorial = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const snapshot = await getDocs(collection(firestore, 'production'));
      const data = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(item => item.userId === userId)
        .map(item => ({
          ...item,
          fecha: dayjs(item.fecha),
        }));

      // Mantener solo 2 meses hacia atrás
      const dosMesesAtras = dayjs().subtract(2, 'month');
      const actuales = data.filter(item => item.fecha.isAfter(dosMesesAtras));
      const aEliminar = data.filter(item => item.fecha.isBefore(dosMesesAtras));

      for (const item of aEliminar) {
        await deleteDoc(doc(firestore, 'production', item.id));
      }

      setHistorial(actuales);
    } catch (error) {
      console.error('Error al cargar historial:', error);
      Alert.alert('Error', 'No se pudo cargar el historial');
    }
  };

  useEffect(() => {
    cargarHistorial();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    cargarHistorial().then(() => setRefreshing(false));
  }, []);

  const historialFiltrado = historial.filter(item => {
    return (
      item.fecha.year() === añoSeleccionado &&
      item.fecha.month() + 1 === mesSeleccionado
    );
  });

  const totalMensual = historialFiltrado.reduce((acc, item) => {
    const valor = Number(item.valorNudo);
    const nudos = Number(item.nudos);
    const cantidad = Number(item.cantidad);
  
    if (!isNaN(valor) && !isNaN(nudos) && !isNaN(cantidad)) {
      return acc + (valor * nudos * cantidad);
    }
    return acc;
  }, 0);
  

  const eliminarRegistro = async (id) => {
    try {
      await deleteDoc(doc(firestore, 'production', id));
      cargarHistorial();
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  };

  const renderRightActions = (item) => (
    <View style={styles.rightActions}>
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => {
          navigation.navigate('EditarRegistro', { registro: item });
        }}
      >
        <Text style={styles.actionText}>Editar</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() =>
          Alert.alert(
            'Confirmar',
            '¿Eliminar este registro?',
            [
              { text: 'Cancelar', style: 'cancel' },
              {
                text: 'Eliminar',
                onPress: () => eliminarRegistro(item.id),
                style: 'destructive',
              },
            ]
          )
        }
      >
        <Text style={styles.actionText}>Eliminar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial de Producción</Text>

      <View style={styles.selectores}>
        <Picker
          selectedValue={añoSeleccionado}
          onValueChange={setAñoSeleccionado}
          style={styles.picker}
        >
          {[...new Set(historial.map(item => item.fecha.year()))].map(a => (
            <Picker.Item key={a} label={`${a}`} value={a} />
          ))}
        </Picker>

        <Picker
          selectedValue={mesSeleccionado}
          onValueChange={setMesSeleccionado}
          style={styles.picker}
        >
          {[...Array(12).keys()].map(m => (
            <Picker.Item key={m + 1} label={`${m + 1}月`} value={m + 1} />
          ))}
        </Picker>
      </View>

      <Text style={styles.total}>Total mensual: ¥{Math.round(totalMensual)}</Text>

      <FlatList
        data={historialFiltrado.sort((a, b) => b.fecha - a.fecha)}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <Swipeable renderRightActions={() => renderRightActions(item)}>
            <View style={styles.item}>
              <Text style={styles.fecha}>{item.fecha.format('YYYY-MM-DD')}</Text>
              <Text>Tipo: {item.tipoPieza}</Text>
              <Text>Piezas: {item.cantidad}</Text>
              <Text>Ganancia: ¥{Math.round(item.valorNudo * item.nudos * item.cantidad)}</Text>
            </View>
          </Swipeable>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No hay registros para este mes.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  selectores: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  picker: { flex: 1 },
  total: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  item: { backgroundColor: '#f1f1f1', padding: 12, marginBottom: 8, borderRadius: 5 },
  fecha: { fontWeight: 'bold', marginBottom: 4 },
  rightActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  deleteButton: {
    backgroundColor: '#ff5252',
    justifyContent: 'center',
    padding: 15,
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
  },
  editButton: {
    backgroundColor: '#4caf50',
    justifyContent: 'center',
    padding: 15,
  },
  actionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Historial;
