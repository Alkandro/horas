import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { firestore } from '../firebaseConfig';

const EditarRegistroScreen = ({ route, navigation }) => {
  const { registro } = route.params;

  const [cantidad, setCantidad] = useState(String(registro.cantidad));
  const [tipoPieza, setTipoPieza] = useState(registro.tipoPieza);
  const [valorNudo, setValorNudo] = useState(String(registro.valorNudo));
  const [nudos, setNudos] = useState(String(registro.nudos));

  const handleGuardar = async () => {
    try {
      const docRef = doc(firestore, 'production', registro.id);
      await updateDoc(docRef, {
        cantidad: parseFloat(cantidad),
        tipoPieza,
        valorNudo: parseFloat(valorNudo),
        nudos: parseInt(nudos),
      });

      Alert.alert('Éxito', 'Registro actualizado');
      navigation.goBack();
    } catch (error) {
      console.error('Error al actualizar:', error);
      Alert.alert('Error', 'No se pudo actualizar el registro');
    }
  };

  const handleCancelar = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Registro</Text>

      <TextInput
        value={tipoPieza}
        onChangeText={setTipoPieza}
        style={styles.input}
        placeholder="Tipo de pieza"
      />
      <TextInput
        value={cantidad}
        onChangeText={setCantidad}
        style={styles.input}
        placeholder="Cantidad"
        keyboardType="numeric"
      />
      <TextInput
        value={valorNudo}
        onChangeText={setValorNudo}
        style={styles.input}
        placeholder="Valor por nudo"
        keyboardType="numeric"
      />
      <TextInput
        value={nudos}
        onChangeText={setNudos}
        style={styles.input}
        placeholder="Nudos por pieza"
        keyboardType="numeric"
      />

      <View style={styles.buttonContainer}>
        <Button title="Guardar Cambios" onPress={handleGuardar} />
        <View style={{ height: 10 }} />
        <Button title="Cancelar" color="#888" onPress={handleCancelar} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', flex: 1 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  buttonContainer: {
    marginTop: 10,
  },
});

export default EditarRegistroScreen;
