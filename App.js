import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import LoginScreen from './Login/LoginScreen';
import RegisterScreen from './Login/RegisterScreen';
import Historial from './Registros/Historial';
import AdminHomeScreen from './Amin/AdminHomeScreen';
import AdminUserDetailsScreen from './Amin/AdminUserDetailsScreen';
import AdminCreateUserScreen from './Amin/AdminCreateUserScreen';
import UserProfileScreen from './Registros/UserProfileScreen';
import EditarPerfilScreen from './Registros/EditarPerfilScreen';
import RegistroYCalculoDiario from './Registros/RegistroYCalculoDiario';
import { auth, firestore } from './firebaseConfig';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const UserTabNavigator = () => (
  <Tab.Navigator>
    <Tab.Screen name="Producción" component={RegistroYCalculoDiario} />
    <Tab.Screen name="Perfil" component={UserProfileScreen} />
    <Tab.Screen name="Historial" component={Historial} />
  </Tab.Navigator>
);

const AdminStackNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="AdminHome" component={AdminHomeScreen} options={{ headerShown: false }} />
    <Stack.Screen name="AdminUserDetails" component={AdminUserDetailsScreen} options={{ title: 'Detalles del Usuario' }} />
    <Stack.Screen name="AdminCreateUser" component={AdminCreateUserScreen} options={{ title: 'Crear Usuario' }} />
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
        const userDoc = await getDoc(doc(firestore, 'users', authUser.uid));
        if (userDoc.exists()) {
          const role = userDoc.data().role;
          console.log('Rol detectado:', role); // 👀 para verificar
          setUserRole(role);
        } else {
          console.log('No se encontró el documento del usuario en Firestore.');
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
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : userRole === 'admin' ? (
          <>
            <Stack.Screen name="AdminStack" component={AdminStackNavigator} />
          </>
        ) : (
          <>
            <Stack.Screen name="UserHome" component={UserTabNavigator} />
            <Stack.Screen name="EditarPerfil" component={EditarPerfilScreen} options={{ title: 'Editar Perfil' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
