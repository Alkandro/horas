import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  RefreshControl,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
  query,
  where,
} from "firebase/firestore";
import { firestore, auth } from "../firebaseConfig";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { Swipeable } from "react-native-gesture-handler";
import DropDownPicker from "react-native-dropdown-picker";
import { useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

dayjs.extend(utc);

const Historial = ({ navigation }) => {
  const { t } = useTranslation();
  const [historial, setHistorial] = useState([]);
  const [resumenMensual, setResumenMensual] = useState(null);
  const [añoSeleccionado, setAñoSeleccionado] = useState(dayjs().year());
  const [mesSeleccionado, setMesSeleccionado] = useState(dayjs().month() + 1);
  const [refreshing, setRefreshing] = useState(false);

  const [openAño, setOpenAño] = useState(false);
  const [openMes, setOpenMes] = useState(false);
  const [añosItems, setAñosItems] = useState([]);
  const [mesesItems, setMesesItems] = useState([]);

  useEffect(() => {
    const años = [...Array(5)].map((_, i) => {
      const year = dayjs().year() - i;
      return { label: `${year}`, value: year };
    });
    setAñosItems(años);

    const meses = [...Array(12)].map((_, i) => ({
      label: `${i + 1}月`,
      value: i + 1,
    }));
    setMesesItems(meses);
  }, []);

  const verificarResumenMensual = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const resumenId = `${userId}_${añoSeleccionado}_${mesSeleccionado}`;
    const resumenDoc = await getDoc(doc(firestore, "resumenMensual", resumenId));
    setResumenMensual(resumenDoc.exists() ? resumenDoc.data() : null);
  };

  const recalcularResumenMensual = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const q = query(collection(firestore, "production"), where("userId", "==", userId));
      const snapshot = await getDocs(q);

      const datos = snapshot.docs
        .map((doc) => doc.data())
        .filter((item) => {
          const fecha = dayjs(item.fecha);
          return (
            fecha.year() === añoSeleccionado &&
            fecha.month() + 1 === mesSeleccionado
          );
        });

      const total = datos.reduce((acc, item) => {
        return (
          acc +
          Number(item.valorNudo) *
            Number(item.nudos) *
            Number(item.cantidad)
        );
      }, 0);

      const resumenId = `${userId}_${añoSeleccionado}_${mesSeleccionado}`;
      await setDoc(doc(firestore, "resumenMensual", resumenId), {
        userId,
        año: añoSeleccionado,
        mes: mesSeleccionado,
        total,
        actualizadoEl: new Date(),
      });

      Alert.alert(t("Recalculado"), t("El resumen mensual ha sido actualizado"));
      verificarResumenMensual();

    } catch (error) {
      console.error(t("Error al recalcular"), error);
      Alert.alert(t("Error"), t("No se pudo recalcular el resumen"));
    }
  };

  const cargarHistorial = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const snapshot = await getDocs(collection(firestore, "production"));
      const data = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((item) => item.userId === userId)
        .map((item) => ({ ...item, fecha: dayjs.utc(item.fecha) }));

      setHistorial(data);
    } catch (error) {
      console.error(t("Error al cargar historial"), error);
      Alert.alert(t("Error"), t("No se pudo cargar el historial"));
    }
  };

  useEffect(() => {
    cargarHistorial();
    verificarResumenMensual();
  }, [añoSeleccionado, mesSeleccionado]);

  useFocusEffect(
    useCallback(() => {
      cargarHistorial();
      verificarResumenMensual();
    }, [añoSeleccionado, mesSeleccionado])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    cargarHistorial().then(() => setRefreshing(false));
  }, []);

  const historialFiltrado = historial.filter(
    (item) =>
      item.fecha.year() === añoSeleccionado &&
      item.fecha.month() + 1 === mesSeleccionado
  );

  const historialAgrupado = historialFiltrado.reduce((acc, item) => {
    const fechaClave = item.fecha.format("YYYY-MM-DD");
    if (!acc[fechaClave]) {
      acc[fechaClave] = {
        fecha: fechaClave,
        piezas: [],
        totalDia: 0,
      };
    }

    const ganancia =
      Number(item.valorNudo) * Number(item.nudos) * Number(item.cantidad);

    acc[fechaClave].piezas.push({
      id: item.id,
      tipoPieza: item.tipoPieza,
      cantidad: item.cantidad,
      ganancia: ganancia,
      valorNudo: item.valorNudo,
      nudos: item.nudos,
      userId: item.userId,
      fecha: item.fecha,
    });

    acc[fechaClave].totalDia += ganancia;
    return acc;
  }, {});

  const historialComoArray = Object.values(historialAgrupado).sort((a, b) =>
    dayjs(b.fecha).diff(dayjs(a.fecha))
  );

  const totalMensual = historialFiltrado.reduce((acc, item) => {
    const valor = Number(item.valorNudo);
    const nudos = Number(item.nudos);
    const cantidad = Number(item.cantidad);
    if (!isNaN(valor) && !isNaN(nudos) && !isNaN(cantidad)) {
      return acc + valor * nudos * cantidad;
    }
    return acc;
  }, 0);

  const eliminarRegistro = async (id) => {
    try {
      await deleteDoc(doc(firestore, "production", id));
      cargarHistorial();
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  const renderRightActions = (item) => (
    <View style={styles.rightActions}>
      <TouchableOpacity
        style={styles.editButton}
        onPress={() =>
          navigation.navigate("EditarRegistro", {
            registro: {
              ...item,
              userId: auth.currentUser?.uid,
              fecha: item.fecha?.toISOString?.() || item.fecha,
            },
          })
        }
      >
        <Ionicons name="create-outline" size={20} color="#ffffff" />
        <Text style={styles.actionText}>{t("Editar")}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() =>
          Alert.alert(t("Confirmar"), t("¿Eliminar este registro?"), [
            { text: t("Cancelar"), style: "cancel" },
            {
              text: t("Eliminar"),
              onPress: () => eliminarRegistro(item.id),
              style: "destructive",
            },
          ])
        }
      >
        <Ionicons name="trash-outline" size={20} color="#ffffff" />
        <Text style={styles.actionText}>{t("Eliminar")}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.title}>{t("Historial de Producción")}</Text>

        <View style={styles.dropdownRow}>
          <DropDownPicker
            open={openAño}
            value={añoSeleccionado}
            items={añosItems}
            setOpen={setOpenAño}
            setValue={setAñoSeleccionado}
            setItems={setAñosItems}
            containerStyle={styles.dropdownHalf}
            style={styles.dropdown}
            textStyle={styles.dropdownText}
            dropDownContainerStyle={styles.dropdownContainer}
            arrowIconStyle={styles.dropdownArrow}
            tickIconStyle={styles.dropdownTick}
            zIndex={3000}
            zIndexInverse={1000}
          />

          <DropDownPicker
            open={openMes}
            value={mesSeleccionado}
            items={mesesItems}
            setOpen={setOpenMes}
            setValue={setMesSeleccionado}
            setItems={setMesesItems}
            containerStyle={styles.dropdownHalf}
            style={styles.dropdown}
            textStyle={styles.dropdownText}
            dropDownContainerStyle={styles.dropdownContainer}
            arrowIconStyle={styles.dropdownArrow}
            tickIconStyle={styles.dropdownTick}
            zIndex={2000}
            zIndexInverse={2000}
          />
        </View>

        <View style={styles.totalCard}>
          <View style={styles.totalHeader}>
            <Ionicons name="calendar-outline" size={20} color="#b0b0b0" />
            <Text style={styles.totalLabel}>{t("Total mensual")}</Text>
          </View>
          <Text style={styles.totalAmount}>
            {resumenMensual
              ? `¥${Math.round(resumenMensual.total)}`
              : `¥${Math.round(totalMensual)}`}
          </Text>
          {resumenMensual && (
            <Text style={styles.savedBadge}>{t("guardado")}</Text>
          )}
        </View>

        <TouchableOpacity 
          style={styles.recalculateButton}
          onPress={recalcularResumenMensual}
        >
          <Ionicons name="refresh-outline" size={20} color="#1a1a1a" />
          <Text style={styles.recalculateButtonText}>{t("Recalcular resumen mensual")}</Text>
        </TouchableOpacity>

        <FlatList
          data={historialComoArray}
          keyExtractor={(item) => item.fecha}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor="#0066ff"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={60} color="#666666" />
              <Text style={styles.emptyText}>{t("No hay registros para este mes")}</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.dayCard}>
              <View style={styles.dateHeader}>
                <Ionicons name="calendar" size={18} color="#0066ff" />
                <Text style={styles.fecha}>{item.fecha}</Text>
              </View>
              
              {item.piezas.map((pieza, index) => (
                <Swipeable
                  key={pieza.id}
                  renderRightActions={() => renderRightActions(pieza)}
                  overshootRight={false}
                >
                  <View style={styles.pieza}>
                    <View style={styles.piezaHeader}>
                      <Ionicons name="cube-outline" size={16} color="#00ff88" />
                      <Text style={styles.piezaTipo}>{pieza.tipoPieza}</Text>
                    </View>
                    <View style={styles.piezaDetails}>
                      <Text style={styles.piezaText}>
                        <Ionicons name="layers-outline" size={12} color="#b0b0b0" /> {pieza.cantidad} {t("piezas")}
                      </Text>
                      <Text style={styles.piezaGanancia}>¥{Math.round(pieza.ganancia)}</Text>
                    </View>
                  </View>
                </Swipeable>
              ))}
              
              <View style={styles.totalDiaContainer}>
                <Text style={styles.totalDiaLabel}>{t("Total día")}:</Text>
                <Text style={styles.totalDia}>¥{Math.round(item.totalDia)}</Text>
              </View>
            </View>
          )}
        />
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
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: "#1a1a1a",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#ffffff",
  },
  dropdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    zIndex: 1000,
  },
  dropdownHalf: {
    width: "48%",
  },
  dropdown: {
    backgroundColor: '#2a2a2a',
    borderColor: '#3a3a3a',
    borderRadius: 10,
    minHeight: 50,
  },
  dropdownText: {
    color: '#ffffff',
    fontSize: 16,
  },
  dropdownContainer: {
    backgroundColor: '#2a2a2a',
    borderColor: '#3a3a3a',
  },
  dropdownArrow: {
    tintColor: '#b0b0b0',
  },
  dropdownTick: {
    tintColor: '#0066ff',
  },
  totalCard: {
    backgroundColor: '#252525',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#3a3a3a',
    alignItems: 'center',
  },
  totalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  totalLabel: {
    fontSize: 16,
    color: '#b0b0b0',
    marginLeft: 8,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  savedBadge: {
    fontSize: 12,
    color: '#00ff88',
    backgroundColor: '#1a3a2a',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  recalculateButton: {
    backgroundColor: '#00ff88',
    borderRadius: 12,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#00ff88',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  recalculateButtonText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 15,
  },
  dayCard: {
    backgroundColor: '#252525',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  fecha: { 
    fontWeight: "bold",
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 8,
  },
  pieza: {
    backgroundColor: "#2a2a2a",
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  piezaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  piezaTipo: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 8,
  },
  piezaDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  piezaText: {
    fontSize: 14,
    color: '#b0b0b0',
  },
  piezaGanancia: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0066ff',
  },
  totalDiaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#3a3a3a',
  },
  totalDiaLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#b0b0b0',
  },
  totalDia: { 
    fontWeight: "bold",
    fontSize: 18,
    color: '#00ff88',
  },
  rightActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  deleteButton: {
    backgroundColor: "#ff4444",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    flexDirection: 'row',
  },
  editButton: {
    backgroundColor: "#0066ff",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    flexDirection: 'row',
  },
  actionText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 6,
  },
});

export default Historial;