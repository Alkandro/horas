// import React, { useState, useEffect, useCallback } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   StyleSheet,
//   TouchableOpacity,
//   Button,
//   Alert,
// } from "react-native";
// import {
//   collection,
//   getDocs,
//   query,
//   where,
//   doc,
//   deleteDoc,
// } from "firebase/firestore";
// import { useFocusEffect } from "@react-navigation/native";
// import Icon from "react-native-vector-icons/MaterialIcons";
// import { firestore, auth } from "../firebaseConfig";
// import { useTranslation } from "react-i18next";

// const AdminHomeScreen = ({ navigation }) => {
//   const { t } = useTranslation(); // Hook para traducción
//   const [usersData, setUsersData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [refreshing, setRefreshing] = useState(false);

//   const fetchUsersData = async (isRefreshing = false) => {
//     try {
//       if (isRefreshing) {
//         setRefreshing(true);
//       } else {
//         setLoading(true);
//       }

//       const usersCollection = collection(firestore, "users");
//       const snapshot = await getDocs(usersCollection);

//       const usersList = await Promise.all(
//         snapshot.docs
//           .filter((docSnap) => docSnap.data().role !== "admin") // ⛔ excluir admin
//           .map(async (docSnap) => {
//             const userData = docSnap.data();
//             const userId = docSnap.id;

//             const productionQuery = query(
//               collection(firestore, "production"),
//               where("userId", "==", userId)
//             );
//             const productionSnapshot = await getDocs(productionQuery);
//             const productionData = productionSnapshot.docs.map((prodDoc) =>
//               prodDoc.data()
//             );

//             return {
//               userId,
//               ...userData,
//               productionData: productionData.sort(
//                 (a, b) => new Date(b.fecha) - new Date(a.fecha)
//               ),
//             };
//           })
//       );

//       setUsersData(usersList);
//     } catch (e) {
//       setError(t("Error al obtener datos de usuarios"));
//       console.error(t("Error fetching admin data"), e);
//     } finally {
//       if (isRefreshing) {
//         setRefreshing(false);
//       } else {
//         setLoading(false);
//       }
//     }
//   };

//   // 🔁 Se ejecuta cada vez que la pantalla vuelve a estar activa
//   useFocusEffect(
//     useCallback(() => {
//       fetchUsersData();
//     }, [])
//   );
//   const handleLogout = async () => {
//     try {
//       await auth.signOut();
//     } catch (error) {
//       console.error(t("Error al cerrar sesión"), error);
//     }
//   };

//   const handleUserPress = (user) => {
//     navigation.navigate("AdminUserDetails", { user });
//   };

//   if (loading) {
//     return (
//       <View>
//         <Text>{t("Cargando datos...")}</Text>
//       </View>
//     );
//   }

//   if (error) {
//     return (
//       <View>
//         <Text>{t("Error")} {error}</Text>
//       </View>
//     );
//   }
//   const confirmarEliminacionUsuario = (userId) => {
//     Alert.alert(
//       t("Confirmar eliminación"),
//       t("¿Estás seguro de que quieres eliminar este usuario?"),
//       [
//         { text: t("Cancelar"), style: "cancel" },
//         {
//           text: t("Eliminar"),
//           style: "destructive",
//           onPress: async () => {
//             try {
//               await deleteDoc(doc(firestore, "users", userId));
//               fetchUsersData(true); // Refrescar lista
//             } catch (error) {
//               console.error(t("Error al eliminar usuario"), error);
//               Alert.alert(t("Error"), t("No se pudo eliminar el usuario"));
//             }
//           },
//         },
//       ]
//     );
//   };

//   const eliminarUsuario = async (userId) => {
//     try {
//       await deleteDoc(doc(firestore, "users", userId));
//       setUsersData(usersData.filter((u) => u.userId !== userId));
//       Alert.alert(t("Usuario eliminado"));
//     } catch (error) {
//       console.error(t("Error al eliminar usuario"), error);
//       Alert.alert(t("Error"), t("No se pudo eliminar el usuario"));
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>{t("Panel de Administración")}</Text>
//       <FlatList
//         data={usersData}
//         keyExtractor={(item) => item.userId}
//         renderItem={({ item }) => (
//           <TouchableOpacity
//             onPress={() => handleUserPress(item)}
//             style={styles.userCard}
//           >
//             <View
//               style={{
//                 flexDirection: "row",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//               }}
//             >
//               <View style={{ flex: 1 }}>
//                 <Text style={styles.userName}>
//                   {item.nombre} {item.apellido}
//                 </Text>
//                 <Text>{t("Teléfono")}: {item.telefono || t("No disponible")}</Text>
//                 <Text style={styles.userName}>{t("Usuario")}: {item.email}</Text>
//               </View>
//               <TouchableOpacity
//                 onPress={() => confirmarEliminacionUsuario(item.userId)}
//                 style={styles.iconContainer}
//               >
//                 <Icon name="delete" size={20} color="#d32f2f" />
//               </TouchableOpacity>
//             </View>
//           </TouchableOpacity>
//         )}
//         refreshing={refreshing}
//         onRefresh={() => fetchUsersData(true)}
//       />

