import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { 
  collection, 
  query, 
  where, 
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';
import { auth, firestore } from '../firebaseConfig';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/es';

dayjs.extend(relativeTime);
dayjs.locale('es');

const PedidosScreen = () => {
  const { t } = useTranslation();
  const [pedidos, setPedidos] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedPedido, setExpandedPedido] = useState(null);
  const [cantidades, setCantidades] = useState({});

  // Escuchar pedidos en tiempo real
  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const q = query(
      collection(firestore, 'pedidos'),
      where('userId', '==', userId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pedidosData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      // Ordenar por fecha de envío (más recientes primero)
      pedidosData.sort((a, b) => {
        const fechaA = a.fechaEnvio?.toDate?.() || new Date(0);
        const fechaB = b.fechaEnvio?.toDate?.() || new Date(0);
        return fechaB - fechaA;
      });
      
      setPedidos(pedidosData);
    });

    return () => unsubscribe();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const marcarComoVisto = async (pedidoId) => {
    try {
      await updateDoc(doc(firestore, 'pedidos', pedidoId), {
        estado: 'visto',
        fechaVisto: serverTimestamp(),
      });
      Alert.alert(t('Éxito'), t('Pedido marcado como visto'));
    } catch (error) {
      console.error('Error al marcar como visto:', error);
      Alert.alert(t('Error'), t('No se pudo actualizar el pedido'));
    }
  };

  const iniciarTrabajo = async (pedidoId) => {
    try {
      await updateDoc(doc(firestore, 'pedidos', pedidoId), {
        estado: 'en_proceso',
        fechaIniciado: serverTimestamp(),
      });
      Alert.alert(t('Éxito'), t('Trabajo iniciado'));
    } catch (error) {
      console.error('Error al iniciar trabajo:', error);
      Alert.alert(t('Error'), t('No se pudo actualizar el pedido'));
    }
  };

  const guardarProgreso = async (pedido) => {
    try {
      const itemsActualizados = pedido.items.map((item, index) => {
        const key = `${pedido.id}_${index}`;
        
        const completadaValue = cantidades[`${key}_completada`] !== undefined && cantidades[`${key}_completada`] !== '' 
          ? cantidades[`${key}_completada`] 
          : (item.cantidadCompletada || 0);
        const danadaValue = cantidades[`${key}_danada`] !== undefined && cantidades[`${key}_danada`] !== '' 
          ? cantidades[`${key}_danada`] 
          : (item.piezasDanadas || 0);
        
        const completada = parseInt(completadaValue, 10) || 0;
        const danada = parseInt(danadaValue, 10) || 0;
        
        return {
          ...item,
          cantidadCompletada: completada,
          piezasDanadas: danada,
        };
      });

      const totalCompletado = itemsActualizados.reduce((sum, item) => sum + (parseInt(item.cantidadCompletada, 10) || 0), 0);
      const totalDanado = itemsActualizados.reduce((sum, item) => sum + (parseInt(item.piezasDanadas, 10) || 0), 0);

      await updateDoc(doc(firestore, 'pedidos', pedido.id), {
        items: itemsActualizados,
        totalCompletado,
        totalDanado,
      });

      Alert.alert(t('Éxito'), t('Progreso guardado correctamente'));
    } catch (error) {
      console.error('Error al guardar progreso:', error);
      Alert.alert(t('Error'), t('No se pudo guardar el progreso'));
    }
  };

  const finalizarPedido = async (pedido) => {
    // Verificar que todas las cantidades coincidan
    const todoCoincide = pedido.items.every((item, index) => {
      const key = `${pedido.id}_${index}`;
      
      const completadaValue = cantidades[`${key}_completada`] !== undefined && cantidades[`${key}_completada`] !== '' 
        ? cantidades[`${key}_completada`] 
        : (item.cantidadCompletada || 0);
      const danadaValue = cantidades[`${key}_danada`] !== undefined && cantidades[`${key}_danada`] !== '' 
        ? cantidades[`${key}_danada`] 
        : (item.piezasDanadas || 0);
      
      const completada = parseInt(completadaValue, 10) || 0;
      const danada = parseInt(danadaValue, 10) || 0;
      const enviada = parseInt(item.cantidadEnviada, 10) || 0;
      
      return (completada + danada) === enviada;
    });

    if (!todoCoincide) {
      Alert.alert(
        t('Atención'),
        t('Las cantidades no coinciden con lo enviado. ¿Deseas finalizar de todos modos?'),
        [
          { text: t('Cancelar'), style: 'cancel' },
          { text: t('Finalizar'), onPress: () => confirmarFinalizacion(pedido) }
        ]
      );
    } else {
      confirmarFinalizacion(pedido);
    }
  };

  const confirmarFinalizacion = async (pedido) => {
    try {
      // Primero guardar el progreso
      await guardarProgreso(pedido);
      
      // Luego marcar como completado
      await updateDoc(doc(firestore, 'pedidos', pedido.id), {
        estado: 'completado',
        fechaCompletado: serverTimestamp(),
      });

      Alert.alert(t('Éxito'), t('Pedido finalizado correctamente'));
      setExpandedPedido(null);
    } catch (error) {
      console.error('Error al finalizar pedido:', error);
      Alert.alert(t('Error'), t('No se pudo finalizar el pedido'));
    }
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

  const validarCantidad = (item, index, pedidoId) => {
    const key = `${pedidoId}_${index}`;
    
    // Obtener valores y asegurar que sean números válidos
    const completadaValue = cantidades[`${key}_completada`] !== undefined && cantidades[`${key}_completada`] !== '' 
      ? cantidades[`${key}_completada`] 
      : (item.cantidadCompletada || 0);
    const danadaValue = cantidades[`${key}_danada`] !== undefined && cantidades[`${key}_danada`] !== '' 
      ? cantidades[`${key}_danada`] 
      : (item.piezasDanadas || 0);
    
    const completada = parseInt(completadaValue, 10) || 0;
    const danada = parseInt(danadaValue, 10) || 0;
    const total = completada + danada;
    const enviada = parseInt(item.cantidadEnviada, 10) || 0;

    if (total === enviada) {
      return { coincide: true, diferencia: 0 };
    } else {
      return { coincide: false, diferencia: enviada - total };
    }
  };

  const renderPedidoCard = (pedido) => {
    const isExpanded = expandedPedido === pedido.id;
    const estadoColor = getEstadoColor(pedido.estado);

    return (
      <View key={pedido.id} style={styles.pedidoCard}>
        {/* Header del pedido */}
        <TouchableOpacity
          style={styles.pedidoHeader}
          onPress={() => setExpandedPedido(isExpanded ? null : pedido.id)}
        >
          <View style={styles.pedidoHeaderLeft}>
            <Ionicons name="cube" size={24} color={estadoColor} />
            <View style={styles.pedidoHeaderInfo}>
              <Text style={styles.pedidoTitulo}>{t('Pedido Recibido')}</Text>
              <Text style={styles.pedidoFecha}>
                {pedido.fechaEnvio?.toDate ? 
                  dayjs(pedido.fechaEnvio.toDate()).fromNow() : 
                  t('Recién enviado')}
              </Text>
            </View>
          </View>
          <View style={styles.pedidoHeaderRight}>
            <View style={[styles.estadoBadge, { backgroundColor: estadoColor }]}>
              <Ionicons name={getEstadoIcono(pedido.estado)} size={16} color="#ffffff" />
              <Text style={styles.estadoTexto}>{getEstadoTexto(pedido.estado)}</Text>
            </View>
            <Ionicons 
              name={isExpanded ? 'chevron-up' : 'chevron-down'} 
              size={24} 
              color="#b0b0b0" 
            />
          </View>
        </TouchableOpacity>

        {/* Contenido expandible */}
        {isExpanded && (
          <View style={styles.pedidoContenido}>
            <Text style={styles.seccionTitulo}>{t('Artículos')}:</Text>

            {pedido.items.map((item, index) => {
              const validacion = validarCantidad(item, index, pedido.id);
              const key = `${pedido.id}_${index}`;

              return (
                <View 
                  key={index} 
                  style={[
                    styles.itemCard,
                    validacion.coincide && styles.itemCardCoincide
                  ]}
                >
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemNombre}>{item.nombre}</Text>
                    <Text style={styles.itemTipo}>{item.tipo}</Text>
                  </View>

                  <View style={styles.itemEnviado}>
                    <Ionicons name="send" size={16} color="#0066ff" />
                    <Text style={styles.itemEnviadoTexto}>
                      {t('Enviado')}: <Text style={styles.itemEnviadoCantidad}>{item.cantidadEnviada} pcs</Text>
                    </Text>
                  </View>

                  {pedido.estado !== 'completado' ? (
                    <>
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>{t('Completado')}:</Text>
                        <TextInput
                          style={styles.inputCantidad}
                          keyboardType="numeric"
                          placeholder="0"
                          placeholderTextColor="#666666"
                          value={cantidades[`${key}_completada`]?.toString() || item.cantidadCompletada?.toString() || ''}
                          onChangeText={(value) => setCantidades({
                            ...cantidades,
                            [`${key}_completada`]: value
                          })}
                        />
                        <Text style={styles.inputUnidad}>pcs</Text>
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>{t('Dañadas')}:</Text>
                        <TextInput
                          style={styles.inputCantidad}
                          keyboardType="numeric"
                          placeholder="0"
                          placeholderTextColor="#666666"
                          value={cantidades[`${key}_danada`]?.toString() || item.piezasDanadas?.toString() || ''}
                          onChangeText={(value) => setCantidades({
                            ...cantidades,
                            [`${key}_danada`]: value
                          })}
                        />
                        <Text style={styles.inputUnidad}>pcs</Text>
                      </View>
                    </>
                  ) : (
                    <>
                      <View style={styles.resultadoRow}>
                        <Text style={styles.resultadoLabel}>{t('Completado')}:</Text>
                        <Text style={styles.resultadoValor}>{item.cantidadCompletada} pcs</Text>
                      </View>
                      <View style={styles.resultadoRow}>
                        <Text style={styles.resultadoLabel}>{t('Dañadas')}:</Text>
                        <Text style={styles.resultadoValor}>{item.piezasDanadas} pcs</Text>
                      </View>
                    </>
                  )}

                  <View style={[
                    styles.validacionRow,
                    validacion.coincide ? styles.validacionCoincide : styles.validacionNoCoincide
                  ]}>
                    <Ionicons 
                      name={validacion.coincide ? 'checkmark-circle' : 'alert-circle'} 
                      size={20} 
                      color={validacion.coincide ? '#00ff88' : '#ffaa00'} 
                    />
                    <Text style={[
                      styles.validacionTexto,
                      validacion.coincide ? styles.validacionTextoCoincide : styles.validacionTextoNoCoincide
                    ]}>
                      {validacion.coincide ? 
                        t('✅ COINCIDE') : 
                        `⚠️ ${validacion.diferencia > 0 ? t('FALTAN') : t('SOBRAN')} ${Math.abs(validacion.diferencia)} pcs`
                      }
                    </Text>
                  </View>
                </View>
              );
            })}

            {/* Botones de acción */}
            <View style={styles.accionesContainer}>
              {pedido.estado === 'pendiente' && (
                <TouchableOpacity
                  style={styles.botonVisto}
                  onPress={() => marcarComoVisto(pedido.id)}
                >
                  <Ionicons name="eye" size={20} color="#ffffff" />
                  <Text style={styles.botonTexto}>{t('Marcar como Visto')}</Text>
                </TouchableOpacity>
              )}

              {(pedido.estado === 'visto' || pedido.estado === 'pendiente') && (
                <TouchableOpacity
                  style={styles.botonIniciar}
                  onPress={() => iniciarTrabajo(pedido.id)}
                >
                  <Ionicons name="play-circle" size={20} color="#ffffff" />
                  <Text style={styles.botonTexto}>{t('Iniciar Trabajo')}</Text>
                </TouchableOpacity>
              )}

              {pedido.estado === 'en_proceso' && (
                <>
                  <TouchableOpacity
                    style={styles.botonGuardar}
                    onPress={() => guardarProgreso(pedido)}
                  >
                    <Ionicons name="save" size={20} color="#1a1a1a" />
                    <Text style={styles.botonTextoOscuro}>{t('Guardar Progreso')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.botonFinalizar}
                    onPress={() => finalizarPedido(pedido)}
                  >
                    <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                    <Text style={styles.botonTexto}>{t('Finalizar')}</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.titulo}>{t('Mis Pedidos')}</Text>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#0066ff"
            />
          }
        >
          {pedidos.length > 0 ? (
            pedidos.map(pedido => renderPedidoCard(pedido))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={64} color="#666666" />
              <Text style={styles.emptyTexto}>{t('No tienes pedidos')}</Text>
            </View>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
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
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    padding: 20,
    paddingBottom: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 10,
  },
  pedidoCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  pedidoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  pedidoHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pedidoHeaderInfo: {
    marginLeft: 12,
  },
  pedidoTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  pedidoFecha: {
    fontSize: 12,
    color: '#b0b0b0',
    marginTop: 2,
  },
  pedidoHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  estadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  estadoTexto: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  pedidoContenido: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#3a3a3a',
  },
  seccionTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  itemCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#3a3a3a',
  },
  itemCardCoincide: {
    borderColor: '#00ff88',
    backgroundColor: '#1a2a1f',
  },
  itemHeader: {
    marginBottom: 8,
  },
  itemNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  itemTipo: {
    fontSize: 14,
    color: '#b0b0b0',
    marginTop: 2,
  },
  itemEnviado: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  itemEnviadoTexto: {
    fontSize: 14,
    color: '#b0b0b0',
  },
  itemEnviadoCantidad: {
    fontWeight: 'bold',
    color: '#0066ff',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: '#ffffff',
    width: 100,
  },
  inputCantidad: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    borderRadius: 6,
    padding: 10,
    color: '#ffffff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  inputUnidad: {
    fontSize: 14,
    color: '#b0b0b0',
    marginLeft: 8,
    width: 30,
  },
  resultadoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  resultadoLabel: {
    fontSize: 14,
    color: '#b0b0b0',
  },
  resultadoValor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  validacionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    borderRadius: 6,
    gap: 6,
  },
  validacionCoincide: {
    backgroundColor: '#1a3a2a',
  },
  validacionNoCoincide: {
    backgroundColor: '#3a2a1a',
  },
  validacionTexto: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  validacionTextoCoincide: {
    color: '#00ff88',
  },
  validacionTextoNoCoincide: {
    color: '#ffaa00',
  },
  accionesContainer: {
    marginTop: 16,
    gap: 10,
  },
  botonVisto: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffaa00',
    borderRadius: 8,
    padding: 14,
    gap: 8,
  },
  botonIniciar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0066ff',
    borderRadius: 8,
    padding: 14,
    gap: 8,
  },
  botonGuardar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00ff88',
    borderRadius: 8,
    padding: 14,
    gap: 8,
  },
  botonFinalizar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00aa55',
    borderRadius: 8,
    padding: 14,
    gap: 8,
  },
  botonTexto: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  botonTextoOscuro: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTexto: {
    fontSize: 16,
    color: '#666666',
    marginTop: 16,
  },
  bottomSpacer: {
    height: 80,
  },
});

export default PedidosScreen;