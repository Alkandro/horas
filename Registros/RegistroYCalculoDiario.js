// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   Button,
//   StyleSheet,
//   ScrollView,
//   RefreshControl,
//   Alert,
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { auth, firestore } from '../firebaseConfig';
// import { collection, getDocs, addDoc, doc, getDoc, setDoc } from 'firebase/firestore';
// import { Picker } from '@react-native-picker/picker';
// import dayjs from 'dayjs';
// import { useTranslation } from "react-i18next";

// const RegistroYCalculoDiario = () => {
//   const { t } = useTranslation(); // Hook para traducción
//   const [cantidadPiezas, setCantidadPiezas] = useState('');
//   const [totalDiario, setTotalDiario] = useState(0);
//   const [articulos, setArticulos] = useState([]);
//   const [tipoPieza, setTipoPieza] = useState('');
//   const [valorNudo, setValorNudo] = useState(0);
//   const [cantidadNudosPorPieza, setCantidadNudosPorPieza] = useState(0);
//   const [detalles, setDetalles] = useState([]);
//   const [refreshing, setRefreshing] = useState(false);

//   const cargarArticulos = async () => {
//     try {
//       const snapshot = await getDocs(collection(firestore, 'articulos'));
//       const lista = snapshot.docs.map(doc => {
//         const data = doc.data();
//         return {
//           id: doc.id,
//           nombre: data.nombre,
//           valorNudo: parseFloat(data.valorNudo || 0),
//           nudos: parseFloat(data.nudos || 0),
//         };
//       });
//       setArticulos(lista);
//     } catch (error) {
//       console.error(t('Error al cargar artículos:'), error);
//     }
//   };

//   useEffect(() => {
//     cargarArticulos();
//   }, []);

//   const onRefresh = useCallback(() => {
//     setRefreshing(true);
//     cargarArticulos().then(() => setRefreshing(false));
//   }, []);

//   const handleSeleccionArticulo = (nombre) => {
//     setTipoPieza(nombre);
//     const articulo = articulos.find(a => a.nombre === nombre);

//     if (articulo) {
//       setValorNudo(articulo.valorNudo ?? 0);
//       setCantidadNudosPorPieza(articulo.nudos ?? 0);
//     } else {
//       console.warn(t('Artículo no encontrado:'), nombre);
//       setValorNudo(0);
//       setCantidadNudosPorPieza(0);
//     }
//   };

//   const agregarAlTotal = () => {
//     const piezas = parseFloat(cantidadPiezas);
//     if (!tipoPieza || isNaN(piezas) || piezas <= 0) {
//       Alert.alert(t('Aviso'), t('Por favor seleccione un artículo y cantidad válida.'));
//       return;
//     }

//     const subtotal = valorNudo * cantidadNudosPorPieza * piezas;
//     const nuevoDetalle = {
//       tipoPieza,
//       piezas,
//       nudos: cantidadNudosPorPieza,
//       valorNudo: valorNudo,
//       subtotal,
//     };

//     setDetalles(prev => [...prev, nuevoDetalle]);
//     setTotalDiario(prev => prev + subtotal);
//     setCantidadPiezas('');
//   };

//   const guardarEnFirestore = async () => {
//     try {
//       const userId = auth.currentUser?.uid;
//       if (!userId || detalles.length === 0) return;

//       const datosIncompletos = detalles.some((detalle) =>
//         !detalle.tipoPieza || detalle.piezas == null || detalle.nudos == null || detalle.valorNudo == null
//       );

//       if (datosIncompletos) {
//         Alert.alert(t('Error'), t('Uno o más artículos tienen datos incompletos. Verifica antes de guardar'));
//         return;
//       }

//       const now = dayjs();
//       const año = now.year();
//       const mes = now.month() + 1;
//       const resumenId = `${userId}_${año}_${mes}`;
//       const resumenRef = doc(firestore, 'resumenMensual', resumenId);
//       const resumenDoc = await getDoc(resumenRef);
//       const totalPrevio = resumenDoc.exists() ? resumenDoc.data().total : 0;

//       for (const detalle of detalles) {
//         await addDoc(collection(firestore, 'production'), {
//           userId,
//           cantidad: detalle.piezas,
//           nudos: detalle.nudos,
//           tipoPieza: detalle.tipoPieza,
//           valorNudo: detalle.valorNudo,
//           fecha: new Date().toISOString(),
//         });
//       }

