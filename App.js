// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import RegistroHoras from './RegistroHoras';
import RegistroPiezas from './RegistroPiezas';
import CalculoDiario from './CalculoDiario';
import Historial from './Historial'; // Importa el componente Historial

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Horas" component={RegistroHoras} />
        <Tab.Screen name="Piezas" component={RegistroPiezas} />
        <Tab.Screen name="Cálculo" component={CalculoDiario} />
        <Tab.Screen name="Historial" component={Historial} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}