//       <Button title={t("Cerrar Sesión")} onPress={handleLogout} />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 10,
//     backgroundColor: "#f0f0f0",
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginBottom: 15,
//     textAlign: "center",
//     marginTop: 60,
//   },
//   userCard: {
//     backgroundColor: "white",
//     padding: 15,
//     marginBottom: 10,
//     borderRadius: 5,
//     borderWidth: 1,
//     borderColor: "#ddd",
//   },
//   iconContainer: {
//     paddingLeft: 10,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   userName: {
//     fontWeight: "bold",
//     marginBottom: 5,
//   },
// });

// export default AdminHomeScreen;
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import { firestore, auth } from "../firebaseConfig";
import { useTranslation } from "react-i18next";

const AdminHomeScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [usersData, setUsersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsersData = async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const usersCollection = collection(firestore, "users");
      const snapshot = await getDocs(usersCollection);

      const usersList = await Promise.all(
        snapshot.docs
          .filter((docSnap) => docSnap.data().role !== "admin")
          .map(async (docSnap) => {
            const userData = docSnap.data();
            const userId = docSnap.id;

            const productionQuery = query(
              collection(firestore, "production"),
              where("userId", "==", userId)
            );
            const productionSnapshot = await getDocs(productionQuery);
            const productionData = productionSnapshot.docs.map((prodDoc) =>
              prodDoc.data()
            );

            return {
              userId,
              ...userData,
              productionData: productionData.sort(
                (a, b) => new Date(b.fecha) - new Date(a.fecha)
              ),
            };
          })
      );

      setUsersData(usersList);
    } catch (e) {
      setError(t("Error al obtener datos de usuarios"));
      console.error(t("Error fetching admin data"), e);
    } finally {
      if (isRefreshing) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUsersData();
    }, [])
  );

  const handleLogout = async () => {
    Alert.alert(
      t("Cerrar Sesión"),
      t("¿Estás seguro de que quieres cerrar sesión?"),
      [
        { text: t("Cancelar"), style: "cancel" },
        {
          text: t("Cerrar Sesión"),
          style: "destructive",
          onPress: async () => {
            try {
              await auth.signOut();
            } catch (error) {
              console.error(t("Error al cerrar sesión"), error);
            }
          },
        },
      ]
    );
  };

  const handleUserPress = (user) => {
    navigation.navigate("AdminUserDetails", { user });
  };

  const confirmarEliminacionUsuario = (userId) => {
    Alert.alert(
      t("Confirmar eliminación"),
      t("¿Estás seguro de que quieres eliminar este usuario?"),
      [
        { text: t("Cancelar"), style: "cancel" },
        {
          text: t("Eliminar"),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(firestore, "users", userId));
              fetchUsersData(true);
            } catch (error) {
              console.error(t("Error al eliminar usuario"), error);
              Alert.alert(t("Error"), t("No se pudo eliminar el usuario"));
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066ff" />
          <Text style={styles.loadingText}>{t("Cargando datos...")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ff4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderUserCard = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleUserPress(item)}
      style={styles.userCard}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={28} color="#0066ff" />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {item.nombre} {item.apellido}
          </Text>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={14} color="#b0b0b0" />
            <Text style={styles.userEmail}>{item.email}</Text>
          </View>
          {item.telefono && (
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={14} color="#b0b0b0" />
              <Text style={styles.userPhone}>{item.telefono}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          onPress={() => confirmarEliminacionUsuario(item.userId)}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={22} color="#ff4444" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.title}>{t("Panel de Administración")}</Text>
        
        <FlatList
          data={usersData}
          keyExtractor={(item) => item.userId}
          renderItem={renderUserCard}
          refreshing={refreshing}
          onRefresh={() => fetchUsersData(true)}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color="#3a3a3a" />
              <Text style={styles.emptyText}>{t("No hay usuarios registrados")}</Text>
            </View>
          }
        />

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#ff4444" />
          <Text style={styles.logoutButtonText}>{t("Cerrar Sesión")}</Text>
        </TouchableOpacity>
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
    padding: 20,
    backgroundColor: "#1a1a1a",
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
    marginBottom: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1a2a3a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: "bold",
    marginBottom: 6,
    fontSize: 18,
    color: '#ffffff',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  userEmail: {
    fontSize: 14,
    color: '#b0b0b0',
  },
  userPhone: {
    fontSize: 14,
    color: '#b0b0b0',
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3a1a1a',
    justifyContent: "center",
    alignItems: "center",
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 15,
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
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
  logoutButton: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'transparent',
    borderRadius: 12,
    height: 55,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ff4444',
  },
  logoutButtonText: {
    color: '#ff4444',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default AdminHomeScreen;