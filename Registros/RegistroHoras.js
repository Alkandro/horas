import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';

function RegistroHoras({ navigation }) {
  const [horaEntrada, setHoraEntrada] = useState('');
  const [horaSalida, setHoraSalida] = useState('');
  const [horasTrabajadas, setHorasTrabajadas] = useState(0);

  function redondearHoras(horas) {
    const horasString = horas.toFixed(3);
    const decimales = horasString.slice(-3);
    const parteEntera = parseFloat(horasString.slice(0, -4));
    const primerosDosDecimales = parseFloat(horasString.slice(-3, -1));
    const tercerDecimal = parseInt(horasString.slice(-1));

    if (tercerDecimal >= 5) {
      return (parteEntera + primerosDosDecimales / 100 + 0.01).toFixed(2);
    } else {
      return (parteEntera + primerosDosDecimales / 100).toFixed(2);
    }
  }

  const calcularHoras = async () => {
    const entrada = moment(horaEntrada, 'HH:mm');
    const salida = moment(horaSalida, 'HH:mm');
    const diferencia = moment.duration(salida.diff(entrada));
    const horas = diferencia.asHours();
    const horasRedondeadas = redondearHoras(horas);
    setHorasTrabajadas(horasRedondeadas);
    try {
      await AsyncStorage.setItem('horasTrabajadas', JSON.stringify(horasRedondeadas));
      console.log('Horas guardadas con éxito');
    } catch (error) {
      console.error('Error al guardar horas:', error);
    }
  };

  return (
    <View>
      <TextInput placeholder="Hora de entrada (HH:mm)" onChangeText={setHoraEntrada} />
      <TextInput placeholder="Hora de salida (HH:mm)" onChangeText={setHoraSalida} />
      <Button title="Calcular" onPress={calcularHoras} />
      <Text>Horas trabajadas: {horasTrabajadas}</Text>
      <Button
        title="Ir a Registro de Piezas"
        onPress={() => navigation.navigate('Registro Piezas')}
      />
    </View>
  );
}

export default RegistroHoras;