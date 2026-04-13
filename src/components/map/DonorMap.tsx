"use client";

import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { useAllDonors, useHospitals } from "@/hooks/useSupabaseData";
import { mockDonors, mockHospitals } from "@/data/mock";
import { CITIES } from "@/lib/constants";
import { createClient } from "@/lib/supabase";
import { toast } from "sonner";

const hospitalIcon = new L.DivIcon({
  html: `<div style="background:#3b82f6;width:28px;height:28px;border-radius:50%;border:3px solid white;box-shadow:0 0 10px #3b82f6, 0 0 20px #3b82f6;display:flex;align-items:center;justify-content:center;color:white;font-size:14px;font-weight:bold;">H</div>`,
  className: "",
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14],
});

const donorAvailableIcon = new L.DivIcon({
  html: `<div style="background:#ef4444;width:20px;height:20px;border-radius:50%;border:2px solid white;box-shadow:0 0 10px #ef4444, 0 0 15px #ef4444;"></div>`,
  className: "",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
});

const donorUnavailableIcon = new L.DivIcon({
  html: `<div style="background:#64748b;width:16px;height:16px;border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.15);opacity:0.6;"></div>`,
  className: "",
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  popupAnchor: [0, -8],
});

const userIcon = new L.DivIcon({
  html: `<div style="background:#0f172a;width:32px;height:32px;border-radius:50%;border:3px solid white;box-shadow:0 0 15px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;color:white;"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-navigation"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg></div>`,
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  const d = R * c; 
  return d.toFixed(1);
}

function getCityCoords(cityName: string): [number, number] {
  const city = CITIES.find(c => c.name.toLowerCase() === cityName?.toLowerCase());
  if (city) return [city.lat, city.lng];
  return [24.8607, 67.0011]; // Default to Karachi
}

function MapUpdater({ center }: { center: [number, number] | null }) {
  const map = useMap();
  if (center) {
    map.flyTo(center, 13, { duration: 1.5 });
  }
  return null;
}

export default function DonorMap() {
  const { data: liveDonors, isLoading: donorsLoading, error: donorsError } = useAllDonors();
  const { data: liveHospitals, isLoading: hospitalsLoading, error: hospitalsError } = useHospitals();
  
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const handleLocateMe = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setIsLocating(false);
          alert("Location found successfully!");
        },
        (error) => {
          // Silent error handling for location failure

          setUserLocation([31.5204, 74.3587]); // Default to Lahore
          alert("Location access denied or failed. Defaulting to Lahore.");
          setIsLocating(false);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
      setIsLocating(false);
    }
  };

  const handleSaveLocation = async () => {
    if (!userLocation) return;
    
    setIsLocating(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please login to save your location.", {
           description: "Unauthenticated updates are blocked for security."
        });
        return;
      }

      const userId = session.user.id;
      const role = session.user.user_metadata?.role;

      if (role === 'hospital') {
        const { error } = await supabase
          .from('hospitals')
          .update({ 
            latitude: userLocation[0], 
            longitude: userLocation[1] 
          })
          .eq('user_id', userId);
        if (error) throw error;
      } else {
        // Update both if they exist, or just one
        await Promise.all([
          supabase.from('blood_donors').update({ latitude: userLocation[0], longitude: userLocation[1] }).eq('user_id', userId),
          supabase.from('organ_donors').update({ latitude: userLocation[0], longitude: userLocation[1] }).eq('user_id', userId)
        ]);
      }

      toast.success("Coordinates Synchronized", {
        description: `Position [${userLocation[0].toFixed(4)}, ${userLocation[1].toFixed(4)}] committed to secure node.`
      });
    } catch (e: any) {
      toast.error("Neural Link Failed", { description: e.message });
    } finally {
      setIsLocating(false);
    }
  };

  const donorMarkers = donorsError
    ? mockDonors.map(d => ({
        id: d.id,
        name: d.full_name,
        blood_type: d.blood_type,
        donating: d.donating_items || '',
        city: d.city,
        is_available: d.is_available,
        lat: d.latitude || 30.3753,
        lng: d.longitude || 69.3451,
      }))
    : (liveDonors || []).map((d) => ({
        id: d.id,
        name: d.full_name,
        blood_type: d.blood_type,
        donating: d.donating_items,
        city: d.city,
        is_available: d.is_available,
        lat: d.latitude || 30.3753, // fallback to PK center if geocoding failed
        lng: d.longitude || 69.3451,
      }));

  const hospitalMarkers = hospitalsError
    ? mockHospitals.map(h => ({
        id: h.hospital_id, 
        name: h.hospital_name, 
        city: h.city, 
        lat: h.latitude || 30.3753, 
        lng: h.longitude || 69.3451,
      }))
    : (liveHospitals || []).map((h) => ({ 
        id: h.id, 
        name: h.hospital_name, 
        city: h.city, 
        lat: h.latitude || 30.3753, 
        lng: h.longitude || 69.3451 
      }));

  if (donorsLoading || hospitalsLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] rounded-xl border border-border bg-card/50 backdrop-blur-sm">
        <div className="relative">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          </div>
        </div>
        <p className="mt-4 text-sm font-medium text-muted-foreground animate-pulse">Syncing live geospatial data...</p>
      </div>
    );
  }

  if (donorsError && hospitalsError) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] rounded-xl border border-destructive/20 bg-destructive/5 text-center p-6">
        <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <h3 className="text-lg font-bold text-foreground">Connection Outage</h3>
        <p className="text-sm text-muted-foreground max-w-xs mt-2">
          We're having trouble connecting to the geospatial engine. Please check your internet or retry later.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const defaultCenter: [number, number] = [30.3753, 69.3451];

  return (
    <div className="relative rounded-xl overflow-hidden shadow-lg border border-border group bg-card">
      <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
        <button 
          onClick={handleLocateMe}
          disabled={isLocating}
          className="bg-card text-card-foreground border border-border px-4 py-2 rounded-md shadow-lg font-medium text-sm hover:bg-muted disabled:opacity-50 flex items-center justify-center transition-colors"
        >
          {isLocating ? "Locating..." : "Locate Me"}
        </button>
        {userLocation && (
          <button 
            onClick={handleSaveLocation}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md shadow-lg font-medium text-sm hover:opacity-90 flex items-center justify-center transition-opacity"
          >
            Save Location
          </button>
        )}
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={6}
        style={{ height: "600px", width: "100%" }}
        className="z-0"
      >
        <MapUpdater center={userLocation} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>
              <div className="text-sm font-bold text-center">You Are Here</div>
            </Popup>
          </Marker>
        )}

        {hospitalMarkers.map((h) => {
          const dist = userLocation ? calculateDistance(userLocation[0], userLocation[1], h.lat, h.lng) : null;
          return (
            <Marker key={h.id} position={[h.lat, h.lng]} icon={hospitalIcon}>
              <Popup>
                <div className="text-sm space-y-1">
                  <p className="font-bold">{h.name}</p>
                  <p className="text-gray-500">{h.city}</p>
                  {dist && <p className="text-xs text-blue-600 font-semibold mt-1">Distance: {dist} km</p>}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {donorMarkers.map((d) => {
          const dist = userLocation ? calculateDistance(userLocation[0], userLocation[1], d.lat, d.lng) : null;
          return (
            <Marker
              key={d.id}
              position={[d.lat, d.lng]}
              icon={d.is_available ? donorAvailableIcon : donorUnavailableIcon}
            >
              <Popup>
                <div className="text-sm space-y-1">
                  <p className="font-bold">{d.name}</p>
                  <p>
                    <span className="font-semibold text-red-600">{d.blood_type}</span>
                    {d.donating && d.donating !== '—' && <span className="ml-1"> · {d.donating}</span>}
                  </p>
                  <p className="text-xs text-gray-500">{d.city}</p>
                  <p className={`text-xs font-medium ${d.is_available ? "text-green-600" : "text-gray-400"}`}>
                    {d.is_available ? "● Available" : "● Unavailable"}
                  </p>
                  {dist && <p className="text-xs text-blue-600 font-semibold mt-1">Distance: {dist} km</p>}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
