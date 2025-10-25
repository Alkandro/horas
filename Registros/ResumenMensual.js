import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Share, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { firestore, auth } from '../firebaseConfig';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const ResumenMensual = () => {
  const { t } = useTranslation();
  const [resumenes, setResumenes] = useState([]);
  const [generandoPDF, setGenerandoPDF] = useState(false);

  const cargarResumenes = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    try {
      // Obtener todos los registros de production del usuario
      const q = query(
        collection(firestore, 'production'),
        where('userId', '==', userId)
      );
      
      const snapshot = await getDocs(q);
      const registros = snapshot.docs.map(doc => doc.data());

      // Agrupar por año y mes
      const agrupado = {};
      
      registros.forEach(registro => {
        const fecha = registro.fecha; // formato: "YYYY-MM-DD"
        if (!fecha) return;
        
        const [año, mes] = fecha.split('-');
        const key = `${año}-${mes}`;
        
        if (!agrupado[key]) {
          agrupado[key] = {
            año: parseInt(año),
            mes: parseInt(mes),
            total: 0,
            registros: []
          };
        }
        
        const total = parseFloat(registro.total) || 0;
        agrupado[key].total += total;
        agrupado[key].registros.push(registro);
      });

      // Convertir a array y ordenar
      const resumenesArray = Object.values(agrupado).sort((a, b) => {
        if (a.año !== b.año) return b.año - a.año;
        return b.mes - a.mes;
      });

      setResumenes(resumenesArray);
    } catch (error) {
      console.error('Error al cargar resúmenes:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarResumenes();
    }, [])
  );

  const getMesNombre = (mes) => {
    const meses = [
      t('Enero'), t('Febrero'), t('Marzo'), t('Abril'), t('Mayo'), t('Junio'),
      t('Julio'), t('Agosto'), t('Septiembre'), t('Octubre'), t('Noviembre'), t('Diciembre')
    ];
    return meses[mes - 1] || mes;
  };

  const generarPDF = async (resumen) => {
    try {
      setGenerandoPDF(true);
      
      const user = auth.currentUser;
      const mesNombre = getMesNombre(resumen.mes);
      
      // Crear contenido HTML del PDF
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Resumen Mensual - ${mesNombre} ${resumen.año}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 40px;
      background-color: #f5f5f5;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #0066ff;
    }
    .header h1 {
      color: #0066ff;
      margin: 0;
      font-size: 28px;
    }
    .header p {
      color: #666;
      margin: 5px 0;
    }
    .summary {
      background-color: #0066ff;
      color: white;
      padding: 20px;
      border-radius: 10px;
      margin-bottom: 30px;
      text-align: center;
    }
    .summary h2 {
      margin: 0 0 10px 0;
      font-size: 24px;
    }
    .summary .total {
      font-size: 36px;
      font-weight: bold;
      margin: 10px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      background-color: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    th {
      background-color: #0066ff;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: bold;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #ddd;
    }
    tr:hover {
      background-color: #f5f5f5;
    }
    .footer {
      margin-top: 30px;
      text-align: center;
      color: #666;
      font-size: 12px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
    }
    .stats {
      display: flex;
      justify-content: space-around;
      margin: 20px 0;
    }
    .stat-box {
      background-color: white;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      flex: 1;
      margin: 0 10px;
    }
    .stat-box h3 {
      color: #0066ff;
      margin: 0 0 5px 0;
      font-size: 14px;
    }
    .stat-box p {
      font-size: 24px;
      font-weight: bold;
      margin: 0;
      color: #333;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Resumen Mensual de Producción</h1>
    <p><strong>${mesNombre} ${resumen.año}</strong></p>
    <p>Usuario: ${user.email}</p>
    <p>Generado: ${dayjs().format('DD/MM/YYYY HH:mm')}</p>
  </div>

  <div class="summary">
    <h2>Total del Mes</h2>
    <div class="total">¥${Math.round(resumen.total).toLocaleString()}</div>
  </div>

  <div class="stats">
    <div class="stat-box">
      <h3>Total de Registros</h3>
      <p>${resumen.registros.length}</p>
    </div>
    <div class="stat-box">
      <h3>Piezas Totales</h3>
      <p>${resumen.registros.reduce((sum, r) => sum + (r.cantidad || 0), 0)}</p>
    </div>
    <div class="stat-box">
      <h3>Promedio Diario</h3>
      <p>¥${Math.round(resumen.total / resumen.registros.length).toLocaleString()}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Fecha</th>
        <th>Artículo</th>
        <th>Cantidad</th>
        <th>Valor/Nudo</th>
        <th>Nudos</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      ${resumen.registros
        .sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''))
        .map(registro => `
        <tr>
          <td>${dayjs(registro.fecha).format('DD/MM/YYYY')}</td>
          <td>${registro.articulo || '-'}</td>
          <td>${registro.cantidad || 0} pcs${registro.piezasDanadas ? ` (${registro.piezasDanadas} dañadas)` : ''}</td>
          <td>¥${(registro.valorNudo || 0).toFixed(2)}</td>
          <td>${registro.nudos || 0}</td>
          <td><strong>¥${(registro.total || 0).toFixed(2)}</strong></td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="footer">
    <p>Este documento fue generado automáticamente por el sistema de gestión de producción</p>
    <p>© ${resumen.año} - Todos los derechos reservados</p>
  </div>
</body>
</html>
      `;

      // Guardar HTML como archivo temporal
      const fileName = `resumen_${mesNombre}_${resumen.año}.html`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, htmlContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Compartir el archivo
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/html',
          dialogTitle: `${t('Resumen')} - ${mesNombre} ${resumen.año}`,
        });
      } else {
        Alert.alert(t('Error'), t('No se puede compartir archivos en este dispositivo'));
      }

      setGenerandoPDF(false);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      Alert.alert(t('Error'), t('No se pudo generar el PDF'));
      setGenerandoPDF(false);
    }
  };

  const compartirTexto = async (resumen) => {
    try {
      const mesNombre = getMesNombre(resumen.mes);
      const mensaje = `📊 Resumen de ${mesNombre} ${resumen.año}\n\n` +
        `Total del mes: ¥${Math.round(resumen.total).toLocaleString()}\n` +
        `Registros: ${resumen.registros.length}\n` +
        `Piezas totales: ${resumen.registros.reduce((sum, r) => sum + (r.cantidad || 0), 0)}`;

      await Share.share({
        message: mensaje,
        title: `Resumen - ${mesNombre} ${resumen.año}`,
      });
    } catch (error) {
      console.error('Error al compartir:', error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.title}>{t("Resumen Histórico Mensual")}</Text>
        
        <FlatList
          data={resumenes}
          keyExtractor={(item, index) => `${item.año}-${item.mes}-${index}`}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={60} color="#666666" />
              <Text style={styles.emptyText}>{t("No hay resúmenes mensuales")}</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.dateContainer}>
                  <Ionicons name="calendar" size={20} color="#0066ff" />
                  <Text style={styles.mesText}>{getMesNombre(item.mes)}</Text>
                </View>
                <View style={styles.yearBadge}>
                  <Text style={styles.yearText}>{item.año}</Text>
                </View>
              </View>
              
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Ionicons name="document-text" size={16} color="#b0b0b0" />
                  <Text style={styles.statText}>{item.registros.length} {t('registros')}</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="cube" size={16} color="#b0b0b0" />
                  <Text style={styles.statText}>
                    {item.registros.reduce((sum, r) => sum + (r.cantidad || 0), 0)} pcs
                  </Text>
                </View>
              </View>
              
              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>{t("Total")}:</Text>
                <Text style={styles.totalAmount}>¥{Math.round(item.total).toLocaleString()}</Text>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => generarPDF(item)}
                  disabled={generandoPDF}
                >
                  <Ionicons name="document-text" size={20} color="#0066ff" />
                  <Text style={styles.actionButtonText}>{t('Generar PDF')}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => compartirTexto(item)}
                >
                  <Ionicons name="share-social" size={20} color="#00cc66" />
                  <Text style={styles.actionButtonText}>{t('Compartir')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  container: { 
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: '#1a1a1a',
  },
  title: { 
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#ffffff',
  },
  listContent: {
    paddingBottom: 100,
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
  card: {
    backgroundColor: '#252525',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#3a3a3a',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mesText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 10,
  },
  yearBadge: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  yearText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#b0b0b0',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: '#b0b0b0',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  totalLabel: {
    fontSize: 16,
    color: '#b0b0b0',
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00ff88',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#3a3a3a',
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default ResumenMensual;