//       await setDoc(resumenRef, {
//         userId,
//         año,
//         mes,
//         total: totalPrevio + totalDiario,
//         creadoEl: new Date(),
//       });

//       await AsyncStorage.setItem('totalPiezas', JSON.stringify(totalDiario));
//       Alert.alert(t('Éxito'), t('Datos guardados correctamente'));
//       setDetalles([]);
//       setTotalDiario(0);
//     } catch (error) {
//       console.error(t('Error al guardar en Firestore:'), error);
//       Alert.alert(t('Error'), t('No se pudo guardar en Firestore'));
//     }
//   };

//   return (
//     <ScrollView
//       contentContainerStyle={styles.container}
//       refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//       keyboardShouldPersistTaps="handled"
//     >
//       <Picker
//         selectedValue={tipoPieza}
//         onValueChange={handleSeleccionArticulo}
//         style={styles.picker}
//       >
//         <Picker.Item label={t("Seleccione un artículo")} value="" />
//         {articulos.map((articulo) => (
//           <Picker.Item key={articulo.id} label={articulo.nombre} value={articulo.nombre} />
//         ))}
//       </Picker>

//       {tipoPieza ? (
//         <View style={{ marginBottom: 15 }}>
//           <Text style={styles.boldText}>{t("Valor por nudo")}: ¥{valorNudo}</Text>
//           <Text style={styles.boldText}>{t("Nudos por pieza")}: {cantidadNudosPorPieza}</Text>
//         </View>
//       ) : null}

//       <TextInput
//         placeholder={t("Cantidad de piezas")}
//         keyboardType="numeric"
//         onChangeText={setCantidadPiezas}
//         value={cantidadPiezas}
//         style={styles.input}
//       />

//       <Button title={t("Agregar")} onPress={agregarAlTotal} />

//       <View style={{ marginVertical: 20 }}>
//         <Text style={styles.subtitle}>{t("Resumen del día")}:</Text>
//         {detalles.map((item, index) => (
//           <Text key={index} style={styles.item}>
//             {item.tipoPieza} - {item.piezas} {t("piezas - Subtotal")}: ¥{item.subtotal.toFixed(0)}
//           </Text>
//         ))}
//       </View>

//       <Text style={styles.result}>
//         {t("Total diario")}: <Text style={styles.boldText}>¥{totalDiario.toFixed(0)}</Text>
//       </Text>

