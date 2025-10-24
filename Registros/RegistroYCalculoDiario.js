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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, firestore } from '../firebaseConfig';
import { collection, getDocs, addDoc, doc, getDoc, setDoc, 
  query, 
  where, 
  onSnapshot,
  updateDoc,
  serverTimestamp } from 'firebase/firestore';
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
  
  // Estados para pedidos
  const [pedidosPendientes, setPedidosPendientes] = useState([]);
  const [modalPedidoVisible, setModalPedidoVisible] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

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

  // Escuchar pedidos pendientes y en proceso en tiempo real
  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const q = query(
      collection(firestore, 'pedidos'),
      where('userId', '==', userId),
      where('estado', 'in', ['pendiente', 'en_proceso'])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pedidos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPedidosPendientes(pedidos);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    cargarArticulos();
    cargarDetalles();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([cargarArticulos(), cargarDetalles()]).then(() => setRefreshing(false));
  }, []);

  const handleSeleccionArticulo = (articulo) => {
    setTipoPieza(articulo.nombre);
    setValorNudo(articulo.valorNudo ?? 0);
    setCantidadNudosPorPieza(articulo.nudos ?? 0);
    setModalVisible(false);
  };

  const cargarDetalles = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const fecha = dayjs().format('YYYY-MM-DD');
      const q = query(
        collection(firestore, 'production'),
        where('userId', '==', userId),
        where('fecha', '==', fecha)
      );

      const snapshot = await getDocs(q);
      const registros = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setDetalles(registros);

      const total = registros.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
      setTotalDiario(total);
    } catch (error) {
      console.error('Error al cargar detalles:', error);
    }
  };

  // Función para ver detalles del pedido
  const verDetallesPedido = (pedido) => {
    setPedidoSeleccionado(pedido);
    setModalPedidoVisible(true);
  };

  // Función para usar artículos del pedido
  const usarArticulosPedido = async (pedido) => {
    try {
      const userId = auth.currentUser?.uid;
      const fecha = dayjs().format('YYYY-MM-DD');
      
      Alert.alert(
        t('Confirmar'),
        t('¿Desea registrar todos los artículos de este pedido en su producción?'),
        [
          { text: t('Cancelar'), style: 'cancel' },
          {
            text: t('Confirmar'),
            onPress: async () => {
              try {
                const itemsActualizados = [];
                
                // Por cada artículo del pedido
                for (const item of pedido.items) {
                  const cantidadPendiente = parseInt(item.cantidadEnviada, 10) - (parseInt(item.cantidadCompletada, 10) || 0);
                  
                  if (cantidadPendiente > 0) {
                    // Guardar en production (historial)
                    await addDoc(collection(firestore, 'production'), {
                      userId,
                      fecha,
                      articulo: item.nombre,
                      cantidad: cantidadPendiente,
                      valorNudo: parseFloat(item.valorNudo),
                      nudos: parseFloat(item.nudos),
                      total: parseFloat(item.valorNudo) * parseFloat(item.nudos) * cantidadPendiente,
                      pedidoId: pedido.id,
                      timestamp: serverTimestamp(),
                    });
                    
                    // Actualizar cantidadCompletada
                    itemsActualizados.push({
                      ...item,
                      cantidadCompletada: parseInt(item.cantidadEnviada, 10),
                    });
                  } else {
                    itemsActualizados.push(item);
                  }
                }
                
                // Actualizar pedido en Firestore
                await updateDoc(doc(firestore, 'pedidos', pedido.id), {
                  items: itemsActualizados,
                  estado: 'completado',
                  fechaCompletado: serverTimestamp(),
                });
                
                Alert.alert(t('Éxito'), t('Artículos del pedido registrados en producción'));
                setModalPedidoVisible(false);
                cargarDetalles();
              } catch (error) {
                console.error('Error al usar artículos:', error);
                Alert.alert(t('Error'), t('No se pudieron registrar los artículos'));
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Función para marcar pedido como visto
  const marcarPedidoComoVisto = async (pedidoId) => {
    try {
      await updateDoc(doc(firestore, 'pedidos', pedidoId), {
        estado: 'en_proceso',
        fechaVisto: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error al marcar como visto:', error);
    }
  };

  const guardarRegistro = async () => {
    if (!tipoPieza) {
      Alert.alert(t('Error'), t('Por favor seleccione un artículo'));
      return;
    }
    if (!cantidadPiezas || parseInt(cantidadPiezas) <= 0) {
      Alert.alert(t('Error'), t('Por favor ingrese una cantidad válida'));
      return;
    }

    try {
      const userId = auth.currentUser?.uid;
      const fecha = dayjs().format('YYYY-MM-DD');
      const cantidad = parseInt(cantidadPiezas);
      const total = valorNudo * cantidadNudosPorPieza * cantidad;

      await addDoc(collection(firestore, 'production'), {
        userId,
        fecha,
        articulo: tipoPieza,
        cantidad,
        valorNudo,
        nudos: cantidadNudosPorPieza,
        total,
        timestamp: serverTimestamp(),
      });

      Alert.alert(t('Éxito'), t('Registro guardado correctamente'));
      setCantidadPiezas('');
      setTipoPieza('');
      setValorNudo(0);
      setCantidadNudosPorPieza(0);
      cargarDetalles();
    } catch (error) {
      console.error('Error al guardar:', error);
      Alert.alert(t('Error'), t('No se pudo guardar el registro'));
    }
  };

  const calcularTotal = () => {
    const cantidad = parseInt(cantidadPiezas) || 0;
    return (valorNudo * cantidadNudosPorPieza * cantidad).toFixed(2);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Card de Pedidos Recibidos */}
        {pedidosPendientes.length > 0 && (
          <View style={styles.pedidosCard}>
            <View style={styles.pedidosHeader}>
              <Ionicons name="cube" size={24} color="#0066ff" />
              <Text style={styles.pedidosTitle}>
                {t('Pedidos Recibidos')} ({pedidosPendientes.length})
              </Text>
            </View>
            
            {pedidosPendientes.map(pedido => {
              const totalItems = pedido.items?.length || 0;
              const fechaEnvio = pedido.fechaEnvio?.toDate ? dayjs(pedido.fechaEnvio.toDate()).format('DD/MM HH:mm') : '';
              
              return (
                <View key={pedido.id} style={styles.pedidoItem}>
                  <View style={styles.pedidoInfo}>
                    <Text style={styles.pedidoFecha}>{t('Pedido de')} {fechaEnvio}</Text>
                    <Text style={styles.pedidoItems}>
                      {pedido.items?.map(item => `${item.nombre}: ${item.cantidadEnviada} pcs`).join(' | ')}
                    </Text>
                  </View>
                  <View style={styles.pedidoBotones}>
                    <TouchableOpacity 
                      style={styles.botonVer}
                      onPress={() => verDetallesPedido(pedido)}
                    >
                      <Ionicons name="eye" size={16} color="#ffffff" />
                      <Text style={styles.botonTexto}>{t('Ver')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.botonUsar}
                      onPress={() => usarArticulosPedido(pedido)}
                    >
                      <Ionicons name="checkmark-circle" size={16} color="#ffffff" />
                      <Text style={styles.botonTexto}>{t('Usar')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Sección de Producción Diaria */}
        <View style={styles.produccionCard}>
          <Text style={styles.seccionTitle}>{t('Producción Diaria')}</Text>
          
          <TouchableOpacity 
            style={styles.selectorArticulo}
            onPress={() => setModalVisible(true)}
          >
            <Text style={tipoPieza ? styles.articuloSeleccionado : styles.articuloPlaceholder}>
              {tipoPieza || t('Seleccione un artículo')}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666666" />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder={t('Cantidad de piezas')}
            placeholderTextColor="#666666"
            value={cantidadPiezas}
            onChangeText={setCantidadPiezas}
            keyboardType="numeric"
          />

          {tipoPieza && (
            <View style={styles.detallesCard}>
              <View style={styles.detalleRow}>
                <Text style={styles.detalleLabel}>{t('Artículo')}:</Text>
                <Text style={styles.detalleValor}>{tipoPieza}</Text>
              </View>
              <View style={styles.detalleRow}>
                <Text style={styles.detalleLabel}>{t('Valor por nudo')}:</Text>
                <Text style={styles.detalleValor}>¥{valorNudo}</Text>
              </View>
              <View style={styles.detalleRow}>
                <Text style={styles.detalleLabel}>{t('Nudos')}:</Text>
                <Text style={styles.detalleValor}>{cantidadNudosPorPieza}</Text>
              </View>
              <View style={styles.detalleRow}>
                <Text style={styles.detalleLabel}>{t('Cantidad')}:</Text>
                <Text style={styles.detalleValor}>{cantidadPiezas || 0} {t('piezas')}</Text>
              </View>
              <View style={[styles.detalleRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>{t('Total')}:</Text>
                <Text style={styles.totalValor}>¥{calcularTotal()}</Text>
              </View>
            </View>
          )}

          <TouchableOpacity 
            style={styles.botonGuardar}
            onPress={guardarRegistro}
          >
            <LinearGradient
              colors={['#0066ff', '#0052cc']}
              style={styles.gradientButton}
            >
              <Ionicons name="save" size={20} color="#ffffff" />
              <Text style={styles.botonGuardarTexto}>{t('Guardar Registro')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Registros de Hoy */}
        <View style={styles.registrosCard}>
          <Text style={styles.seccionTitle}>{t('Registros de Hoy')}</Text>
          <View style={styles.totalDiarioCard}>
            <Text style={styles.totalDiarioLabel}>{t('Total del Día')}:</Text>
            <Text style={styles.totalDiarioValor}>¥{totalDiario.toFixed(2)}</Text>
          </View>

          {detalles.map((item, index) => (
            <View key={item.id || index} style={styles.registroItem}>
              <View style={styles.registroInfo}>
                <Text style={styles.registroArticulo}>{item.articulo}</Text>
                <Text style={styles.registroCantidad}>{item.cantidad} {t('piezas')}</Text>
              </View>
              <Text style={styles.registroTotal}>¥{parseFloat(item.total).toFixed(2)}</Text>
            </View>
          ))}

          {detalles.length === 0 && (
            <Text style={styles.sinRegistros}>{t('No hay registros hoy')}</Text>
          )}
        </View>

        {/* Modal de Selección de Artículo */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('Seleccionar Artículo')}</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalScrollView}>
                {articulos.map((articulo) => (
                  <TouchableOpacity
                    key={articulo.id}
                    style={styles.modalItem}
                    onPress={() => handleSeleccionArticulo(articulo)}
                  >
                    <View style={styles.modalItemContent}>
                      <Ionicons name="cube-outline" size={20} color="#0066ff" />
                      <Text style={styles.modalItemText}>{articulo.nombre}</Text>
                    </View>
                    <Text style={styles.modalItemDetails}>
                      ¥{articulo.valorNudo} × {articulo.nudos} {t('nudos')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Modal de Detalles del Pedido */}
        <Modal
          visible={modalPedidoVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalPedidoVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('Detalles del Pedido')}</Text>
                <TouchableOpacity onPress={() => setModalPedidoVisible(false)}>
                  <Ionicons name="close" size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalScrollView}>
                {pedidoSeleccionado?.items?.map((item, index) => {
                  const total = parseFloat(item.valorNudo) * parseFloat(item.nudos) * parseInt(item.cantidadEnviada, 10);
                  
                  return (
                    <View key={index} style={styles.pedidoDetalleItem}>
                      <Text style={styles.pedidoDetalleNombre}>{item.nombre}</Text>
                      <View style={styles.pedidoDetalleInfo}>
                        <Text style={styles.pedidoDetalleTexto}>
                          {t('Cantidad')}: {item.cantidadEnviada} pcs
                        </Text>
                        <Text style={styles.pedidoDetalleTexto}>
                          {t('Valor por nudo')}: ¥{item.valorNudo}
                        </Text>
                        <Text style={styles.pedidoDetalleTexto}>
                          {t('Nudos')}: {item.nudos}
                        </Text>
                        <Text style={styles.pedidoDetalleTotal}>
                          {t('Total')}: ¥{total.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>

              <TouchableOpacity 
                style={styles.botonUsarTodos}
                onPress={() => usarArticulosPedido(pedidoSeleccionado)}
              >
                <LinearGradient
                  colors={['#00cc66', '#00994d']}
                  style={styles.gradientButton}
                >
                  <Ionicons name="checkmark-done" size={20} color="#ffffff" />
                  <Text style={styles.botonTexto}>{t('Usar Todos los Artículos')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  // Estilos de Pedidos Recibidos
  pedidosCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#0066ff',
  },
  pedidosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pedidosTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 8,
  },
  pedidoItem: {
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  pedidoInfo: {
    marginBottom: 8,
  },
  pedidoFecha: {
    fontSize: 14,
    color: '#b0b0b0',
    marginBottom: 4,
  },
  pedidoItems: {
    fontSize: 14,
    color: '#ffffff',
  },
  pedidoBotones: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  botonVer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0066ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  botonUsar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00cc66',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  botonTexto: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  // Estilos de Producción Diaria
  produccionCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  seccionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  selectorArticulo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  articuloPlaceholder: {
    fontSize: 14,
    color: '#666666',
  },
  articuloSeleccionado: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 12,
  },
  detallesCard: {
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  detalleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detalleLabel: {
    fontSize: 14,
    color: '#b0b0b0',
  },
  detalleValor: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#4a4a4a',
    paddingTop: 8,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  totalValor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00cc66',
  },
  botonGuardar: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    gap: 8,
  },
  botonGuardarTexto: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Estilos de Registros de Hoy
  registrosCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  totalDiarioCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  totalDiarioLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  totalDiarioValor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00cc66',
  },
  registroItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  registroInfo: {
    flex: 1,
  },
  registroArticulo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  registroCantidad: {
    fontSize: 12,
    color: '#b0b0b0',
  },
  registroTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00cc66',
  },
  sinRegistros: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    padding: 20,
  },
  // Estilos de Modal
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
  modalScrollView: {
    maxHeight: 400,
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
  modalItemText: {
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 12,
    fontWeight: '600',
  },
  modalItemDetails: {
    fontSize: 13,
    color: '#b0b0b0',
  },
  pedidoDetalleItem: {
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  pedidoDetalleNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  pedidoDetalleInfo: {
    gap: 4,
  },
  pedidoDetalleTexto: {
    fontSize: 14,
    color: '#b0b0b0',
  },
  pedidoDetalleTotal: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#00cc66',
    marginTop: 4,
  },
  botonUsarTodos: {
    borderRadius: 8,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginTop: 8,
  },
});

export default RegistroYCalculoDiario;