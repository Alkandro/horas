import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import { auth, firestore } from './firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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

      const userDocRef = doc(firestore, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        // Asignamos rol por defecto: si es anne@a.com => admin, si no => user
        const role = email === 'anne@a.com' ? 'admin' : 'user';
        await setDoc(userDocRef, { email: user.email, role });
        console.log('Nuevo usuario creado en Firestore con rol:', role);
      }

      // No navegamos manualmente, App.js lo hace automáticamente según userRole

    } catch (e) {
      setError(e.message || 'Error de autenticación. Credenciales incorrectas.');
      console.error('Error de login:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
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
        <View style={{ marginTop: 20 }}>
          <Button
            title="¿No tienes una cuenta? Crear una"
            onPress={() => navigation.navigate('Register')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
  
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 15, paddingHorizontal: 10, borderRadius: 5, backgroundColor: 'white' },
  error: { color: 'red', marginBottom: 10, textAlign: 'center' },
  loading: { marginTop: 15 },
});

export default LoginScreen;