//       <Button title={t("Guardar y Enviar")} onPress={guardarEnFirestore} />
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     padding: 20,
//     backgroundColor: '#fff',
//     flexGrow: 1,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#999',
//     padding: 10,
//     marginBottom: 12,
//     borderRadius: 5,
//   },
//   picker: {
//     marginBottom: 20,
//   },
//   subtitle: {
//     fontWeight: 'bold',
//     fontSize: 17,
//     marginBottom: 8,
//   },
//   result: {
//     fontSize: 18,
//     marginTop: 10,
//     marginBottom: 15,
//   },
//   boldText: {
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   item: {
//     fontSize: 15,
//     marginBottom: 4,
//   },
// });

// export default RegistroYCalculoDiario;

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, firestore } from '../firebaseConfig';
import { collection, getDocs, addDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import dayjs from 'dayjs';
import { useTranslation } from "react-i18next";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const RegistroYCalculoDiario = () => {
  const { t } = useTranslation();
  const [cantidadPiezas, setCantidadPiezas] = useState('');
  const [totalDiario, setTotalDiario] = useState(0);
  const [articulos, setArticulos] = useState([]);
  const [tipoPieza, setTipoPieza] = useState('');
  const [valorNudo, setValorNudo] = useState(0);
  const [cantidadNudosPorPieza, setCantidadNudosPorPieza] = useState(0);
  const [detalles, setDetalles] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const cargarArticulos = async () => {
    try {
      const snapshot = await getDocs(collection(firestore, 'articulos'));
      const lista = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          nombre: data.nombre,
          valorNudo: parseFloat(data.valorNudo || 0),
          nudos: parseFloat(data.nudos || 0),
        };
      });
      setArticulos(lista);
    } catch (error) {
      console.error(t('Error al cargar artículos:'), error);
    }
  };

  useEffect(() => {
    cargarArticulos();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    cargarArticulos().then(() => setRefreshing(false));
  }, []);

  const handleSeleccionArticulo = (articulo) => {
    setTipoPieza(articulo.nombre);
    setValorNudo(articulo.valorNudo ?? 0);
    setCantidadNudosPorPieza(articulo.nudos ?? 0);
    setModalVisible(false);
  };

  const agregarAlTotal = () => {
    const piezas = parseFloat(cantidadPiezas);
    if (!tipoPieza || isNaN(piezas) || piezas <= 0) {
      Alert.alert(t('Aviso'), t('Por favor seleccione un artículo y cantidad válida.'));
      return;
    }

    const subtotal = valorNudo * cantidadNudosPorPieza * piezas;
    const nuevoDetalle = {
      tipoPieza,
      piezas,
      nudos: cantidadNudosPorPieza,
      valorNudo: valorNudo,
      subtotal,
    };

    setDetalles(prev => [...prev, nuevoDetalle]);
    setTotalDiario(prev => prev + subtotal);
    setCantidadPiezas('');
  };

  const guardarEnFirestore = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId || detalles.length === 0) return;

      const datosIncompletos = detalles.some((detalle) =>
        !detalle.tipoPieza || detalle.piezas == null || detalle.nudos == null || detalle.valorNudo == null
      );

      if (datosIncompletos) {
        Alert.alert(t('Error'), t('Uno o más artículos tienen datos incompletos. Verifica antes de guardar'));
        return;
      }

      const now = dayjs();
      const año = now.year();
      const mes = now.month() + 1;
      const resumenId = `${userId}_${año}_${mes}`;
      const resumenRef = doc(firestore, 'resumenMensual', resumenId);
      const resumenDoc = await getDoc(resumenRef);
      const totalPrevio = resumenDoc.exists() ? resumenDoc.data().total : 0;

      for (const detalle of detalles) {
        await addDoc(collection(firestore, 'production'), {
          userId,
          cantidad: detalle.piezas,
          nudos: detalle.nudos,
          tipoPieza: detalle.tipoPieza,
          valorNudo: detalle.valorNudo,
          fecha: new Date().toISOString(),
        });
      }

      await setDoc(resumenRef, {
        userId,
        año,
        mes,
        total: totalPrevio + totalDiario,
        creadoEl: new Date(),
      });

      await AsyncStorage.setItem('totalPiezas', JSON.stringify(totalDiario));
      Alert.alert(t('Éxito'), t('Datos guardados correctamente'));
      setDetalles([]);
      setTotalDiario(0);
    } catch (error) {
      console.error(t('Error al guardar en Firestore:'), error);
      Alert.alert(t('Error'), t('No se pudo guardar en Firestore'));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.mainContainer}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.container}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor="#0066ff"
            />
          }
          keyboardShouldPersistTaps="handled"
        >
          {/* Título */}
          <Text style={styles.title}>{t("Producción")}</Text>

          {/* Card de selección de artículo con borde gradiente */}
          <View style={styles.gradientBorderContainer}>
            <LinearGradient
              colors={['#0066ff', '#00ff88']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientBorder}
            >
              <View style={styles.articleCard}>
                <View style={styles.articleHeader}>
                  <Ionicons name="cube-outline" size={40} color="#b0b0b0" />
                  <View style={styles.articleInfo}>
                    {tipoPieza ? (
                      <>
                        <Text style={styles.articleCode}>{tipoPieza}</Text>
                        <Text style={styles.articleModel}>
                          {t("Valor")}: ¥{valorNudo} | {t("Nudos")}: {cantidadNudosPorPieza}
                        </Text>
                      </>
                    ) : (
                      <Text style={styles.articlePlaceholder}>{t("Seleccione un artículo")}</Text>
                    )}
                  </View>
                </View>

                {/* Dropdown personalizado */}
                <TouchableOpacity 
                  style={styles.dropdownButton}
                  onPress={() => setModalVisible(true)}
                >
                  <Text style={styles.dropdownButtonText}>
                    {tipoPieza || t("Seleccione un artículo")}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#b0b0b0" />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          {/* Input de cantidad con icono */}
          <View style={styles.inputContainer}>
            <Ionicons name="calculator-outline" size={20} color="#b0b0b0" style={styles.inputIcon} />
            <TextInput
              placeholder={t("Cantidad de piezas")}
              placeholderTextColor="#666666"
              keyboardType="numeric"
              onChangeText={setCantidadPiezas}
              value={cantidadPiezas}
              style={styles.input}
            />
          </View>

          {/* Botón Agregar */}
          <TouchableOpacity style={styles.addButton} onPress={agregarAlTotal}>
            <Ionicons name="add-circle-outline" size={24} color="#ffffff" />
            <Text style={styles.addButtonText}>{t("Agregar")}</Text>
          </TouchableOpacity>

          {/* Resumen del día */}
          <View style={styles.summarySection}>
            <Text style={styles.summaryTitle}>{t("Resumen del día")}:</Text>
            
            {detalles.length > 0 ? (
              <View style={styles.detailsList}>
                {detalles.map((item, index) => (
                  <View key={index} style={styles.detailItem}>
                    <View style={styles.detailHeader}>
                      <Ionicons name="checkbox-outline" size={20} color="#00ff88" />
                      <Text style={styles.detailType}>{item.tipoPieza}</Text>
                    </View>
                    <View style={styles.detailInfo}>
                      <Text style={styles.detailText}>
                        <Ionicons name="cube-outline" size={14} color="#b0b0b0" /> {item.piezas} {t("piezas")}
                      </Text>
                      <Text style={styles.detailSubtotal}>¥{item.subtotal.toFixed(0)}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>{t("No hay artículos agregados")}</Text>
            )}
          </View>

          {/* Total diario */}
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>{t("Total diario")}:</Text>
            <Text style={styles.totalAmount}>¥{totalDiario.toFixed(0)}</Text>
          </View>

          {/* Espaciador para que el botón no quede tapado por el tab */}
          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Botón Guardar y Enviar - Fijo en la parte inferior */}
        <View style={styles.fixedButtonContainer}>
          <TouchableOpacity 
            style={[styles.saveButton, detalles.length === 0 && styles.saveButtonDisabled]} 
            onPress={guardarEnFirestore}
            disabled={detalles.length === 0}
          >
            <Ionicons name="checkmark-circle-outline" size={24} color="#1a1a1a" />
            <Text style={styles.saveButtonText}>{t("Guardar y Enviar")}</Text>
          </TouchableOpacity>
        </View>

        {/* Modal de selección de artículos */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t("Seleccione un artículo")}</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close-circle" size={28} color="#b0b0b0" />
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={articulos}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => handleSeleccionArticulo(item)}
                  >
                    <View style={styles.modalItemContent}>
                      <Ionicons name="cube-outline" size={24} color="#0066ff" />
                      <View style={styles.modalItemInfo}>
                        <Text style={styles.modalItemName}>{item.nombre}</Text>
                        <Text style={styles.modalItemDetails}>
                          {t("Valor")}: ¥{item.valorNudo} | {t("Nudos")}: {item.nudos}
                        </Text>
                      </View>
                    </View>
                    {tipoPieza === item.nombre && (
                      <Ionicons name="checkmark-circle" size={24} color="#00ff88" />
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  scrollView: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  gradientBorderContainer: {
    marginBottom: 20,
  },
  gradientBorder: {
    borderRadius: 16,
    padding: 2,
  },
  articleCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 14,
    padding: 20,
  },
  articleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  articleInfo: {
    marginLeft: 15,
    flex: 1,
  },
  articleCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  articleModel: {
    fontSize: 14,
    color: '#b0b0b0',
    marginTop: 4,
  },
  articlePlaceholder: {
    fontSize: 18,
    color: '#666666',
  },
  dropdownButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3a3a3a',
    paddingHorizontal: 15,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252525',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 15,
    height: 55,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
  },
  addButton: {
    backgroundColor: '#0066ff',
    borderRadius: 12,
    height: 55,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: '#0066ff',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  summarySection: {
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  detailsList: {
    gap: 10,
  },
  detailItem: {
    backgroundColor: '#252525',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 8,
  },
  detailInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#b0b0b0',
  },
  detailSubtotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0066ff',
  },
  emptyText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  totalCard: {
    backgroundColor: '#252525',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#3a3a3a',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    color: '#b0b0b0',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  bottomSpacer: {
    height: 80,
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 90,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  saveButton: {
    backgroundColor: '#00ff88',
    borderRadius: 12,
    height: 55,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00ff88',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonDisabled: {
    backgroundColor: '#2a4a3a',
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#1a1a1a',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#2a2a2a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  modalItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalItemInfo: {
    marginLeft: 12,
    flex: 1,
  },
  modalItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  modalItemDetails: {
    fontSize: 13,
    color: '#b0b0b0',
  },
});

export default RegistroYCalculoDiario;
