// import React, { useState, useEffect } from "react";
// import { NavigationContainer } from "@react-navigation/native";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// import { GestureHandlerRootView } from "react-native-gesture-handler";
// import { onAuthStateChanged } from "firebase/auth";
// import { doc, getDoc } from "firebase/firestore";
// import { useTranslation } from "react-i18next";

// import LoginScreen from "./Login/LoginScreen";
// import RegisterScreen from "./Login/RegisterScreen";
// import Historial from "./Registros/Historial";
// import AdminHomeScreen from "./Amin/AdminHomeScreen";
// import AdminUserDetailsScreen from "./Amin/AdminUserDetailsScreen";
// import UserProfileScreen from "./Registros/UserProfileScreen";
// import EditarPerfilScreen from "./Registros/EditarPerfilScreen";
// import RegistroYCalculoDiario from "./Registros/RegistroYCalculoDiario";
// import AdminTabsNavigator from "./Amin/AdminTabsNavigator";
// import EditarRegistroScreen from "./Registros/EditarRegistroScreen";
// import Toast from "react-native-toast-message";
// import ResumenMensual from "./Registros/ResumenMensual"; // Asegurate de que esta ruta sea correcta
// import AdminUserMonthlySummaryScreen from './Amin/AdminUserMonthlySummaryScreen';
// import EditarArticuloScreen from './Amin/EditarArticuloScreen';
// import { Ionicons } from "@expo/vector-icons";

// import { auth, firestore } from "./firebaseConfig";

// const Stack = createNativeStackNavigator();
// const Tab = createBottomTabNavigator();


// const UserTabNavigator = () => {
//   const { t } = useTranslation(); // ✅ Debe estar aquí

//   return (
//     <Tab.Navigator
//       screenOptions={({ route }) => ({
//         headerShown: true,
//         headerTitleAlign: 'center',
//         tabBarLabelStyle: { fontSize: 13 },
//         tabBarStyle: {
//           position: 'absolute',
//           bottom: 10,
//           left: 16,
//           right: 16,
//           borderRadius: 20,
//           backgroundColor: '#fff',
//           elevation: 4,
//           height: 65,
//         },
//         tabBarIcon: ({ color, size }) => {
//           let iconName;
//           const routeName = route.name;

//           if (routeName === t("Producción")) iconName = "construct";
//           else if (routeName === t("Perfil")) iconName = "person-circle";
//           else if (routeName === t("Historial")) iconName = "list";
//           else if (routeName === t("Resumen")) iconName = "calendar";

//           return <Ionicons name={iconName} size={size} color={color} />;
//         },
//       })}
//     >
//       <Tab.Screen name={t("Producción")} component={RegistroYCalculoDiario} />
//       <Tab.Screen name={t("Historial")} component={Historial} />
//       <Tab.Screen name={t("Resumen")} component={ResumenMensual} />
//       <Tab.Screen name={t("Perfil")} component={UserProfileScreen} />
//     </Tab.Navigator>
//   );
// };

// const AdminStackNavigator = () => {
//   const { t } = useTranslation(); // ✅ También aquí

//   return (
//     <Stack.Navigator>
//       <Stack.Screen
//         name="AdminTabs"
//         component={AdminTabsNavigator}
//         options={{ headerShown: false }}
//       />
//       <Stack.Screen
//         name="AdminUserDetails"
//         component={AdminUserDetailsScreen}
//         options={{ title: t("Detalles del Usuario") }}
//       />
//       <Stack.Screen
//         name="AdminUserMonthlySummary"
//         component={AdminUserMonthlySummaryScreen}
//         options={{ title: t("Resumen Mensual del Usuario") }}
//       />
//       <Stack.Screen
//         name="EditarArticulo"
//         component={EditarArticuloScreen}
//         options={{ title: t("Editar Artículo") }}
//       />
//     </Stack.Navigator>
//   );
// };

// const App = () => {
//   const { t } = useTranslation(); // Hook para traducción
//   const [user, setUser] = useState(null);
//   const [loadingInitialAuth, setLoadingInitialAuth] = useState(true);
//   const [userRole, setUserRole] = useState(null);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
//       setUser(authUser);
//       setLoadingInitialAuth(false);

//       if (authUser) {
//         const userDoc = await getDoc(doc(firestore, "users", authUser.uid));
//         if (userDoc.exists()) {
//           const role = userDoc.data().role;
//           console.log("Rol detectado:", role); // 👀 para verificar
//           setUserRole(role);
//         } else {
//           console.log("No se encontró el documento del usuario en Firestore.");
//           setUserRole(null);
//         }
//       } else {
//         setUserRole(null);
//       }
//     });

//     return unsubscribe;
//   }, []);

//   if (loadingInitialAuth) return null;

