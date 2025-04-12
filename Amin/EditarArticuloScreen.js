import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  SafeAreaView,
} from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { firestore } from '../firebaseConfig';

const EditarArticuloScreen = ({ route, navigation }) => {
  const { articulo } = route.params;

  const [nombre, setNombre] = useState(articulo.nombre);
  const [tipo, setTipo] = useState(articulo.tipo);
  const [valorNudo, setValorNudo] = useState(String(articulo.valorNudo));
  const [nudos, setNudos] = useState(String(articulo.nudos));

  const handleGuardar = async () => {
    try {
      const docRef = doc(firestore, 'articulos', articulo.id);
      await updateDoc(docRef, {
        nombre,
        tipo,
        valorNudo: parseFloat(valorNudo),
        nudos: parseInt(nudos),
      });
      Alert.alert('Éxito', 'Artículo actualizado');
      navigation.goBack();
    } catch (error) {
      console.error('Error al actualizar artículo:', error);
      Alert.alert('Error', 'No se pudo actualizar el artículo');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Editar Artículo</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Nombre</Text>
            <TextInput
              value={nombre}
              onChangeText={setNombre}
              style={styles.input}
              placeholder="Nombre del artículo"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Tipo</Text>
            <TextInput
              value={tipo}
              onChangeText={setTipo}
              style={styles.input}
              placeholder="Tipo de artículo"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Valor por nudo (¥)</Text>
            <TextInput
              value={valorNudo}
              onChangeText={setValorNudo}
              style={styles.input}
              keyboardType="numeric"
              placeholder="Valor por nudo"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Cantidad de nudos</Text>
            <TextInput
              value={nudos}
              onChangeText={setNudos}
              style={styles.input}
              keyboardType="numeric"
              placeholder="Nudos por pieza"
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button title="Guardar Cambios" onPress={handleGuardar} />
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
  buttonContainer: {
    marginTop: 20,
  },
});

export default EditarArticuloScreen;
