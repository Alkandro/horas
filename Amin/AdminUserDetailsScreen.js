// export default AdminUserDetailsScreen;
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { useTranslation } from "react-i18next";
import { Ionicons } from '@expo/vector-icons';

dayjs.extend(utc);

const AdminUserDetailsScreen = ({ route, navigation }) => {
  const { t } = useTranslation();
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
        console.error(t("Error al cargar producción del usuario"), error);
        Alert.alert(t("Error"), t("No se pudo cargar la producción"));
      } finally {
        setLoading(false);
      }
    };

    cargarProduccion();
  }, [añoSeleccionado, mesSeleccionado]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066ff" />
          <Text style={styles.loadingText}>{t("Cargando...")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>{t("Detalles del Usuario")}</Text>

        {/* Card de información del usuario */}
        <View style={styles.userCard}>
          <View style={styles.emailHeader}>
            <Ionicons name="mail" size={24} color="#0066ff" />
            <Text style={styles.emailText}>{user.email}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="person-circle-outline" size={18} color="#b0b0b0" /> {t("Información Personal")}
            </Text>
            
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={18} color="#b0b0b0" />
              <Text style={styles.infoLabel}>{t("Nombre")}:</Text>
              <Text style={styles.infoValue}>{user.nombre}</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={18} color="#b0b0b0" />
              <Text style={styles.infoLabel}>{t("Apellido")}:</Text>
              <Text style={styles.infoValue}>{user.apellido}</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={18} color="#b0b0b0" />
              <Text style={styles.infoLabel}>{t("Teléfono")}:</Text>
              <Text style={styles.infoValue}>{user.telefono}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="location-outline" size={18} color="#b0b0b0" /> {t("Dirección")}
            </Text>
            
            <Text style={styles.addressText}>
              {`${user.direccion?.prefectura || ""}, ${user.direccion?.ciudad || ""}, ${user.direccion?.barrio || ""}, ${user.direccion?.numero || ""}`}
            </Text>

            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={18} color="#b0b0b0" />
              <Text style={styles.infoLabel}>{t("Código Postal")}:</Text>
              <Text style={styles.infoValue}>{user.direccion?.codigoPostal || t("No disponible")}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.summaryButton}
            onPress={() =>
              navigation.navigate("AdminUserMonthlySummary", {
                userId: user.userId,
              })
            }
          >
            <Ionicons name="calendar-outline" size={20} color="#0066ff" />
            <Text style={styles.summaryButtonText}>{t("Ver resumen mensual")}</Text>
          </TouchableOpacity>
        </View>

        {/* Producción Mensual */}
        <Text style={styles.subtitle}>{t("Producción Mensual")}</Text>

        <View style={styles.dropdownContainer}>
          <DropDownPicker
            placeholder={t("Año")}
            open={openAño}
            value={añoSeleccionado}
            items={itemsAño}
            setOpen={setOpenAño}
            setValue={setAñoSeleccionado}
            setItems={setItemsAño}
            containerStyle={styles.dropdownHalf}
            style={styles.dropdown}
            textStyle={styles.dropdownText}
            dropDownContainerStyle={styles.dropdownList}
            zIndex={3000}
            zIndexInverse={1000}
          />

          <DropDownPicker
            placeholder={t("Mes")}
            open={openMes}
            value={mesSeleccionado}
            items={itemsMes}
            setOpen={setOpenMes}
            setValue={setMesSeleccionado}
            setItems={setItemsMes}
            containerStyle={styles.dropdownHalf}
            style={styles.dropdown}
            textStyle={styles.dropdownText}
            dropDownContainerStyle={styles.dropdownList}
            zIndex={2000}
            zIndexInverse={2000}
          />
        </View>

        <FlatList
          data={historial}
          keyExtractor={(item) => item.fecha}
          scrollEnabled={false}
          contentContainerStyle={{ paddingBottom: 30 }}
          renderItem={({ item }) => (
            <View style={styles.dayCard}>
              <View style={styles.dayHeader}>
                <Ionicons name="calendar" size={20} color="#0066ff" />
                <Text style={styles.dayDate}>{item.fecha}</Text>
              </View>

              {item.piezas.map((pieza, index) => (
                <View key={index} style={styles.pieceRow}>
                  <Ionicons name="cube-outline" size={16} color="#b0b0b0" />
                  <Text style={styles.pieceText}>
                    {pieza.tipoPieza} - {pieza.cantidad} {t("piezas")}
                  </Text>
                  <Text style={styles.pieceValue}>¥{Math.round(pieza.ganancia)}</Text>
                </View>
              ))}

              <View style={styles.dayTotalContainer}>
                <Text style={styles.dayTotalLabel}>{t("Total día")}:</Text>
                <Text style={styles.dayTotalValue}>¥{Math.round(item.totalDia)}</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={64} color="#3a3a3a" />
              <Text style={styles.emptyText}>{t("No hay registros para este mes")}</Text>
            </View>
          }
        />
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
    backgroundColor: "#1a1a1a",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#b0b0b0',
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: '#ffffff',
  },
  userCard: {
    backgroundColor: '#252525',
    padding: 20,
    borderRadius: 12,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  emailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  emailText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#3a3a3a',
    marginBottom: 15,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#b0b0b0',
  },
  infoValue: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  addressText: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 10,
    lineHeight: 20,
  },
  summaryButton: {
    backgroundColor: '#1a2a3a',
    borderRadius: 10,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0066ff',
  },
  summaryButtonText: {
    color: '#0066ff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 15,
    color: '#ffffff',
  },
  dropdownContainer: {
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
  },
  dropdownText: {
    color: '#ffffff',
    fontSize: 16,
  },
  dropdownList: {
    backgroundColor: '#2a2a2a',
    borderColor: '#3a3a3a',
  },
  dayCard: {
    backgroundColor: '#252525',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  dayDate: {
    fontWeight: "bold",
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 8,
  },
  pieceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  pieceText: {
    fontSize: 14,
    color: '#b0b0b0',
    flex: 1,
  },
  pieceValue: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  dayTotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#3a3a3a',
  },
  dayTotalLabel: {
    fontWeight: "bold",
    fontSize: 16,
    color: '#b0b0b0',
  },
  dayTotalValue: {
    fontWeight: "bold",
    fontSize: 18,
    color: '#00ff88',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666666',
    marginTop: 20,
    fontSize: 16,
  },
});

export default AdminUserDetailsScreen;
