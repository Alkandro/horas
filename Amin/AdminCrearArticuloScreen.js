// import React, { useState } from 'react';
// import {
//   View,
//   TextInput,
//   Button,
//   Text,
//   StyleSheet,
//   Alert,
//   ScrollView,
//   KeyboardAvoidingView,
//   Platform,
// } from 'react-native';
// import { collection, addDoc } from 'firebase/firestore';
// import { useTranslation } from "react-i18next";
// import { firestore } from '../firebaseConfig';

// const AdminCrearArticuloScreen = () => {
//   const { t } = useTranslation(); // Hook para traducción
//   const [nombre, setNombre] = useState('');
//   const [tipo, setTipo] = useState('');
//   const [valorNudo, setValorNudo] = useState('');
//   const [nudos, setNudos] = useState('');
//   const [mensaje, setMensaje] = useState('');

//   const handleCrearArticulo = async () => {
//     if (!nombre || !tipo || !valorNudo || !nudos) {
//       Alert.alert(t('Error'), t('Por favor completa todos los campos'));
//       return;
//     }
  
//     const valorNudoNum = parseFloat(valorNudo.replace(',', '.'));
//     const nudosNum = parseInt(nudos);
  
//     if (isNaN(valorNudoNum) || isNaN(nudosNum)) {
//       Alert.alert(t('Error'), t('Ingresa valores numéricos válidos para el valor del nudo y los nudos.'));
//       return;
//     }
  
//     try {
//       await addDoc(collection(firestore, 'articulos'), {
//         nombre,
//         tipo,
//         valorNudo: valorNudoNum,
//         nudos: nudosNum,
//         creadoEn: new Date().toISOString(),
//       });
//       setMensaje(t('✅ Artículo creado correctamente'));
//       setNombre('');
//       setTipo('');
//       setValorNudo('');
//       setNudos('');
//     } catch (error) {
//       console.error(t('Error al crear artículo:'), error);
//       Alert.alert(t('Error'), t('No se pudo crear el artículo'));
//     }
//   };
  

//   return (
//     <KeyboardAvoidingView
//       behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//       style={{ flex: 1 }}
//     >
//       <ScrollView contentContainerStyle={styles.container}>
//         <Text style={styles.title}>{t("Crear Artículo")}</Text>

//         <TextInput
//           placeholder={t("Modelo")}
//           style={styles.input}
//           value={nombre}
//           onChangeText={setNombre}
//         />
//         <TextInput
//           placeholder={t("Tipo")}
//           style={styles.input}
//           value={tipo}
//           onChangeText={setTipo}
//         />
//         <TextInput
//           placeholder={t("Valor por nudo")}
//           style={styles.input}
//           value={valorNudo}
//           keyboardType="numeric"
//           onChangeText={setValorNudo}
//         />
//         <TextInput
//           placeholder={t("Cantidad de nudos por pieza")}
//           style={styles.input}
//           value={nudos}
//           keyboardType="numeric"
//           onChangeText={setNudos}
//         />
//         <Button title={t("Crear")} onPress={handleCrearArticulo} />

//         {mensaje ? <Text style={styles.mensaje}>{t("mensaje")}</Text> : null}
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     padding: 20,
//     backgroundColor: '#fff',
//     flexGrow: 1,
//     justifyContent: 'center',
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 25,
//     textAlign: 'center',
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#aaa',
//     padding: 10,
//     marginBottom: 15,
//     borderRadius: 5,
//     backgroundColor: '#f9f9f9',
//   },
//   mensaje: {
//     marginTop: 15,
//     color: 'green',
//     textAlign: 'center',
//   },
// });

// export default AdminCrearArticuloScreen;


import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, addDoc } from 'firebase/firestore';
import { useTranslation } from "react-i18next";
import { firestore } from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';

const AdminCrearArticuloScreen = () => {
  const { t } = useTranslation();
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('');
  const [valorNudo, setValorNudo] = useState('');
  const [nudos, setNudos] = useState('');
  const [mensaje, setMensaje] = useState('');

  const handleCrearArticulo = async () => {
    if (!nombre || !tipo || !valorNudo || !nudos) {
      Alert.alert(t('Error'), t('Por favor completa todos los campos'));
      return;
    }
  
    const valorNudoNum = parseFloat(valorNudo.replace(',', '.'));
    const nudosNum = parseInt(nudos);
  
    if (isNaN(valorNudoNum) || isNaN(nudosNum)) {
      Alert.alert(t('Error'), t('Ingresa valores numéricos válidos para el valor del nudo y los nudos.'));
      return;
    }
  
    try {
      await addDoc(collection(firestore, 'articulos'), {
        nombre,
        tipo,
        valorNudo: valorNudoNum,
        nudos: nudosNum,
        creadoEn: new Date().toISOString(),
      });
      setMensaje(t('✅ Artículo creado correctamente'));
      setNombre('');
      setTipo('');
      setValorNudo('');
      setNudos('');
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      console.error(t('Error al crear artículo:'), error);
      Alert.alert(t('Error'), t('No se pudo crear el artículo'));
    }
  };

  const InputField = ({ icon, placeholder, value, onChangeText, keyboardType }) => (
    <View style={styles.inputContainer}>
      <Ionicons name={icon} size={20} color="#b0b0b0" style={styles.inputIcon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#666666"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType || 'default'}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>{t("Crear Artículo")}</Text>

          <View style={styles.card}>
            <InputField
              icon="pricetag-outline"
              placeholder={t("Modelo")}
              value={nombre}
              onChangeText={setNombre}
            />

            <InputField
              icon="cube-outline"
              placeholder={t("Tipo")}
              value={tipo}
              onChangeText={setTipo}
            />

            <InputField
              icon="cash-outline"
              placeholder={t("Valor por nudo")}
              value={valorNudo}
              onChangeText={setValorNudo}
              keyboardType="numeric"
            />

            <InputField
              icon="git-network-outline"
              placeholder={t("Cantidad de nudos por pieza")}
              value={nudos}
              onChangeText={setNudos}
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity style={styles.createButton} onPress={handleCrearArticulo}>
            <Ionicons name="add-circle-outline" size={24} color="#1a1a1a" />
            <Text style={styles.createButtonText}>{t("Crear")}</Text>
          </TouchableOpacity>

          {mensaje ? (
            <View style={styles.successContainer}>
              <Ionicons name="checkmark-circle" size={24} color="#00ff88" />
              <Text style={styles.successText}>{mensaje}</Text>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  container: {
    padding: 20,
    backgroundColor: '#1a1a1a',
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
    color: '#ffffff',
  },
  card: {
    backgroundColor: '#252525',
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3a3a3a',
    paddingHorizontal: 15,
    height: 55,
    marginBottom: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
  },
  createButton: {
    backgroundColor: '#0066ff',
    borderRadius: 12,
    height: 55,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#0066ff',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  createButtonText: {
    color: '#1a1a1a',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a3a2a',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#00ff88',
  },
  successText: {
    marginLeft: 10,
    color: '#00ff88',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AdminCrearArticuloScreen;
