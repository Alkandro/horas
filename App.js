import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import RegistroHoras from './RegistroHoras';
import RegistroPiezas from './RegistroPiezas';
import CalculoDiario from './CalculoDiario';
import Historial from './Historial';
import AdminHomeScreen from './AdminHomeScreen';
import { auth, firestore } from './firebaseConfig'; // Importa tus instancias de Firebase

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const UserTabNavigator = () => (
  <Tab.Navigator>
    <Tab.Screen name="Horas" component={RegistroHoras} />
    <Tab.Screen name="Piezas" component={RegistroPiezas} />
    <Tab.Screen name="Cálculo" component={CalculoDiario} />
    <Tab.Screen name="Historial" component={Historial} />
  </Tab.Navigator>
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
          setUserRole(userDoc.data().role);
        }
      } else {
        setUserRole(null);
      }
    });

    return unsubscribe; // Limpia el listener al desmontar el componente
  }, []);

  if (loadingInitialAuth) {
    return null; // O puedes mostrar una pantalla de carga inicial
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={user ? (userRole === 'admin' ? 'AdminHome' : 'UserHome') : 'Login'}>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        <Stack.Screen name="UserHome" component={UserTabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="AdminHome" component={AdminHomeScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;