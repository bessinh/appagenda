
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import React, { memo, useEffect, useState, useCallback, useMemo } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import MapView, { Marker } from 'react-native-maps';
import { listarPrestadores } from '../api/client';
import { useTheme } from '../context/ThemeContext';

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#263c3f' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6b9a76' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#38414e' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#212a37' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9ca5b3' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#746855' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1f2835' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f3d19c' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#2f3948' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#17263c' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#515c6d' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#17263c' }],
  },
];

const haversineDistance = (coords1, coords2) => {
  const R = 6371;
  const lat1 = coords1.latitude;
  const lon1 = coords1.longitude;
  const lat2 = coords2.latitude;
  const lon2 = coords2.longitude;

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
};

const DentistListItem = memo(({ item, navigation, isDarkMode }) => {
  const styles = getDynamicStyles(isDarkMode);
  return (
    <TouchableOpacity
      style={styles.listItemCard}
      onPress={() => navigation.navigate('DetalhesProfissional', { user: item })}
    >
      <View style={styles.listItemInfo}>
        <Text style={styles.listItemName}>{item.nome}</Text>
        <Text style={styles.listItemSpecialty}>{item.perfil?.especialidades?.join(', ') || 'N/A'}</Text>
        
        <View style={styles.listItemRow}>
          <MaterialIcons name="home" size={14} color={isDarkMode ? '#aaa' : '#666'} />
          <Text style={styles.listItemAddress}>{item.address}</Text>
        </View>
        
        <View style={styles.listItemRow}>
          <MaterialIcons name="near-me" size={14} color="#1C74B4" />
          <Text style={styles.listItemDistance}>{item.distance.toFixed(1)} km</Text>
        </View>
      </View>
      <AntDesign name="right" size={18} color="#1C74B4" />
    </TouchableOpacity>
  );
});

