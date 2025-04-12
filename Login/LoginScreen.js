import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert, ActivityIndicator, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { auth, firestore } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Toast from 'react-native-toast-message';
import { changeLanguage } from '../i18n';

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
        const role = email === 'anne@a.com' ? 'admin' : 'user';
        await setDoc(userDocRef, { email: user.email, role });
        console.log('Nuevo usuario creado en Firestore con rol:', role);
      }
    } catch (e) {
      let mensaje = 'Ocurrió un error inesperado. Intenta nuevamente.';

      if (e.code === 'auth/invalid-credential') {
        mensaje = 'Correo o contraseña inválidos, o tu cuenta ha sido deshabilitada.';
      } else if (e.code === 'auth/user-disabled') {
        mensaje = 'Tu cuenta ha sido deshabilitada por un administrador.';
      } else if (e.code === 'auth/user-not-found') {
        mensaje = 'Usuario no encontrado.';
      }

      Toast.show({
        type: 'error',
        text1: 'Error de inicio de sesión',
        text2: mensaje,
        position: 'top',
      });
    }

    setLoading(false);
  };

  const renderFlag = (lang, icon) => (
    <TouchableOpacity onPress={() => changeLanguage(lang)}>
      <Image source={icon} style={styles.flag} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.languageRow}>
        {renderFlag('es', require('../assets/flags/flag.png'))}
        {renderFlag('en', require('../assets/flags/united-states.png'))}
        {renderFlag('ja', require('../assets/flags/japan.png'))}
        {renderFlag('pt', require('../assets/flags/brazil.png'))}
      </View>
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  languageRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#fff',
    gap: 10,
  },
  flag: {
    width: 32,
    height: 22,
    marginHorizontal: 5,
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
});

export default LoginScreen;