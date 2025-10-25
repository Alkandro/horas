import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";

import LoginScreen from "./Login/LoginScreen";
import RegisterScreen from "./Login/RegisterScreen";
import AdminTabsNavigator from "./Amin/AdminTabsNavigator";
import UserTabNavigator from "./Registros/UserTabNavigator";
import EditarPerfilScreen from "./Registros/EditarPerfilScreen";
import EditarRegistroScreen from "./Registros/EditarRegistroScreen";
import AdminUserDetailsScreen from "./Amin/AdminUserDetailsScreen";
import AdminUserMonthlySummaryScreen from "./Amin/AdminUserMonthlySummaryScreen";
import EditarArticuloScreen from "./Amin/EditarArticuloScreen";

import { auth, firestore } from "./firebaseConfig";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

const Stack = createNativeStackNavigator();

const AdminStackNavigator = () => {
  const { t } = useTranslation();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#2a2a2a",
        },
        headerTintColor: "#ffffff",
        headerTitleStyle: {
          fontWeight: "bold",
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
        options={{ title: t("Editar ArtÃ­culo") }}
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
          console.log("No se encontrÃ³ el documento del usuario en Firestore.");
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
                <Stack.Screen
                  name="AdminStack"
                  component={AdminStackNavigator}
                />
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
                      backgroundColor: "#2a2a2a",
                    },
                    headerTintColor: "#ffffff",
                    headerTitleStyle: {
                      fontWeight: "bold",
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
                      backgroundColor: "#2a2a2a",
                    },
                    headerTintColor: "#ffffff",
                    headerTitleStyle: {
                      fontWeight: "bold",
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
