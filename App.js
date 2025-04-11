import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import LoginScreen from "./Login/LoginScreen";
import RegisterScreen from "./Login/RegisterScreen";
import Historial from "./Registros/Historial";
import AdminHomeScreen from "./Amin/AdminHomeScreen";
import AdminUserDetailsScreen from "./Amin/AdminUserDetailsScreen";
import AdminCreateUserScreen from "./Amin/AdminCreateUserScreen";
import UserProfileScreen from "./Registros/UserProfileScreen";
import EditarPerfilScreen from "./Registros/EditarPerfilScreen";
import RegistroYCalculoDiario from "./Registros/RegistroYCalculoDiario";
import AdminTabsNavigator from "./Amin/AdminTabsNavigator";
import EditarRegistroScreen from "./Registros/EditarRegistroScreen";
import Toast from "react-native-toast-message";
import ResumenMensual from "./Registros/ResumenMensual"; // Asegurate de que esta ruta sea correcta
import AdminUserMonthlySummaryScreen from './Amin/AdminUserMonthlySummaryScreen';
import { Ionicons } from "@expo/vector-icons";

import { auth, firestore } from "./firebaseConfig";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const UserTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: true,
      
      tabBarLabelStyle: { fontSize: 13 },
      tabBarIcon: ({ color, size }) => {
        let iconName;

        if (route.name === "Producción") {
          iconName = "construct"; // 🛠️ producción
        } else if (route.name === "Perfil") {
          iconName = "person-circle"; // 👤 perfil
        } else if (route.name === "Historial") {
          iconName = "list"; // 📋 historial
        } else if (route.name === "Resumen") {
          iconName = "calendar"; // 📆 resumen mensual
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Producción" component={RegistroYCalculoDiario} />
    <Tab.Screen name="Historial" component={Historial} />
    <Tab.Screen name="Resumen" component={ResumenMensual} />
    <Tab.Screen name="Perfil" component={UserProfileScreen} />
  </Tab.Navigator>
);

const AdminStackNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="AdminTabs"
      component={AdminTabsNavigator}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="AdminUserDetails"
      component={AdminUserDetailsScreen}
      options={{ title: "Detalles del Usuario" }}
    />
    <Stack.Screen
  name="AdminUserMonthlySummary"
  component={AdminUserMonthlySummaryScreen}
  options={{ title: 'Resumen Mensual del Usuario' }}
/>
  </Stack.Navigator>
);

const App = () => {
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
          console.log("Rol detectado:", role); // 👀 para verificar
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
                options={{ title: "Editar Perfil" }}
              />
              <Stack.Screen
                name="EditarRegistro"
                component={EditarRegistroScreen}
                options={{ title: "Editar Registro" }}
              />
            </>
          )}
        </Stack.Navigator>
        <Toast />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default App;
