import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DropDownPicker from 'react-native-dropdown-picker';
import { 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { Keyboard } from 'react-native';
import { firestore } from '../firebaseConfig';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';

const AdminEnviarPedidosScreen = ({ navigation }) => {
  const { t } = useTranslation();
  
  // Estados para usuarios
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [openUsuario, setOpenUsuario] = useState(false);
  
  // Estados para artículos
  const [articulos, setArticulos] = useState([]);
  const [articuloSeleccionado, setArticuloSeleccionado] = useState(null);
  const [openArticulo, setOpenArticulo] = useState(false);
  const [cantidad, setCantidad] = useState('');
  
  // Estados para pedido
  const [itemsPedido, setItemsPedido] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);

  // Recargar datos cada vez que la pantalla obtiene el foco
  useFocusEffect(
    React.useCallback(() => {
      cargarDatos();
    }, [])
  );

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Cargar usuarios (excluir admins)
      const usersSnapshot = await getDocs(collection(firestore, 'users'));
      const usersList = usersSnapshot.docs
        .filter(doc => doc.data().role !== 'admin')
        .map(doc => ({
          label: `${doc.data().nombre} ${doc.data().apellido} (${doc.data().email})`,
          value: doc.id,
          nombre: doc.data().nombre,
          apellido: doc.data().apellido,
          email: doc.data().email,
        }));
      setUsuarios(usersList);

      // Cargar artículos
      const articulosSnapshot = await getDocs(collection(firestore, 'articulos'));
      const articulosList = articulosSnapshot.docs.map(doc => ({
        label: `${doc.data().nombre} - ${doc.data().tipo}`,
        value: doc.id,
        nombre: doc.data().nombre,
        tipo: doc.data().tipo,
        valorNudo: parseFloat(doc.data().valorNudo || 0),
        nudos: parseFloat(doc.data().nudos || 0),
      }));
      setArticulos(articulosList);
      
    } catch (error) {
      console.error('Error al cargar datos:', error);
      Toast.show({
        type: 'error',
        text1: t('Error'),
        text2: t('No se pudieron cargar los datos'),
      });
    } finally {
      setLoading(false);
    }
  };

  const agregarItem = () => {
    Keyboard.dismiss(); 
    if (!articuloSeleccionado) {
      Toast.show({
        type: 'error',
        text1: t('Error'),
        text2: t('Selecciona un artículo'),
      });
      return;
    }

    if (!cantidad || parseInt(cantidad, 10) <= 0) {
      Toast.show({
        type: 'error',
        text1: t('Error'),
        text2: t('Ingresa una cantidad válida'),
      });
      return;
    }

    const articulo = articulos.find(a => a.value === articuloSeleccionado);
    
    const nuevoItem = {
      articuloId: articuloSeleccionado,
      nombre: articulo.nombre,
      tipo: articulo.tipo,
      cantidadEnviada: parseInt(cantidad, 10),
      cantidadCompletada: 0,
      piezasDanadas: 0,
      valorNudo: parseFloat(articulo.valorNudo),
      nudos: parseFloat(articulo.nudos),
    };

    setItemsPedido([...itemsPedido, nuevoItem]);
    setArticuloSeleccionado(null);
    setCantidad('');
    
    Toast.show({
      type: 'success',
      text1: t('Agregado'),
      text2: `${articulo.nombre} - ${cantidad} pcs`,
    });
  };

  const eliminarItem = (index) => {
    const nuevosItems = itemsPedido.filter((_, i) => i !== index);
    setItemsPedido(nuevosItems);
  };

  const enviarPedido = async () => {
    if (!usuarioSeleccionado) {
      Toast.show({
        type: 'error',
        text1: t('Error'),
        text2: t('Selecciona un usuario'),
      });
      return;
    }

    if (itemsPedido.length === 0) {
      Toast.show({
        type: 'error',
        text1: t('Error'),
        text2: t('Agrega al menos un artículo al pedido'),
      });
      return;
    }

    Alert.alert(
      t('Confirmar envío'),
      t('¿Estás seguro de enviar este pedido?'),
      [
        { text: t('Cancelar'), style: 'cancel' },
        {
          text: t('Enviar'),
          onPress: async () => {
            try {
              setEnviando(true);
              
              const usuario = usuarios.find(u => u.value === usuarioSeleccionado);
              
              // Calcular totales
              const totalEnviado = itemsPedido.reduce((sum, item) => sum + parseInt(item.cantidadEnviada, 10), 0);
              
              // Crear pedido en Firestore
              await addDoc(collection(firestore, 'pedidos'), {
                userId: usuarioSeleccionado,
                usuarioNombre: `${usuario.nombre} ${usuario.apellido}`,
                usuarioEmail: usuario.email,
                items: itemsPedido,
                totalEnviado,
                totalCompletado: 0,
                totalDanado: 0,
                estado: 'pendiente',
                fechaEnvio: serverTimestamp(),
              });

              Toast.show({
                type: 'success',
                text1: t('Éxito'),
                text2: t('Pedido enviado correctamente'),
              });

              // Limpiar formulario
              setUsuarioSeleccionado(null);
              setItemsPedido([]);
              
            } catch (error) {
              console.error('Error al enviar pedido:', error);
              Toast.show({
                type: 'error',
                text1: t('Error'),
                text2: t('No se pudo enviar el pedido'),
              });
            } finally {
              setEnviando(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066ff" />
          <Text style={styles.loadingText}>{t('Cargando...')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <View style={styles.content}>
          <Text style={styles.title}>{t('Enviar Pedido')}</Text>

          {/* Selector de Usuario */}
          <View style={styles.section}>
            <Text style={styles.label}>{t('Seleccionar Usuario')}</Text>
            <DropDownPicker
              open={openUsuario}
              value={usuarioSeleccionado}
              items={usuarios}
              setOpen={setOpenUsuario}
              setValue={setUsuarioSeleccionado}
              placeholder={t('Selecciona un usuario')}
              searchable
              searchPlaceholder={t('Buscar usuario...')}
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              textStyle={styles.dropdownText}
              placeholderStyle={styles.dropdownPlaceholder}
              zIndex={3000}
              zIndexInverse={1000}
            />
          </View>

          {/* Selector de Artículo */}
          <View style={styles.section}>
            <Text style={styles.label}>{t('Agregar Artículo')}</Text>
            <DropDownPicker
              open={openArticulo}
              value={articuloSeleccionado}
              items={articulos}
              setOpen={setOpenArticulo}
              setValue={setArticuloSeleccionado}
              placeholder={t('Selecciona un artículo')}
              searchable
              searchPlaceholder={t('Buscar artículo...')}
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              textStyle={styles.dropdownText}
              placeholderStyle={styles.dropdownPlaceholder}
              zIndex={2000}
              zIndexInverse={2000}
            />
          </View>

          {/* Input de Cantidad */}
          <View style={styles.section}>
            <Text style={styles.label}>{t('Cantidad de Piezas')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('Cantidad de piezas')}
              placeholderTextColor="#666666"
              value={cantidad}
              onChangeText={setCantidad}
              keyboardType="numeric"
            />
          </View>

          {/* Botón Agregar */}
          <TouchableOpacity style={styles.botonAgregar} onPress={agregarItem}>
            <Ionicons name="add-circle" size={20} color="#ffffff" />
            <Text style={styles.botonTexto}>{t('Agregar al Pedido')}</Text>
          </TouchableOpacity>

          {/* Lista de Items del Pedido */}
          {itemsPedido.length > 0 && (
            <View style={styles.pedidoSection}>
              <Text style={styles.pedidoTitle}>{t('Artículos del Pedido')} ({itemsPedido.length})</Text>
              
              {itemsPedido.map((item, index) => (
                <View key={index} style={styles.pedidoItem}>
                  <View style={styles.pedidoItemInfo}>
                    <Text style={styles.pedidoItemNombre}>{item.nombre}</Text>
                    <Text style={styles.pedidoItemDetalle}>
                      {item.cantidadEnviada} pcs | ¥{item.valorNudo} × {item.nudos} {t('nudos')}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => eliminarItem(index)}>
                    <Ionicons name="trash" size={20} color="#ff3b30" />
                  </TouchableOpacity>
                </View>
              ))}

              {/* Botón Enviar Pedido */}
              <TouchableOpacity 
                style={[styles.botonEnviar, enviando && styles.botonEnviarDisabled]} 
                onPress={enviarPedido}
                disabled={enviando}
              >
                {enviando ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Ionicons name="send" size={20} color="#ffffff" />
                    <Text style={styles.botonTexto}>{t('Enviar Pedido')}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
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
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 24,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  dropdown: {
    backgroundColor: '#2a2a2a',
    borderColor: '#3a3a3a',
    borderRadius: 8,
  },
  dropdownContainer: {
    backgroundColor: '#2a2a2a',
    borderColor: '#3a3a3a',
  },
  dropdownText: {
    color: '#ffffff',
    fontSize: 14,
  },
  dropdownPlaceholder: {
    color: '#666666',
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  botonAgregar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0066ff',
    borderRadius: 8,
    padding: 14,
    gap: 8,
    marginBottom: 24,
  },
  botonTexto: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pedidoSection: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
  },
  pedidoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  pedidoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  pedidoItemInfo: {
    flex: 1,
  },
  pedidoItemNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  pedidoItemDetalle: {
    fontSize: 13,
    color: '#b0b0b0',
  },
  botonEnviar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00cc66',
    borderRadius: 8,
    padding: 14,
    gap: 8,
    marginTop: 12,
  },
  botonEnviarDisabled: {
    backgroundColor: '#666666',
  },
});

export default AdminEnviarPedidosScreen;