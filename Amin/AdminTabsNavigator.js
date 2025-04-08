// Amin/AdminTabsNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AdminHomeScreen from './AdminHomeScreen';
import AdminCrearArticuloScreen from './AdminCrearArticuloScreen';
import AdminArticulosScreen from './AdminArticulosScreen';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

const AdminTabsNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Usuarios') {
            iconName = 'people';
          } else if (route.name === 'Crear Artículo') {
            iconName = 'add-circle';
          } else if (route.name === 'Ver Artículos') {
            iconName = 'cube';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Usuarios" component={AdminHomeScreen} />
      <Tab.Screen name="Crear Artículo" component={AdminCrearArticuloScreen} />
      <Tab.Screen name="Ver Artículos" component={AdminArticulosScreen} />
    </Tab.Navigator>
  );
};

export default AdminTabsNavigator;
