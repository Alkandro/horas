// Amin/AdminTabsNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AdminHomeScreen from './AdminHomeScreen';
import AdminCrearArticuloScreen from './AdminCrearArticuloScreen';
import AdminArticulosScreen from './AdminArticulosScreen';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from "react-i18next";

const Tab = createBottomTabNavigator();


const AdminTabsNavigator = () => {
  const { t } = useTranslation(); // Hook para traducción
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
      <Tab.Screen name={t("Usuarios")} component={AdminHomeScreen} />
      <Tab.Screen name={t("Crear Artículo")} component={AdminCrearArticuloScreen} />
      <Tab.Screen name={t("Ver Artículos")} component={AdminArticulosScreen} />
      
    </Tab.Navigator>
  );
};

export default AdminTabsNavigator;
