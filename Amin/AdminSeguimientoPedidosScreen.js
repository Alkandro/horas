import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy,
  deleteDoc,
  doc,
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { firestore } from '../firebaseConfig';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/es';

dayjs.extend(relativeTime);
dayjs.locale('es');

const AdminSeguimientoPedidosScreen = () => {
  const { t } = useTranslation();
  const [pedidos, setPedidos] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [refreshing, setRefreshing] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Escuchar todos los pedidos en tiempo real
  useEffect(() => {
    const q = query(
      collection(firestore, 'pedidos'),
      orderBy('fechaEnvio', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pedidosData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPedidos(pedidosData);
    });

    return () => unsubscribe();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'pendiente': return '#ff4444';
      case 'visto': return '#ffaa00';
      case 'en_proceso': return '#0066ff';
      case 'completado': return '#00ff88';
      default: return '#666666';
    }
  };

  const getEstadoTexto = (estado) => {
    switch (estado) {
      case 'pendiente': return t('Pendiente');
      case 'visto': return t('Visto');
      case 'en_proceso': return t('En Proceso');
      case 'completado': return t('Completado');
      default: return estado;
    }
  };

  const getEstadoIcono = (estado) => {
    switch (estado) {
      case 'pendiente': return 'alert-circle';
      case 'visto': return 'eye';
      case 'en_proceso': return 'time';
      case 'completado': return 'checkmark-circle';
      default: return 'help-circle';
    }
  };

  const pedidosFiltrados = pedidos.filter(pedido => {
    if (filtro === 'todos') return true;
    return pedido.estado === filtro;
  });

  const calcularProgreso = (pedido) => {
    if (!pedido.items || pedido.items.length === 0) {
      return { totalEnviado: 0, totalCompletado: 0, totalDanado: 0, porcentaje: 0 };
    }

    const totalEnviado = pedido.items.reduce((sum, item) => {
      const enviado = parseInt(item.cantidadEnviada, 10) || 0;
      return sum + enviado;
    }, 0);

    const totalCompletado = pedido.items.reduce((sum, item) => {
      const completado = parseInt(item.cantidadCompletada, 10) || 0;
      return sum + completado;
    }, 0);

    const totalDanado = pedido.items.reduce((sum, item) => {
      const danado = parseInt(item.piezasDanadas, 10) || 0;
      return sum + danado;
    }, 0);

    const porcentaje = totalEnviado > 0 ? Math.round((totalCompletado / totalEnviado) * 100) : 0;

    return { totalEnviado, totalCompletado, totalDanado, porcentaje };
  };

  const verDetalles = (pedido) => {
    setPedidoSeleccionado(pedido);
    setModalVisible(true);
  };

  // Función para eliminar pedido y guardar valores en resumen mensual
  const eliminarPedido = async (pedido) => {
    Alert.alert(
      t('Confirmar eliminación'),
      t('¿Estás seguro de eliminar este pedido? Los valores completados se guardarán en el resumen mensual del usuario.'),
      [
        { text: t('Cancelar'), style: 'cancel' },
        {
          text: t('Eliminar'),
          style: 'destructive',
          onPress: async () => {
            try {
              const progreso = calcularProgreso(pedido);
              
              // Si hay valores completados, guardarlos en production (historial)
              if (progreso.totalCompletado > 0) {
                const fecha = dayjs().format('YYYY-MM-DD');
                
                for (const item of pedido.items) {
                  const completado = parseInt(item.cantidadCompletada, 10) || 0;
                  
                  if (completado > 0) {
                    // Guardar en production para que aparezca en historial y resumen
                    await addDoc(collection(firestore, 'production'), {
                      userId: pedido.userId,
                      fecha,
                      articulo: item.nombre,
                      cantidad: completado,
                      valorNudo: parseFloat(item.valorNudo),
                      nudos: parseFloat(item.nudos),
                      total: parseFloat(item.valorNudo) * parseFloat(item.nudos) * completado,
                      pedidoId: pedido.id,
                      pedidoEliminado: true,
                      timestamp: serverTimestamp(),
                    });
                  }
                }
              }

              // Eliminar el pedido
              await deleteDoc(doc(firestore, 'pedidos', pedido.id));

              Alert.alert(
                t('Éxito'),
                t('Pedido eliminado. Los valores completados se guardaron en el resumen mensual del usuario.')
              );
              
              setModalVisible(false);
            } catch (error) {
              console.error('Error al eliminar pedido:', error);
              Alert.alert(t('Error'), t('No se pudo eliminar el pedido'));
            }
          }
        }
      ]
    );
  };

  // Estadísticas
  const estadisticas = {
    total: pedidos.length,
    pendientes: pedidos.filter(p => p.estado === 'pendiente').length,
    enProceso: pedidos.filter(p => p.estado === 'en_proceso').length,
    completados: pedidos.filter(p => p.estado === 'completado').length,
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Estadísticas */}
        <View style={styles.estadisticasCard}>
          <Text style={styles.estadisticasTitle}>{t('Estadísticas')}</Text>
          <View style={styles.estadisticasGrid}>
            <View style={styles.estadItem}>
              <Text style={styles.estadValor}>{estadisticas.total}</Text>
              <Text style={styles.estadLabel}>{t('Total')}</Text>
            </View>
            <View style={styles.estadItem}>
              <Text style={[styles.estadValor, { color: '#ff4444' }]}>{estadisticas.pendientes}</Text>
              <Text style={styles.estadLabel}>{t('Pendientes')}</Text>
            </View>
            <View style={styles.estadItem}>
              <Text style={[styles.estadValor, { color: '#0066ff' }]}>{estadisticas.enProceso}</Text>
              <Text style={styles.estadLabel}>{t('En Proceso')}</Text>
            </View>
            <View style={styles.estadItem}>
              <Text style={[styles.estadValor, { color: '#00ff88' }]}>{estadisticas.completados}</Text>
              <Text style={styles.estadLabel}>{t('Completados')}</Text>
            </View>
          </View>
        </View>

        {/* Filtros */}
        <View style={styles.filtrosContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['todos', 'pendiente', 'en_proceso', 'completado'].map(estado => (
              <TouchableOpacity
                key={estado}
                style={[
                  styles.filtroBoton,
                  filtro === estado && styles.filtroBotonActivo
                ]}
                onPress={() => setFiltro(estado)}
              >
                <Text style={[
                  styles.filtroTexto,
                  filtro === estado && styles.filtroTextoActivo
                ]}>
                  {estado === 'todos' ? t('Todos') : getEstadoTexto(estado)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Lista de Pedidos */}
        {pedidosFiltrados.map(pedido => {
          const progreso = calcularProgreso(pedido);
          const fechaEnvio = pedido.fechaEnvio?.toDate 
            ? dayjs(pedido.fechaEnvio.toDate()).format('DD/MM/YYYY HH:mm')
            : '';

          return (
            <View key={pedido.id} style={styles.pedidoCard}>
              <View style={styles.pedidoHeader}>
                <View style={styles.pedidoUsuario}>
                  <Ionicons name="person" size={20} color="#0066ff" />
                  <Text style={styles.pedidoUsuarioNombre}>{pedido.usuarioNombre}</Text>
                </View>
                <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(pedido.estado) }]}>
                  <Ionicons name={getEstadoIcono(pedido.estado)} size={14} color="#ffffff" />
                  <Text style={styles.estadoTexto}>{getEstadoTexto(pedido.estado)}</Text>
                </View>
              </View>

              <View style={styles.pedidoInfo}>
                <Text style={styles.pedidoFecha}>{t('Enviado')}: {fechaEnvio}</Text>
                <Text style={styles.pedidoItems}>
                  {pedido.items?.length || 0} {t('artículos')}
                </Text>
              </View>

              <View style={styles.progresoContainer}>
                <View style={styles.progresoInfo}>
                  <Text style={styles.progresoTexto}>
                    {progreso.totalCompletado}/{progreso.totalEnviado} pcs
                  </Text>
                  <Text style={styles.progresoTexto}>{progreso.porcentaje}%</Text>
                </View>
                <View style={styles.progresoBarraContainer}>
                  <View 
                    style={[
                      styles.progresoBarra, 
                      { width: `${progreso.porcentaje}%` }
                    ]} 
                  />
                </View>
              </View>

              <TouchableOpacity 
                style={styles.botonVerDetalles}
                onPress={() => verDetalles(pedido)}
              >
                <Ionicons name="eye" size={16} color="#0066ff" />
                <Text style={styles.botonVerDetallesTexto}>{t('Ver Detalles')}</Text>
              </TouchableOpacity>
            </View>
          );
        })}

        {pedidosFiltrados.length === 0 && (
          <View style={styles.sinPedidos}>
            <Ionicons name="cube-outline" size={64} color="#666666" />
            <Text style={styles.sinPedidosTexto}>{t('No hay pedidos')}</Text>
          </View>
        )}

        {/* Modal de Detalles */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('Detalles del Pedido')}</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScrollView}>
                {pedidoSeleccionado && (
                  <>
                    <View style={styles.modalInfoCard}>
                      <Text style={styles.modalInfoLabel}>{t('Usuario')}:</Text>
                      <Text style={styles.modalInfoValor}>{pedidoSeleccionado.usuarioNombre}</Text>
                    </View>

                    <View style={styles.modalInfoCard}>
                      <Text style={styles.modalInfoLabel}>{t('Estado')}:</Text>
                      <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(pedidoSeleccionado.estado) }]}>
                        <Ionicons name={getEstadoIcono(pedidoSeleccionado.estado)} size={14} color="#ffffff" />
                        <Text style={styles.estadoTexto}>{getEstadoTexto(pedidoSeleccionado.estado)}</Text>
                      </View>
                    </View>

                    <Text style={styles.modalSectionTitle}>{t('Artículos')}</Text>
                    {pedidoSeleccionado.items?.map((item, index) => {
                      const enviado = parseInt(item.cantidadEnviada, 10) || 0;
                      const completado = parseInt(item.cantidadCompletada, 10) || 0;
                      const danado = parseInt(item.piezasDanadas, 10) || 0;
                      const total = parseFloat(item.valorNudo) * parseFloat(item.nudos) * enviado;

                      return (
                        <View key={index} style={styles.modalArticuloCard}>
                          <Text style={styles.modalArticuloNombre}>{item.nombre}</Text>
                          <View style={styles.modalArticuloInfo}>
                            <Text style={styles.modalArticuloTexto}>
                              {t('Enviado')}: {enviado} pcs
                            </Text>
                            <Text style={styles.modalArticuloTexto}>
                              {t('Completado')}: {completado} pcs
                            </Text>
                            <Text style={styles.modalArticuloTexto}>
                              {t('Dañadas')}: {danado} pcs
                            </Text>
                            <Text style={styles.modalArticuloTexto}>
                              {t('Valor por nudo')}: ¥{item.valorNudo}
                            </Text>
                            <Text style={styles.modalArticuloTexto}>
                              {t('Nudos')}: {item.nudos}
                            </Text>
                            <Text style={styles.modalArticuloTotal}>
                              {t('Total')}: ¥{total.toFixed(2)}
                            </Text>
                          </View>
                        </View>
                      );
                    })}

                    {/* Botón Eliminar Pedido */}
                    <TouchableOpacity 
                      style={styles.botonEliminar}
                      onPress={() => eliminarPedido(pedidoSeleccionado)}
                    >
                      <Ionicons name="trash" size={20} color="#ffffff" />
                      <Text style={styles.botonEliminarTexto}>{t('Eliminar Pedido')}</Text>
                    </TouchableOpacity>
                  </>
                )}
              </ScrollView>
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
  estadisticasCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  estadisticasTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  estadisticasGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  estadItem: {
    alignItems: 'center',
  },
  estadValor: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  estadLabel: {
    fontSize: 12,
    color: '#b0b0b0',
    marginTop: 4,
  },
  filtrosContainer: {
    marginBottom: 16,
  },
  filtroBoton: {
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  filtroBotonActivo: {
    backgroundColor: '#0066ff',
  },
  filtroTexto: {
    color: '#b0b0b0',
    fontSize: 14,
    fontWeight: '600',
  },
  filtroTextoActivo: {
    color: '#ffffff',
  },
  pedidoCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  pedidoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pedidoUsuario: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pedidoUsuarioNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  estadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  estadoTexto: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  pedidoInfo: {
    marginBottom: 12,
  },
  pedidoFecha: {
    fontSize: 13,
    color: '#b0b0b0',
    marginBottom: 4,
  },
  pedidoItems: {
    fontSize: 13,
    color: '#b0b0b0',
  },
  progresoContainer: {
    marginBottom: 12,
  },
  progresoInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progresoTexto: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '600',
  },
  progresoBarraContainer: {
    height: 8,
    backgroundColor: '#3a3a3a',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progresoBarra: {
    height: '100%',
    backgroundColor: '#00ff88',
    borderRadius: 4,
  },
  botonVerDetalles: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
    padding: 10,
    gap: 6,
  },
  botonVerDetallesTexto: {
    color: '#0066ff',
    fontSize: 14,
    fontWeight: '600',
  },
  sinPedidos: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  sinPedidosTexto: {
    fontSize: 16,
    color: '#666666',
    marginTop: 16,
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
    maxHeight: '80%',
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
    maxHeight: 500,
  },
  modalInfoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 12,
  },
  modalInfoLabel: {
    fontSize: 14,
    color: '#b0b0b0',
  },
  modalInfoValor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
  },
  modalArticuloCard: {
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  modalArticuloNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  modalArticuloInfo: {
    gap: 4,
  },
  modalArticuloTexto: {
    fontSize: 14,
    color: '#b0b0b0',
  },
  modalArticuloTotal: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#00ff88',
    marginTop: 4,
  },
  botonEliminar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff3b30',
    borderRadius: 8,
    padding: 14,
    marginHorizontal: 16,
    marginTop: 20,
    gap: 8,
  },
  botonEliminarTexto: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AdminSeguimientoPedidosScreen;