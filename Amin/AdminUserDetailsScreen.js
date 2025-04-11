// import React from 'react';
// import { View, Text, FlatList, StyleSheet, SafeAreaView } from 'react-native';

// const AdminUserDetailsScreen = ({ route }) => {
//   const { user } = route.params;

//   const renderItem = ({ item }) => (
//     <View style={styles.productionItem}>
//       <Text>Tipo de Pieza: {item.tipoPieza}</Text>
//       <Text>Cantidad: {item.cantidad}</Text>
//       <Text>Nudos: {item.nudos}</Text>
//       <Text>Fecha: {new Date(item.fecha).toLocaleDateString()}</Text>
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <FlatList
//         ListHeaderComponent={
//           <View style={styles.headerContainer}>
//             <Text style={styles.title}>Detalles de {user.email}</Text>

//             <View style={styles.userInfo}>
//               <Text>
//                 <Text style={styles.label}>Nombre:</Text> {user.nombre}
//               </Text>
//               <Text>
//                 <Text style={styles.label}>Apellido:</Text> {user.apellido}
//               </Text>
//               <Text>
//                 <Text style={styles.label}>Teléfono:</Text> {user.telefono}
//               </Text>
//               <Text style={styles.label}>Dirección:</Text>
//               <Text>
//                 {`${user.direccion?.prefectura || ''}, ${user.direccion?.ciudad || ''}, ${user.direccion?.barrio || ''}, ${user.direccion?.numero || ''}`}
//               </Text>
//               <Text style={styles.label}>Código Postal:</Text>
//               <Text>{user.direccion?.codigoPostal || 'No disponible'}</Text>
//               <Text style={styles.subtitle}>Producción</Text>
//             </View>
//           </View>
//         }
//         data={user.productionData || []}
//         keyExtractor={(item, index) => index.toString()}
//         renderItem={renderItem}
//         contentContainerStyle={{ paddingBottom: 30, paddingHorizontal: 16 }}
//         ListEmptyComponent={<Text>No hay datos de producción para este usuario.</Text>}
//       />
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   headerContainer: {
//     paddingVertical: 16,
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     marginBottom: 10,
//     textAlign: 'center',
//   },
//   userInfo: {
//     backgroundColor: '#f3f3f3',
//     padding: 15,
//     borderRadius: 8,
//     marginBottom: 20,
//   },
//   label: {
//     fontWeight: 'bold',
//   },
//   subtitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     marginTop: 15,
//     marginBottom: 10,
//   },
//   productionItem: {
//     backgroundColor: '#eaeaea',
//     padding: 12,
//     marginBottom: 8,
//     borderRadius: 6,
//   },
// });

// export default AdminUserDetailsScreen;

import React, { useEffect, useState } from "react";
import {
  View,
  Button,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { firestore } from "../firebaseConfig";
import {
  doc,
  getDoc,
  getDocs,
  query,
  where,
  collection,
} from "firebase/firestore";
import DropDownPicker from "react-native-dropdown-picker";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

const AdminUserDetailsScreen = ({ route, navigation }) => {
  const { user } = route.params;
  const [historial, setHistorial] = useState([]);
  const [añoSeleccionado, setAñoSeleccionado] = useState(dayjs().year());
  const [mesSeleccionado, setMesSeleccionado] = useState(dayjs().month() + 1);
  const [loading, setLoading] = useState(true);
  const [openMes, setOpenMes] = useState(false);
  const [openAño, setOpenAño] = useState(false);
  const [itemsMes, setItemsMes] = useState(
    [...Array(12)].map((_, i) => ({ label: `${i + 1}月`, value: i + 1 }))
  );
  const [itemsAño, setItemsAño] = useState(
    [...Array(5)].map((_, i) => {
      const year = dayjs().year() - i;
      return { label: `${year}`, value: year };
    })
  );

  useEffect(() => {
    const cargarProduccion = async () => {
      try {
        setLoading(true);
        const q = query(
          collection(firestore, "production"),
          where("userId", "==", user.userId)
        );
        const snapshot = await getDocs(q);
        const datos = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          fecha: dayjs.utc(doc.data().fecha),
        }));

        const filtrados = datos.filter(
          (item) =>
            item.fecha.year() === añoSeleccionado &&
            item.fecha.month() + 1 === mesSeleccionado
        );

        const agrupados = filtrados.reduce((acc, item) => {
          const dia = item.fecha.format("YYYY-MM-DD");
          if (!acc[dia]) {
            acc[dia] = {
              fecha: dia,
              piezas: [],
              totalDia: 0,
            };
          }

          const ganancia =
            Number(item.valorNudo) * Number(item.nudos) * Number(item.cantidad);

          acc[dia].piezas.push({
            tipoPieza: item.tipoPieza,
            cantidad: item.cantidad,
            ganancia: ganancia,
          });

          acc[dia].totalDia += ganancia;

          return acc;
        }, {});

        setHistorial(
          Object.values(agrupados).sort((a, b) =>
            dayjs(b.fecha).diff(dayjs(a.fecha))
          )
        );
      } catch (error) {
        console.error("Error al cargar producción del usuario:", error);
        Alert.alert("Error", "No se pudo cargar la producción.");
      } finally {
        setLoading(false);
      }
    };

    cargarProduccion();
  }, [añoSeleccionado, mesSeleccionado]);

  if (loading)
    return (
      <ActivityIndicator style={{ marginTop: 40 }} size="large" color="blue" />
    );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Detalles de {user.email}</Text>
        <View style={styles.userInfo}>
          <Text>
            <Text style={styles.label}>Nombre:</Text> {user.nombre}
          </Text>
          <Text>
            <Text style={styles.label}>Apellido:</Text> {user.apellido}
          </Text>
          <Text>
            <Text style={styles.label}>Teléfono:</Text> {user.telefono}
          </Text>
          <Text style={styles.label}>Dirección:</Text>
          <Text>{`${user.direccion?.prefectura || ""}, ${
            user.direccion?.ciudad || ""
          }, ${user.direccion?.barrio || ""}, ${
            user.direccion?.numero || ""
          }`}</Text>
          <Text style={styles.label}>Código Postal:</Text>
          <Text>{user.direccion?.codigoPostal || "No disponible"}</Text>
          <Button
            title="Ver resumen mensual"
            onPress={() =>
              navigation.navigate("AdminUserMonthlySummary", {
                userId: user.userId,
              })
            }
          />
        </View>
        <Text style={styles.subtitle}>Producción Mensual</Text>

        <View style={styles.dropdownContainer}>
          <DropDownPicker
            placeholder="Año"
            open={openAño}
            value={añoSeleccionado}
            items={itemsAño}
            setOpen={setOpenAño}
            setValue={setAñoSeleccionado}
            setItems={setItemsAño}
            containerStyle={{ width: 120, marginRight: 10 }}
            zIndex={3000}
            zIndexInverse={1000}
          />

          <DropDownPicker
            placeholder="Mes"
            open={openMes}
            value={mesSeleccionado}
            items={itemsMes}
            setOpen={setOpenMes}
            setValue={setMesSeleccionado}
            setItems={setItemsMes}
            containerStyle={{ width: 120 }}
            zIndex={2000}
            zIndexInverse={2000}
          />
        </View>
      </View>

      <FlatList
        data={historial}
        keyExtractor={(item) => item.fecha}
        contentContainerStyle={{ paddingBottom: 30 }}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text style={styles.itemDate}>{item.fecha}</Text>
            {item.piezas.map((pieza, index) => (
              <Text key={index} style={styles.itemText}>
                {pieza.tipoPieza} - {pieza.cantidad} piezas - ¥
                {Math.round(pieza.ganancia)}
              </Text>
            ))}
            <Text style={styles.itemTotal}>
              Total día: ¥{Math.round(item.totalDia)}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            No hay registros para este mes.
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  headerContainer: { marginBottom: 16 },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  userInfo: { backgroundColor: "#f3f3f3", padding: 15, borderRadius: 8 },
  label: { fontWeight: "bold" },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 10,
  },
  dropdownContainer: { flexDirection: "row", marginBottom: 15 },
  itemContainer: {
    backgroundColor: "#eaeaea",
    padding: 12,
    marginBottom: 10,
    borderRadius: 6,
  },
  itemDate: { fontWeight: "bold", marginBottom: 6 },
  itemText: { fontSize: 14, marginLeft: 6 },
  itemTotal: { marginTop: 8, fontWeight: "bold", color: "#333" },
});

export default AdminUserDetailsScreen;
