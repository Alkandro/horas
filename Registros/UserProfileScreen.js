import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { auth, firestore } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { useTranslation } from "react-i18next";

const UserProfileScreen = ({ navigation }) => {
  const { t } = useTranslation(); // Hook para traducción
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        setLoading(true);
        try {
          if (user) {
            const docRef = doc(firestore, 'users', user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              setUserData(docSnap.data());
            }
          }
        } catch (error) {
          console.error(t('Error al cargar perfil:'), error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, [])
  );

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error(t('Error al cerrar sesión:'), error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Cargando perfil...</Text>
      </View>
    );
  }

  const direccion = userData?.direccion || {};

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{t("Perfil del Usuario")}</Text>

      {user && userData ? (
       <>
       <Text style={styles.item}><Text style={styles.label}>{t("Correo")}:</Text> {user.email}</Text>
       <Text style={styles.item}><Text style={styles.label}>{t("Nombre")}:</Text> {userData.nombre}</Text>
       <Text style={styles.item}><Text style={styles.label}>{t("Apellido")}:</Text> {userData.apellido}</Text>
       <Text style={styles.item}><Text style={styles.label}>{t("Teléfono")}:</Text> {userData.telefono}</Text>
       <Text style={styles.item}><Text style={styles.label}>{t("Código Postal")}:</Text> {direccion.codigoPostal || t('No disponible')}</Text>
       <Text style={styles.item}><Text style={styles.label}>{t("Provincia")}:</Text> {direccion.prefectura || t('No disponible')}</Text>
       <Text style={styles.item}><Text style={styles.label}>{t("Ciudad")}:</Text> {direccion.ciudad || t('No disponible')}</Text>
       <Text style={styles.item}><Text style={styles.label}>{t("Barrio")}:</Text> {direccion.barrio || t('No disponible')}</Text>
       <Text style={styles.item}><Text style={styles.label}>{t("Número")}:</Text> {direccion.numero || t('No disponible')}</Text>
     
       <View style={{ marginTop: 20 }}>
         <Button
           title="Editar Perfil"
           onPress={() => navigation.navigate('EditarPerfil', { userData })}
         />
       </View>
     </>
      ) : (
        <Text>{t("No hay datos de usuario")}</Text>
      )}

      <View style={{ marginTop: 20 }}>
        <Button title={t("Cerrar Sesión")} onPress={handleLogout} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  value: {
    fontSize: 16,
    marginBottom: 15,
  },
  item: {
    fontSize: 16,
    marginBottom: 10,
  },
});

export default UserProfileScreen;
