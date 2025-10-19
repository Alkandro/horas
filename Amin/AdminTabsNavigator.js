// // Amin/AdminTabsNavigator.js
// import React from 'react';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import AdminHomeScreen from './AdminHomeScreen';
// import AdminCrearArticuloScreen from './AdminCrearArticuloScreen';
// import AdminArticulosScreen from './AdminArticulosScreen';
// import { Ionicons } from '@expo/vector-icons';
// import { useTranslation } from "react-i18next";

// const Tab = createBottomTabNavigator();


// const AdminTabsNavigator = () => {
//   const { t } = useTranslation(); // Hook para traducción
//   return (
//     <Tab.Navigator
//       screenOptions={({ route }) => ({
//         tabBarIcon: ({ color, size }) => {
//           let iconName;
//           if (route.name === 'Usuarios') {
//             iconName = 'people';
//           } else if (route.name === 'Crear Artículo') {
//             iconName = 'add-circle';
//           } else if (route.name === 'Ver Artículos') {
//             iconName = 'cube';
         
//           }
//           return <Ionicons name={iconName} size={size} color={color} />;
//         },
//         headerShown: false,
//       })}
//     >
//       <Tab.Screen name={t("Usuarios")} component={AdminHomeScreen} />
//       <Tab.Screen name={t("Crear Artículo")} component={AdminCrearArticuloScreen} />
//       <Tab.Screen name={t("Ver Artículos")} component={AdminArticulosScreen} />
      
//     </Tab.Navigator>
//   );
// };

// export default AdminTabsNavigator;


import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AdminHomeScreen from './AdminHomeScreen';
import AdminCrearArticuloScreen from './AdminCrearArticuloScreen';
import AdminArticulosScreen from './AdminArticulosScreen';
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
          } else if (route.name === 'Crear Artículo') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Ver Artículos') {
            iconName = focused ? 'cube' : 'cube-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        headerShown: false,
        tabBarActiveTintColor: '#0066ff',
        tabBarInactiveTintColor: '#666666',
        tabBarStyle: {
          backgroundColor: '#2a2a2a',
          borderTopWidth: 0,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
          position: 'absolute',
          bottom: 10,
          left: 10,
          right: 10,
          borderRadius: 20,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen 
        name="Usuarios" 
        component={AdminHomeScreen}
        options={{ title: t("Usuarios") }}
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
