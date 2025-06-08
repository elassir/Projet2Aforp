import React, { useState, useEffect } from "react";
import { View, ScrollView, TouchableOpacity, Alert } from "react-native";
import { MainStackParamList } from "../../types/navigation";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Layout,
  Text,
  TopNav,
  Section,
  SectionContent,
  useTheme,
  themeColor,
  Button,
  TextInput,
} from "react-native-rapi-ui";
import { Ionicons } from "@expo/vector-icons";
import { TerrainService } from "../../services/api/terrainService";
import { EquipmentService } from "../../services/api/equipmentService";
import { ReservationService } from "../../services/api/reservationService";
import { Terrain, Equipment, TimeSlot } from "../../types/entities";

export default function CreateReservationScreen({
  navigation,
}: NativeStackScreenProps<MainStackParamList, "CreateReservation">) {
  const { isDarkmode } = useTheme();
  const [step, setStep] = useState(1); // 1: terrain, 2: date/heure, 3: équipements, 4: confirmation
  const [terrains, setTerrains] = useState<Terrain[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [selectedTerrain, setSelectedTerrain] = useState<Terrain | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<{[key: string]: number}>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTerrains();
    loadEquipment();
  }, []);

  const loadTerrains = async () => {
    try {
      const data = await TerrainService.getAllTerrains();
      setTerrains(data);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les terrains');
    }
  };

  const loadEquipment = async () => {
    try {
      const data = await EquipmentService.getAvailableEquipment();
      setEquipment(data);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les équipements');
    }
  };

  const checkAvailability = async () => {
    if (!selectedTerrain || !selectedDate) return;
    
    try {
      setLoading(true);
      const availability = await TerrainService.getTerrainAvailability(
        selectedTerrain.id, 
        selectedDate
      );
      setAvailableSlots(availability.slots);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de vérifier la disponibilité');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    let total = 0;
    
    // Prix du terrain
    if (selectedTerrain && selectedSlot) {
      const startHour = parseInt(selectedSlot.start_time.split(':')[0]);
      const endHour = parseInt(selectedSlot.end_time.split(':')[0]);
      const duration = endHour - startHour;
      total += selectedTerrain.hourly_rate * duration;
    }
    
    // Prix des équipements
    Object.entries(selectedEquipment).forEach(([equipmentId, quantity]) => {
      const eq = equipment.find(e => e.id === equipmentId);
      if (eq && quantity > 0) {
        total += eq.rental_price * quantity;
      }
    });
    
    return total;
  };

  const createReservation = async () => {
    if (!selectedTerrain || !selectedDate || !selectedSlot) {
      Alert.alert('Erreur', 'Veuillez sélectionner un terrain, une date et un créneau');
      return;
    }

    try {
      setLoading(true);
      
      const equipmentIds = Object.entries(selectedEquipment)
        .filter(([_, quantity]) => quantity > 0)
        .map(([equipmentId, quantity]) => ({ equipment_id: equipmentId, quantity }));

      await TerrainService.createReservation({
        terrain_id: selectedTerrain.id,
        date: selectedDate,
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
        equipment_ids: equipmentIds
      });

      Alert.alert(
        'Succès', 
        'Réservation créée avec succès !',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de créer la réservation');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <ScrollView>
      <Section style={{ marginTop: 20 }}>        <SectionContent>
          <Text size="lg" fontWeight="bold" style={{ marginBottom: 15 }}>
            Choisir un terrain
          </Text>
          
          {terrains.map((terrain) => (
            <TouchableOpacity
              key={terrain.id}
              style={{
                backgroundColor: selectedTerrain?.id === terrain.id 
                  ? themeColor.primary + '20' 
                  : (isDarkmode ? themeColor.dark200 : themeColor.white),
                borderRadius: 12,
                padding: 15,
                marginBottom: 10,
                borderWidth: selectedTerrain?.id === terrain.id ? 2 : 0,
                borderColor: selectedTerrain?.id === terrain.id ? themeColor.primary : 'transparent'
              }}
              onPress={() => setSelectedTerrain(terrain)}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>                <View style={{ flex: 1 }}>
                  <Text size="md" fontWeight="bold">{terrain.name}</Text>
                  <Text style={{ opacity: 0.7, marginTop: 2 }}>
                    {terrain.type} • {terrain.capacity} personnes
                  </Text>
                  <Text style={{ color: themeColor.primary, fontWeight: 'bold', marginTop: 5 }}>
                    {terrain.hourly_rate}€/heure
                  </Text>
                </View>
                {selectedTerrain?.id === terrain.id && (
                  <Ionicons name="checkmark-circle" size={24} color={themeColor.primary} />
                )}
              </View>
            </TouchableOpacity>
          ))}
          
          <Button
            text="Suivant"
            disabled={!selectedTerrain}
            onPress={() => setStep(2)}
            style={{ marginTop: 20 }}
          />
        </SectionContent>
      </Section>
    </ScrollView>
  );

  const renderStep2 = () => (
    <ScrollView>
      <Section style={{ marginTop: 20 }}>        <SectionContent>
          <Text size="lg" fontWeight="bold" style={{ marginBottom: 15 }}>
            Choisir la date et l'heure
          </Text>
          
          <Text style={{ marginBottom: 10 }}>Date :</Text>
          <TextInput
            placeholder="YYYY-MM-DD"
            value={selectedDate}
            onChangeText={setSelectedDate}
            onBlur={checkAvailability}
          />
          
          {availableSlots.length > 0 && (
            <View style={{ marginTop: 20 }}>
              <Text style={{ marginBottom: 10, fontWeight: 'bold' }}>
                Créneaux disponibles :
              </Text>
              
              {availableSlots.map((slot, index) => (
                <TouchableOpacity
                  key={index}
                  disabled={!slot.is_available}
                  style={{
                    backgroundColor: !slot.is_available 
                      ? '#E0E0E0'
                      : selectedSlot === slot 
                        ? themeColor.primary + '20'
                        : (isDarkmode ? themeColor.dark200 : themeColor.white),
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 8,
                    borderWidth: selectedSlot === slot ? 2 : 0,
                    borderColor: selectedSlot === slot ? themeColor.primary : 'transparent'
                  }}
                  onPress={() => slot.is_available && setSelectedSlot(slot)}
                >
                  <Text style={{
                    textAlign: 'center',
                    color: !slot.is_available ? '#666' : undefined,
                    fontWeight: selectedSlot === slot ? 'bold' : 'normal'
                  }}>
                    {slot.start_time} - {slot.end_time}
                    {!slot.is_available && ' (Occupé)'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
            <Button
              text="Retour"
              status="info"
              onPress={() => setStep(1)}
              style={{ flex: 0.45 }}
            />
            <Button
              text="Suivant"
              disabled={!selectedSlot}
              onPress={() => setStep(3)}
              style={{ flex: 0.45 }}
            />
          </View>
        </SectionContent>
      </Section>
    </ScrollView>
  );

  const renderStep3 = () => (
    <ScrollView>
      <Section style={{ marginTop: 20 }}>        <SectionContent>
          <Text size="lg" fontWeight="bold" style={{ marginBottom: 15 }}>
            Équipements (optionnel)
          </Text>
          
          {equipment.map((eq) => (
            <View key={eq.id} style={{
              backgroundColor: isDarkmode ? themeColor.dark200 : themeColor.white,
              borderRadius: 12,
              padding: 15,
              marginBottom: 10,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <View style={{ flex: 1 }}>
                <Text fontWeight="bold">{eq.name}</Text>
                <Text style={{ opacity: 0.7 }}>{eq.type}</Text>
                <Text style={{ color: themeColor.primary, fontWeight: 'bold' }}>
                  {eq.rental_price}€/jour
                </Text>
              </View>
              
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                  onPress={() => setSelectedEquipment(prev => ({
                    ...prev,
                    [eq.id]: Math.max(0, (prev[eq.id] || 0) - 1)
                  }))}
                  style={{ padding: 8 }}
                >
                  <Ionicons name="remove-circle" size={24} color={themeColor.primary} />
                </TouchableOpacity>
                
                <Text style={{ marginHorizontal: 15, fontSize: 16, fontWeight: 'bold' }}>
                  {selectedEquipment[eq.id] || 0}
                </Text>
                
                <TouchableOpacity
                  onPress={() => setSelectedEquipment(prev => ({
                    ...prev,
                    [eq.id]: Math.min(eq.quantity, (prev[eq.id] || 0) + 1)
                  }))}
                  style={{ padding: 8 }}
                >
                  <Ionicons name="add-circle" size={24} color={themeColor.primary} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
            <Button
              text="Retour"
              status="info"
              onPress={() => setStep(2)}
              style={{ flex: 0.45 }}
            />
            <Button
              text="Suivant"
              onPress={() => setStep(4)}
              style={{ flex: 0.45 }}
            />
          </View>
        </SectionContent>
      </Section>
    </ScrollView>
  );

  const renderStep4 = () => (
    <ScrollView>
      <Section style={{ marginTop: 20 }}>        <SectionContent>
          <Text size="lg" fontWeight="bold" style={{ marginBottom: 15 }}>
            Confirmation
          </Text>
          
          <View style={{
            backgroundColor: isDarkmode ? themeColor.dark200 : themeColor.white100,
            borderRadius: 12,
            padding: 15,
            marginBottom: 20
          }}>
            <Text fontWeight="bold" style={{ marginBottom: 10 }}>
              Résumé de votre réservation :
            </Text>
            
            <Text>Terrain : {selectedTerrain?.name}</Text>
            <Text>Date : {selectedDate}</Text>
            <Text>Heure : {selectedSlot?.start_time} - {selectedSlot?.end_time}</Text>
            
            {Object.entries(selectedEquipment).filter(([_, qty]) => qty > 0).length > 0 && (
              <View style={{ marginTop: 10 }}>
                <Text fontWeight="bold">Équipements :</Text>
                {Object.entries(selectedEquipment)
                  .filter(([_, quantity]) => quantity > 0)
                  .map(([equipmentId, quantity]) => {
                    const eq = equipment.find(e => e.id === equipmentId);
                    return (
                      <Text key={equipmentId}>
                        • {eq?.name} x{quantity}
                      </Text>
                    );
                  })}
              </View>
            )}
            
            <Text style={{ 
              marginTop: 15, 
              fontSize: 18, 
              fontWeight: 'bold', 
              color: themeColor.primary 
            }}>
              Total : {calculateTotal()}€
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Button
              text="Retour"
              status="info"
              onPress={() => setStep(3)}
              style={{ flex: 0.45 }}
            />
            <Button
              text="Confirmer"
              onPress={createReservation}
              disabled={loading}
              style={{ flex: 0.45 }}
            />
          </View>
        </SectionContent>
      </Section>
    </ScrollView>
  );

  return (
    <Layout>
      <TopNav
        middleContent={`Réservation (${step}/4)`}
        leftContent={
          <Ionicons
            name="chevron-back"
            size={20}
            color={isDarkmode ? themeColor.white100 : themeColor.dark}
          />
        }
        leftAction={() => navigation.goBack()}
      />
      
      {/* Indicateur de progression */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: isDarkmode ? themeColor.dark200 : themeColor.white100
      }}>
        {[1, 2, 3, 4].map((stepNumber) => (
          <View
            key={stepNumber}
            style={{
              width: 30,
              height: 30,
              borderRadius: 15,
              backgroundColor: step >= stepNumber ? themeColor.primary : '#E0E0E0',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Text style={{ 
              color: step >= stepNumber ? 'white' : '#666',
              fontWeight: 'bold'
            }}>
              {stepNumber}
            </Text>
          </View>
        ))}
      </View>
      
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
    </Layout>
  );
}
