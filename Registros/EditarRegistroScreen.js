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
import { doc, updateDoc } from 'firebase/firestore';
import { firestore } from '../firebaseConfig';

const EditarRegistroScreen = ({ route, navigation }) => {
  const { registro } = route.params;

  const [cantidad, setCantidad] = useState(String(registro.cantidad));
  const [tipoPieza, setTipoPieza] = useState(registro.tipoPieza);
  const [valorNudo] = useState(String(registro.valorNudo)); // solo mostrar
  const [nudos] = useState(String(registro.nudos));         // solo mostrar

  const handleGuardar = async () => {
    try {
      const docRef = doc(firestore, 'production', registro.id);
      await updateDoc(docRef, {
        cantidad: parseFloat(cantidad),
        tipoPieza,
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
