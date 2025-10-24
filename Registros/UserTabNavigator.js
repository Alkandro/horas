import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import RegistroYCalculoDiario from './RegistroYCalculoDiario';
import Historial from './Historial';
import ResumenMensual from './ResumenMensual';
import UserProfileScreen from './UserProfileScreen';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from "react-i18next";
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { firestore, auth } from '../firebaseConfig';

const Tab = createBottomTabNavigator();

const UserTabNavigator = () => {
  const { t } = useTranslation();
  const [pedidosPendientes, setPedidosPendientes] = useState(0);

  // Escuchar pedidos pendientes en tiempo real para el badge
  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const q = query(
      collection(firestore, 'pedidos'),
      where('userId', '==', userId),
      where('estado', 'in', ['pendiente', 'en_proceso'])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPedidosPendientes(snapshot.size);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Producción') {
            iconName = focused ? 'create' : 'create-outline';
          } else if (route.name === 'Historial') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Resumen') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Perfil') {
            iconName = focused ? 'person' : 'person-outline';
          }

          // Badge para Producción si hay pedidos pendientes
          if (route.name === 'Producción' && pedidosPendientes > 0) {
            return (
              <View style={styles.iconContainer}>
                <Ionicons name={iconName} size={size} color={color} />
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{pedidosPendientes}</Text>
                </View>
              </View>
            );
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
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Producción" 
        component={RegistroYCalculoDiario}
        options={{ title: t("Producción") }}
      />
      <Tab.Screen 
        name="Historial" 
        component={Historial}
        options={{ title: t("Historial") }}
      />
      <Tab.Screen 
        name="Resumen" 
        component={ResumenMensual}
        options={{ title: t("Resumen") }}
      />
      <Tab.Screen 
        name="Perfil" 
        component={UserProfileScreen}
        options={{ title: t("Perfil") }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    width: 24,
    height: 24,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: '#ff3b30',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
});

export default UserTabNavigator;
