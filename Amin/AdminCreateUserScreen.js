import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, firestore } from '../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';

const AdminCreateUserScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleCreateUser = async () => {
    setLoading(true);
    setMessage('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      await setDoc(doc(firestore, 'users', newUser.uid), {
        email,
        role,
      });

      setMessage('Usuario creado exitosamente');
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error('Error al crear usuario:', error);
      setMessage(error.message || 'Error al crear usuario.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Nuevo Usuario</Text>
      <TextInput placeholder="Correo" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput placeholder="Contraseña" value={password} secureTextEntry onChangeText={setPassword} style={styles.input} />
      <TextInput placeholder="Rol (admin o user)" value={role} onChangeText={setRole} style={styles.input} />
      <Button title="Crear Usuario" onPress={handleCreateUser} disabled={loading} />
      {loading && <ActivityIndicator />}
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 18, marginBottom: 10 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10 },
  message: { marginTop: 10, textAlign: 'center' },
});

export default AdminCreateUserScreen;
