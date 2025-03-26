import { PrinterLocation } from "@shared/types";
import { apiRequest } from "./queryClient";

export async function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    });
  });
}

export async function getNearbyPrinters(latitude: number, longitude: number, radius: number = 10): Promise<PrinterLocation[]> {
  try {
    const response = await apiRequest(
      'GET', 
      `/api/printers/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`
    );
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to get nearby printers');
    }
    
    return data.data;
  } catch (error) {
    console.error("Error getting nearby printers:", error);
    throw error;
  }
}

interface MapOptions {
  mapContainerId: string;
  center: { lat: number; lng: number };
  zoom?: number;
  onPrinterSelect?: (printer: PrinterLocation) => void;
}

export function initGoogleMap(options: MapOptions, printers: PrinterLocation[]): google.maps.Map | null {
  // Check if Google Maps API is loaded
  if (typeof google === 'undefined' || !google.maps) {
    console.error('Google Maps API not loaded');
    return null;
  }

  const mapElement = document.getElementById(options.mapContainerId);
  if (!mapElement) {
    console.error(`Map container with id ${options.mapContainerId} not found`);
    return null;
  }

  const map = new google.maps.Map(mapElement, {
    center: options.center,
    zoom: options.zoom || 14,
    styles: [
      {
        "featureType": "all",
        "elementType": "geometry.fill",
        "stylers": [{"weight": "2.00"}]
      },
      {
        "featureType": "all",
        "elementType": "geometry.stroke",
        "stylers": [{"color": "#9c9c9c"}]
      },
      {
        "featureType": "all",
        "elementType": "labels.text",
        "stylers": [{"visibility": "on"}]
      },
      {
        "featureType": "landscape",
        "elementType": "all",
        "stylers": [{"color": "#f2f2f2"}]
      },
      {
        "featureType": "landscape",
        "elementType": "geometry.fill",
        "stylers": [{"color": "#ffffff"}]
      },
      {
        "featureType": "poi",
        "elementType": "all",
        "stylers": [{"visibility": "off"}]
      },
      {
        "featureType": "road",
        "elementType": "all",
        "stylers": [{"saturation": -100}, {"lightness": 45}]
      },
      {
        "featureType": "road",
        "elementType": "geometry.fill",
        "stylers": [{"color": "#eeeeee"}]
      },
      {
        "featureType": "road",
        "elementType": "labels.text.fill",
        "stylers": [{"color": "#7b7b7b"}]
      },
      {
        "featureType": "road",
        "elementType": "labels.text.stroke",
        "stylers": [{"color": "#ffffff"}]
      },
      {
        "featureType": "road.highway",
        "elementType": "all",
        "stylers": [{"visibility": "simplified"}]
      }
    ]
  });

  // Add current location marker
  new google.maps.Marker({
    position: options.center,
    map: map,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 10,
      fillColor: "#4285F4",
      fillOpacity: 1,
      strokeColor: "#ffffff",
      strokeWeight: 2,
    },
    title: "Your Location"
  });

  // Add markers for printers
  printers.forEach((printer) => {
    const markerIcon = {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${printer.isOpen ? '#000000' : '#999999'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 6 2 18 2 18 9"></polyline>
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
          <rect x="6" y="14" width="12" height="8"></rect>
        </svg>
      `),
      scaledSize: new google.maps.Size(30, 30)
    };

    const marker = new google.maps.Marker({
      position: { lat: printer.latitude, lng: printer.longitude },
      map: map,
      icon: markerIcon,
      title: printer.name
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="padding: 8px;">
          <h3 style="margin: 0; font-size: 16px;">${printer.name}</h3>
          <p style="margin: 4px 0;">${printer.address}</p>
          <p style="margin: 4px 0;">${printer.distance.toFixed(1)} km away</p>
          <p style="margin: 4px 0; color: ${printer.isOpen ? 'green' : 'red'}">
            ${printer.isOpen ? 'Open' : 'Closed'}
          </p>
          ${options.onPrinterSelect ? `<button id="select-printer-${printer.id}" style="background: black; color: white; border: none; padding: 4px 8px; margin-top: 4px; cursor: pointer;">Select</button>` : ''}
        </div>
      `
    });

    marker.addListener('click', () => {
      infoWindow.open(map, marker);
      
      // Add click event for select button after info window is opened
      if (options.onPrinterSelect) {
        setTimeout(() => {
          const selectButton = document.getElementById(`select-printer-${printer.id}`);
          if (selectButton) {
            selectButton.addEventListener('click', () => {
              if (options.onPrinterSelect) {
                options.onPrinterSelect(printer);
              }
              infoWindow.close();
            });
          }
        }, 100);
      }
    });
  });

  return map;
}
