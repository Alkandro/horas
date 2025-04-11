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
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { firestore, auth } from "../firebaseConfig";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { Swipeable } from "react-native-gesture-handler";
import DropDownPicker from "react-native-dropdown-picker";

dayjs.extend(utc);

const Historial = ({ navigation }) => {
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

  const cargarHistorial = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const snapshot = await getDocs(collection(firestore, "production"));
      const data = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((item) => item.userId === userId)
        .map((item) => ({ ...item, fecha: dayjs.utc(item.fecha) }));

      const agrupadosPorMes = {};
      const todosLosRegistrosActuales = [];

      for (const item of data) {
        const año = item.fecha.year();
        const mes = item.fecha.month() + 1;
        const clave = `${año}-${mes}`;
        if (!agrupadosPorMes[clave]) agrupadosPorMes[clave] = [];
        agrupadosPorMes[clave].push(item);
      }

      for (const [clave, registros] of Object.entries(agrupadosPorMes)) {
        const [año, mes] = clave.split("-").map(Number);
        const esMesAnterior = yearMonthIsBeforeNow(año, mes);

        if (esMesAnterior) {
          const resumenId = `${userId}_${año}_${mes}`;
          const resumenDocRef = doc(firestore, "resumenMensual", resumenId);
          const resumenDoc = await getDoc(resumenDocRef);

          if (!resumenDoc.exists()) {
            const total = registros.reduce((acc, item) => {
              return (
                acc +
                Number(item.valorNudo) *
                  Number(item.nudos) *
                  Number(item.cantidad)
              );
            }, 0);

            await setDoc(resumenDocRef, {
              userId,
              año,
              mes,
              total,
              creadoEl: new Date(),
            });

            for (const reg of registros) {
              await deleteDoc(doc(firestore, "production", reg.id));
            }
          }
        } else {
          todosLosRegistrosActuales.push(...registros);
        }
      }

      setHistorial(todosLosRegistrosActuales);
    } catch (error) {
      console.error("Error al cargar historial:", error);
      Alert.alert("Error", "No se pudo cargar el historial");
    }
  };

  useEffect(() => {
    cargarHistorial();
  }, [añoSeleccionado, mesSeleccionado]);

  useEffect(() => {
    const verificarResumenMensual = async () => {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const resumenId = `${userId}_${añoSeleccionado}_${mesSeleccionado}`;
      const resumenDoc = await getDoc(doc(firestore, "resumenMensual", resumenId));
      setResumenMensual(resumenDoc.exists() ? resumenDoc.data() : null);
    };

    verificarResumenMensual();
  }, [añoSeleccionado, mesSeleccionado]);

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
          navigation.navigate("EditarRegistro", { registro: item })
        }
      >
        <Text style={styles.actionText}>Editar</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() =>
          Alert.alert("Confirmar", "¿Eliminar este registro?", [
            { text: "Cancelar", style: "cancel" },
            {
              text: "Eliminar",
              onPress: () => eliminarRegistro(item.id),
              style: "destructive",
            },
          ])
        }
      >
        <Text style={styles.actionText}>Eliminar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial de Producción</Text>

      <View style={{ zIndex: 20, marginBottom: 10 }}>
        <DropDownPicker
          open={openAño}
          value={añoSeleccionado}
          items={añosItems}
          setOpen={setOpenAño}
          setValue={setAñoSeleccionado}
          setItems={setAñosItems}
          onChangeValue={() => setResumenMensual(null)}
          placeholder="Año"
        />
      </View>

      <View style={{ zIndex: 10, marginBottom: 15 }}>
        <DropDownPicker
          open={openMes}
          value={mesSeleccionado}
          items={mesesItems}
          setOpen={setOpenMes}
          setValue={setMesSeleccionado}
          setItems={setMesesItems}
          onChangeValue={() => setResumenMensual(null)}
          placeholder="Mes"
        />
      </View>

      <Text style={styles.total}>
        Total mensual: {" "}
        {resumenMensual
          ? `¥${Math.round(resumenMensual.total)} (guardado)`
          : `¥${Math.round(totalMensual)}`}
      </Text>

      {historialFiltrado.length === 0 && resumenMensual && (
        <View style={styles.item}>
          <Text style={styles.fecha}>
            {`${añoSeleccionado}-${String(mesSeleccionado).padStart(2, "0")}`}
          </Text>
          <Text>Total guardado del mes: ¥{Math.round(resumenMensual.total)}</Text>
          <Text style={{ fontStyle: "italic", color: "#666" }}>
            Este mes ya fue consolidado y los registros diarios fueron eliminados.
          </Text>
        </View>
      )}

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
                  <Text>Tipo: {pieza.tipoPieza}</Text>
                  <Text>Piezas: {pieza.cantidad}</Text>
                  <Text>Ganancia: ¥{Math.round(pieza.ganancia)}</Text>
                </View>
              </Swipeable>
            ))}
            <Text style={styles.totalDia}>
              Total día: ¥{Math.round(item.totalDia)}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          resumenMensual ? null : (
            <Text style={{ textAlign: "center", marginTop: 20 }}>
              No hay registros para este mes.
            </Text>
          )
        }
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
  total: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
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
});

export default Historial;