//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <NavigationContainer>
//         <Stack.Navigator screenOptions={{ headerShown: false }}>
//           {!user ? (
//             <>
//               <Stack.Screen name="Login" component={LoginScreen} />
//               <Stack.Screen name="Register" component={RegisterScreen} />
//             </>
//           ) : userRole === "admin" ? (
//             <>
//               <Stack.Screen name="AdminStack" component={AdminStackNavigator} />
//             </>
//           ) : (
//             <>
//               <Stack.Screen name="UserHome" component={UserTabNavigator} />
//               <Stack.Screen
//                 name="EditarPerfil"
//                 component={EditarPerfilScreen}
//                 options={{ title: t("Editar Perfil") }}
//               />
//               <Stack.Screen
//                 name="EditarRegistro"
//                 component={EditarRegistroScreen}
//                 options={{ title: t("Editar Registro") }}
//               />
//             </>
//           )}
//         </Stack.Navigator>
//         <Toast />
//       </NavigationContainer>
//     </GestureHandlerRootView>
//   );
// };

// export default App;

import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useTranslation } from "react-i18next";

import LoginScreen from "./Login/LoginScreen";
import RegisterScreen from "./Login/RegisterScreen";
import Historial from "./Registros/Historial";
import AdminHomeScreen from "./Amin/AdminHomeScreen";
import AdminUserDetailsScreen from "./Amin/AdminUserDetailsScreen";
import UserProfileScreen from "./Registros/UserProfileScreen";
import EditarPerfilScreen from "./Registros/EditarPerfilScreen";
import RegistroYCalculoDiario from "./Registros/RegistroYCalculoDiario";
import AdminTabsNavigator from "./Amin/AdminTabsNavigator";
import EditarRegistroScreen from "./Registros/EditarRegistroScreen";
import Toast from "react-native-toast-message";
import ResumenMensual from "./Registros/ResumenMensual";
import AdminUserMonthlySummaryScreen from './Amin/AdminUserMonthlySummaryScreen';
import EditarArticuloScreen from './Amin/EditarArticuloScreen';
import { Ionicons } from "@expo/vector-icons";

import { auth, firestore } from "./firebaseConfig";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();


const UserTabNavigator = () => {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarLabelStyle: { 
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarStyle: {
          position: 'absolute',
          bottom: 10,
          left: 16,
          right: 16,
          borderRadius: 20,
          backgroundColor: '#2a2a2a',
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#0066ff',
        tabBarInactiveTintColor: '#666666',
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;
          const routeName = route.name;

          if (routeName === t("Producción")) iconName = focused ? "construct" : "construct-outline";
          else if (routeName === t("Perfil")) iconName = focused ? "person-circle" : "person-circle-outline";
          else if (routeName === t("Historial")) iconName = focused ? "list" : "list-outline";
          else if (routeName === t("Resumen")) iconName = focused ? "calendar" : "calendar-outline";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name={t("Producción")} component={RegistroYCalculoDiario} />
      <Tab.Screen name={t("Historial")} component={Historial} />
      <Tab.Screen name={t("Resumen")} component={ResumenMensual} />
      <Tab.Screen name={t("Perfil")} component={UserProfileScreen} />
    </Tab.Navigator>
  );
};

const AdminStackNavigator = () => {
  const { t } = useTranslation();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2a2a2a',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="AdminTabs"
        component={AdminTabsNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AdminUserDetails"
        component={AdminUserDetailsScreen}
        options={{ title: t("Detalles del Usuario") }}
      />
      <Stack.Screen
        name="AdminUserMonthlySummary"
        component={AdminUserMonthlySummaryScreen}
        options={{ title: t("Resumen Mensual del Usuario") }}
      />
      <Stack.Screen
        name="EditarArticulo"
        component={EditarArticuloScreen}
        options={{ title: t("Editar Artículo") }}
      />
    </Stack.Navigator>
  );
};

const App = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [loadingInitialAuth, setLoadingInitialAuth] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser);
      setLoadingInitialAuth(false);

      if (authUser) {
        const userDoc = await getDoc(doc(firestore, "users", authUser.uid));
        if (userDoc.exists()) {
          const role = userDoc.data().role;
          console.log("Rol detectado:", role);
          setUserRole(role);
        } else {
          console.log("No se encontró el documento del usuario en Firestore.");
          setUserRole(null);
        }
      } else {
        setUserRole(null);
      }
    });

    return unsubscribe;
  }, []);

  if (loadingInitialAuth) return null;

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!user ? (
              <>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
              </>
            ) : userRole === "admin" ? (
              <>
                <Stack.Screen name="AdminStack" component={AdminStackNavigator} />
              </>
            ) : (
              <>
                <Stack.Screen name="UserHome" component={UserTabNavigator} />
                <Stack.Screen
                  name="EditarPerfil"
                  component={EditarPerfilScreen}
                  options={{ 
                    title: t("Editar Perfil"),
                    headerShown: true,
                    headerStyle: {
                      backgroundColor: '#2a2a2a',
                    },
                    headerTintColor: '#ffffff',
                    headerTitleStyle: {
                      fontWeight: 'bold',
                    },
                  }}
                />
                <Stack.Screen
                  name="EditarRegistro"
                  component={EditarRegistroScreen}
                  options={{ 
                    title: t("Editar Registro"),
                    headerShown: true,
                    headerStyle: {
                      backgroundColor: '#2a2a2a',
                    },
                    headerTintColor: '#ffffff',
                    headerTitleStyle: {
                      fontWeight: 'bold',
                    },
                  }}
                />
              </>
            )}
          </Stack.Navigator>
          <Toast />
        </NavigationContainer>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

export default App;