const SearchScreen = () => {
  const { isDarkMode } = useTheme();
  const styles = getDynamicStyles(isDarkMode);

  const [isLoading, setIsLoading] = useState(true);
  const [allDentists, setAllDentists] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState(null);
  const [locationStatus, setLocationStatus] = useState('Buscando sua localização...');
  const [addressSearchText, setAddressSearchText] = useState('');

  const [allSpecialties, setAllSpecialties] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState('Todas');

  const navigation = useNavigation();

  const loadAndProcessDentists = useCallback(async (location) => {
    if (!location) return;
    
    setIsLoading(true);
    setLocationStatus('Buscando dentistas próximos...');
    try {
      const { data: prestadores } = await listarPrestadores();

      const geocodedDentists = await Promise.all(
        prestadores.map(async (dentist) => {
          try {
            const { logradouro, numero, cidade, estado } = dentist.endereco;
            if (!logradouro || !cidade || !estado) return null;

            const addressString = `${logradouro}, ${numero || ''}, ${cidade}, ${estado}`;
            const geocoded = await Location.geocodeAsync(addressString);
            
            if (geocoded && geocoded.length > 0) {
              const dentistLocation = { latitude: geocoded[0].latitude, longitude: geocoded[0].longitude };
              const distance = haversineDistance(location, dentistLocation);
              return {
                ...dentist,
                id: dentist._id,
                lat: dentistLocation.latitude,
                lon: dentistLocation.longitude,
                distance,
                address: addressString,
              };
            }
          } catch (e) {
            console.warn(`Não foi possível geocodificar o endereço para ${dentist.nome}: ${e.message}`);
          }
          return null;
        })
      );

      const validDentists = geocodedDentists.filter(d => d !== null);
      validDentists.sort((a, b) => a.distance - b.distance);
      
      setAllDentists(validDentists);
      setLocationStatus(`Encontrados ${validDentists.length} dentistas.`);

      const specialties = new Set();
      validDentists.forEach(d => {
          d.perfil?.especialidades?.forEach(spec => specialties.add(spec));
      });
      setAllSpecialties(['Todas', ...Array.from(specialties).sort()]);

    } catch (error) {
      console.error("Erro ao buscar dentistas:", error);
      setLocationStatus('Erro ao carregar dentistas do servidor.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearchAddress = async () => {
      if (!addressSearchText.trim()) return;
      setIsLoading(true);
      setLocationStatus(`Buscando por "${addressSearchText}"...`);
      try {
          const result = await Location.geocodeAsync(addressSearchText);
          if (result && result.length > 0) {
              const newLocation = { latitude: result[0].latitude, longitude: result[0].longitude };
              setMapRegion({ ...newLocation, latitudeDelta: 0.0922, longitudeDelta: 0.0421 });
              await loadAndProcessDentists(newLocation);
          } else {
              setLocationStatus(`Endereço "${addressSearchText}" não encontrado.`);
              setIsLoading(false);
          }
      } catch (error) {
          console.error("Erro na geocodificação:", error);
          setLocationStatus('Erro ao buscar endereço. Verifique a digitação.');
          setIsLoading(false);
      }
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      let location;

      if (status !== 'granted') {
        setLocationStatus('Permissão de localização negada. Usando localização padrão.');
        location = { latitude: -23.55052, longitude: -46.633309 }; // Default to SP
      } else {
        try {
          let loc = await Location.getCurrentPositionAsync({});
          location = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
          setLocationStatus('Sua localização atual está sendo usada.');
        } catch (error) {
          console.error("Error getting current position:", error);
          setLocationStatus('Não foi possível obter a localização. Usando localização padrão.');
          location = { latitude: -23.55052, longitude: -46.633309 }; // Default to SP
        }
      }
      
      setUserLocation(location);
      setMapRegion({ ...location, latitudeDelta: 0.0922, longitudeDelta: 0.0421 });
      await loadAndProcessDentists(location);
    })();
  }, [loadAndProcessDentists]);

  const filteredDentists = useMemo(() => {
    if (selectedSpecialty === 'Todas') {
      return allDentists;
    }
    return allDentists.filter(dentist =>
      dentist.perfil?.especialidades?.includes(selectedSpecialty)
    );
  }, [selectedSpecialty, allDentists]);

  if (!mapRegion) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1C74B4" />
        <Text style={styles.loadingText}>{locationStatus}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Encontre um Dentista</Text>
      
      <View style={styles.addressSearchContainer}>
        <TextInput
          style={styles.addressInput}
          placeholder="Digite um endereço, CEP ou cidade"
          placeholderTextColor={isDarkMode ? '#999' : '#aaa'}
          value={addressSearchText}
          onChangeText={setAddressSearchText}
          onSubmitEditing={handleSearchAddress}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearchAddress}>
            <AntDesign name="search" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <Text style={styles.filterLabel}>Filtrar por especialidade</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedSpecialty}
          onValueChange={(itemValue) => setSelectedSpecialty(itemValue)}
          style={styles.picker}
          dropdownIconColor={isDarkMode ? '#fff' : '#000'}
        >
          {allSpecialties.map(spec => (
            <Picker.Item key={spec} label={spec} value={spec} color={isDarkMode ? '#fff' : '#000'} />
          ))}
        </Picker>
      </View>
      
      <Text style={styles.locationStatusText}>{locationStatus}</Text>

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={mapRegion} 
          showsUserLocation
          loadingEnabled
          customMapStyle={isDarkMode ? darkMapStyle : []}
        >
          {filteredDentists.map(dentist => (
            <Marker
              key={dentist.id}
              coordinate={{ latitude: dentist.lat, longitude: dentist.lon }}
              pinColor="#1C74B4"
              title={dentist.nome}
              description={dentist.perfil?.especialidades?.join(', ')}
              onPress={() => navigation.navigate('DetalhesProfissional', { user: dentist })}
            />
          ))}
        </MapView>
      </View>

      <Text style={styles.listTitle}>Dentistas Próximos ({filteredDentists.length})</Text>
      {isLoading && filteredDentists.length === 0 ? (
          <ActivityIndicator size="large" color="#1C74B4" />
      ) : (
        <FlatList
          data={filteredDentists}
          renderItem={({ item }) => <DentistListItem item={item} navigation={navigation} isDarkMode={isDarkMode} />}
          keyExtractor={item => item.id}
          ListEmptyComponent={() => (
            <Text style={styles.noResults}>Nenhum dentista encontrado com os filtros aplicados.</Text>
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const getDynamicStyles = (isDarkMode) => StyleSheet.create({
    container: {
      flex: 1,
      padding: 10,
      backgroundColor: isDarkMode ? '#121212' : '#f5f5f5',
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#121212' : '#f5f5f5',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: isDarkMode ? '#fff' : '#666',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 5,
      color: isDarkMode ? '#fff' : '#333',
      paddingTop: 30,
    },
    addressSearchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: isDarkMode ? '#1e1e1e' : '#fff',
        borderRadius: 8,
        borderColor: isDarkMode ? '#444' : '#ddd',
        borderWidth: 1,
        marginBottom: 10,
    },
    addressInput: {
        flex: 1,
        height: 50,
        paddingHorizontal: 15,
        fontSize: 16,
        color: isDarkMode ? '#fff' : '#000',
    },
    searchButton: {
        backgroundColor: '#1C74B4',
        padding: 15,
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: isDarkMode ? '#eee' : '#444',
        marginBottom: 8,
        marginLeft: 5,
    },
    pickerContainer: {
        backgroundColor: isDarkMode ? '#1e1e1e' : '#fff',
        borderRadius: 8,
        borderColor: isDarkMode ? '#444' : '#ddd',
        borderWidth: 1,
        marginBottom: 10,
        height: 50,
        justifyContent: 'center',
    },
    picker: {
        color: isDarkMode ? '#fff' : '#000',
    },
    locationStatusText: {
        fontSize: 12,
        color: isDarkMode ? '#aaa' : '#888',
        marginBottom: 10,
        textAlign: 'center',
    },
    mapContainer: {
        height: 200, // Adjusted height
        marginBottom: 10,
        borderRadius: 8,
        overflow: 'hidden',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    listTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 5,
        marginBottom: 10,
        color: isDarkMode ? '#fff' : '#333',
    },
    listItemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: isDarkMode ? '#1e1e1e' : '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isDarkMode ? 0.5 : 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    listItemInfo: {
        flex: 1,
    },
    listItemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1C74B4',
        marginBottom: 2,
    },
    listItemSpecialty: {
        fontSize: 13,
        color: isDarkMode ? '#aaa' : '#666',
        marginBottom: 5,
    },
    listItemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    listItemAddress: {
        fontSize: 13,
        color: isDarkMode ? '#aaa' : '#666',
        marginLeft: 5,
        flexShrink: 1,
    },
    listItemDistance: {
        fontSize: 14,
        color: '#1C74B4',
        fontWeight: 'bold',
        marginLeft: 5,
    },
    noResults: {
      textAlign: 'center',
      marginTop: 20,
      color: isDarkMode ? '#aaa' : '#888',
    },
});

export default SearchScreen;
