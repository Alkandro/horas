import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  RefreshControl,
  FlatList,
  TouchableOpacity,
  Button,
} from "react-native";
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

dayjs.extend(utc);

const Historial = ({ navigation }) => {
  const { t } = useTranslation(); // Hook para traducción
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

  const yearMonthIsBeforeNow = (año, mes) => {
    const now = dayjs();
    return dayjs(`${año}-${mes}-01`).isBefore(now.startOf("month"));
  };

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
      verificarResumenMensual(); // actualizar vista

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
        <Text style={styles.actionText}>Editar</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() =>
          Alert.alert(t("Confirmar"), t("¿Eliminar este registro?"), [
            { text: "Cancelar", style: "cancel" },
            {
              text: t("Eliminar"),
              onPress: () => eliminarRegistro(item.id),
              style: "destructive",
            },
          ])
        }
      >
        <Text style={styles.actionText}>{t("Eliminar")}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
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
          zIndex={2000}
          zIndexInverse={2000}
        />
      </View>

      <Text style={styles.total}>
        {t("Total mensual")}:{" "}
        {resumenMensual
          ? `¥${Math.round(resumenMensual.total)} (guardado)`
          : `¥${Math.round(totalMensual)}`}
      </Text>

      <Button
        title={t("↻ Recalcular resumen mensual")}
        onPress={recalcularResumenMensual}
        color="#4caf50"
      />

      <FlatList
        data={historialComoArray}
        keyExtractor={(item) => item.fecha}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.fecha}>{item.fecha}</Text>
            {item.piezas.map((pieza, index) => (
              <Swipeable
                key={pieza.id}
                renderRightActions={() => renderRightActions(pieza)}
              >
                <View style={styles.pieza}>
                  <Text>{t("Tipo")}: {pieza.tipoPieza}</Text>
                  <Text>{t("Piezas")}: {pieza.cantidad}</Text>
                  <Text>{t("Ganancia")}: ¥{Math.round(pieza.ganancia)}</Text>
                </View>
              </Swipeable>
            ))}
            <Text style={styles.totalDia}>
              {t("Total día")}: ¥{Math.round(item.totalDia)}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  total: { fontSize: 18, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  item: {
    backgroundColor: "#f1f1f1",
    padding: 12,
    marginBottom: 8,
    borderRadius: 5,
  },
  fecha: { fontWeight: "bold", marginBottom: 4 },
  pieza: {
    backgroundColor: "#e0e0e0",
    padding: 8,
    marginBottom: 6,
    borderRadius: 4,
  },
  totalDia: { fontWeight: "bold", marginTop: 6 },
  rightActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  deleteButton: {
    backgroundColor: "#ff5252",
    justifyContent: "center",
    padding: 15,
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
  },
  editButton: {
    backgroundColor: "#4caf50",
    justifyContent: "center",
    padding: 15,
  },
  actionText: {
    color: "#fff",
    fontWeight: "bold",
  },
  dropdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    zIndex: 1000,
  },
  dropdownHalf: {
    width: "48%",
  },
});

export default Historial;
