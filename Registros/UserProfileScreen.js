import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, getDoc } from 'firebase/firestore';
import { firestore, auth } from '../firebaseConfig';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

const UserProfileScreen = ({ navigation }) => {
  const { t } = useTranslation();
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
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066ff" />
          <Text style={styles.loadingText}>{t("Cargando perfil...")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const direccion = userData?.direccion || {};

  const ProfileItem = ({ icon, label, value }) => (
    <View style={styles.profileItem}>
      <View style={styles.itemHeader}>
        <Ionicons name={icon} size={20} color="#0066ff" />
        <Text style={styles.itemLabel}>{label}</Text>
      </View>
      <Text style={styles.itemValue}>{value || t('No disponible')}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{t("Perfil del Usuario")}</Text>

        {user && userData ? (
          <>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={50} color="#0066ff" />
              </View>
              <Text style={styles.userName}>
                {userData.nombre} {userData.apellido}
              </Text>
            </View>

            {/* Información Personal */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="person-circle-outline" size={20} color="#b0b0b0" /> {t("Información Personal")}
              </Text>
              
              <ProfileItem
                icon="mail-outline"
                label={t("Correo")}
                value={user.email}
              />
              <ProfileItem
                icon="person-outline"
                label={t("Nombre")}
                value={userData.nombre}
              />
              <ProfileItem
                icon="person-outline"
                label={t("Apellido")}
                value={userData.apellido}
              />
              <ProfileItem
                icon="call-outline"
                label={t("Teléfono")}
                value={userData.telefono}
              />
            </View>

            {/* Dirección */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="location-outline" size={20} color="#b0b0b0" /> {t("Dirección")}
              </Text>
              
              <ProfileItem
                icon="mail-outline"
                label={t("Código Postal")}
                value={direccion.codigoPostal}
              />
              <ProfileItem
                icon="business-outline"
                label={t("Provincia")}
                value={direccion.prefectura}
              />
              <ProfileItem
                icon="location-outline"
                label={t("Ciudad")}
                value={direccion.ciudad}
              />
              <ProfileItem
                icon="home-outline"
                label={t("Barrio")}
                value={direccion.barrio}
              />
              <ProfileItem
                icon="keypad-outline"
                label={t("Número")}
                value={direccion.numero}
              />
            </View>

            {/* Botón Editar Perfil */}
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate('EditarPerfil', { userData })}
            >
              <Ionicons name="create-outline" size={20} color="#1a1a1a" />
              <Text style={styles.editButtonText}>{t("Editar Perfil")}</Text>
            </TouchableOpacity>

            {/* Botón Cerrar Sesión */}
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={20} color="#ff4444" />
              <Text style={styles.logoutButtonText}>{t("Cerrar Sesión")}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="alert-circle-outline" size={60} color="#666666" />
            <Text style={styles.emptyText}>{t("No hay datos de usuario")}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  container: {
    padding: 20,
    backgroundColor: '#1a1a1a',
    flexGrow: 1,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#b0b0b0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
    color: '#ffffff',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#0066ff',
    marginBottom: 15,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  section: {
    backgroundColor: '#252525',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  profileItem: {
    marginBottom: 15,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemLabel: {
    fontSize: 14,
    color: '#b0b0b0',
    marginLeft: 8,
  },
  itemValue: {
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 28,
  },
  editButton: {
    backgroundColor: '#0066ff',
    borderRadius: 12,
    height: 55,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#0066ff',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  editButtonText: {
    color: '#1a1a1a',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  logoutButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    height: 55,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ff4444',
  },
  logoutButtonText: {
    color: '#ff4444',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 15,
  },
});

export default UserProfileScreen;
