import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AdminHomeScreen from './AdminHomeScreen';
import AdminCrearArticuloScreen from './AdminCrearArticuloScreen';
import AdminArticulosScreen from './AdminArticulosScreen';
import AdminEnviarPedidosScreen from './AdminEnviarPedidosScreen';
import AdminSeguimientoPedidosScreen from './AdminSeguimientoPedidosScreen';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from "react-i18next";

const Tab = createBottomTabNavigator();

const AdminTabsNavigator = () => {
  const { t } = useTranslation();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'Usuarios') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Enviar Pedidos') {
            iconName = focused ? 'send' : 'send-outline';
          } else if (route.name === 'Seguimiento') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else if (route.name === 'Crear Artículo') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Ver Artículos') {
            iconName = focused ? 'cube' : 'cube-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0066ff',
        tabBarInactiveTintColor: '#666666',
        tabBarStyle: {
          backgroundColor: '#2a2a2a',
          borderTopWidth: 0,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Usuarios" 
        component={AdminHomeScreen}
        options={{ title: t("Usuarios") }}
      />
      <Tab.Screen 
        name="Enviar Pedidos" 
        component={AdminEnviarPedidosScreen}
        options={{ title: t("Enviar Pedidos") }}
      />
      <Tab.Screen 
        name="Seguimiento" 
        component={AdminSeguimientoPedidosScreen}
        options={{ title: t("Seguimiento") }}
      />
      <Tab.Screen 
        name="Crear Artículo" 
        component={AdminCrearArticuloScreen}
        options={{ title: t("Crear Artículo") }}
      />
      <Tab.Screen 
        name="Ver Artículos" 
        component={AdminArticulosScreen}
        options={{ title: t("Ver Artículos") }}
      />
    </Tab.Navigator>
  );
};

export default AdminTabsNavigator;
