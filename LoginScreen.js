import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, ActivityIndicator } from 'react-native';

import {  signInWithEmailAndPassword } from 'firebase/auth';

import { auth, firestore } from './firebaseConfig';





const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = await firestore().collection('users').doc(user.uid).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        const { role } = userData;

        if (role === 'admin') {
          navigation.navigate('AdminHome');
        } else if (role === 'user') {
          navigation.navigate('UserHome');
        } else {
          setError('Rol de usuario no reconocido.');
        }
      } else {
        setError('Información de usuario no encontrada.');
      }
    } catch (e) {
      setError(e.message || 'Error de autenticación. Credenciales incorrectas.');
      console.error('Error de login:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>
      <TextInput
        style={styles.input}
        placeholder="Correo Electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title="Iniciar Sesión" onPress={handleLogin} disabled={loading} />
      {loading && <ActivityIndicator style={styles.loading} />}
      <Button
        title="¿No tienes una cuenta? Crear una"
        onPress={() => navigation.navigate('Register')}
        style={styles.registerButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: 'white',
  },
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  loading: {
    marginTop: 15,
  },
  registerButton: {
    marginTop: 20,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
});

export default LoginScreen;