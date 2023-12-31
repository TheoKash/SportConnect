import { Map, GoogleApiWrapper, Marker, InfoWindow } from 'google-maps-react';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Filters from "./Filters";
import { distance } from "../handles/distance";
import { mapStyle } from '../utils/mapStyle';

function EventsMap(props) {
	const mapRef = useRef(null);
	const autocompleteRef = useRef(null);
	const navigate = useNavigate();
	const [mapLocation, setMapLocation] = useState(null);
	const infoWindowRef = useRef(null);

	const [activeMarker, setActiveMarker] = useState(null);
  const [showInfoWindow, setShowInfoWindow] = useState(false);
	const [activeEvent, setActiveEvent] = useState(null);

  const handleMarkerClick = (props, marker, event) => {
    setActiveMarker(marker);
    setShowInfoWindow(true);
		setActiveEvent(event);
  };

  const handleInfoWindowClose = () => {
    setActiveMarker(null);
		setActiveEvent(null);
    setShowInfoWindow(false);
  };

	const allSports = new Set(props.allEvents.map(event => event[0].sport).filter(sport => sport != null));
	const [filters, setFilters] = useState({sports: new Set(), distance: 10.5, date: "", startTime: "", endTime: ""});

	const filterFunc = (event) => {
		return (
			(filters.sports.size === 0 || filters.sports.has(event[0].sport)) &&
			(filters.distance > 10 || mapLocation === null ||	
				filters.distance >= 
						distance(event[0].location, mapLocation)) &&
			// eslint-disable-next-line
			(filters.date === "" || filters.date == event[0].date) &&
			(filters.startTime === "" || filters.startTime < event[0].endTime) &&
			(filters.endTime === "" || filters.endTime > event[0].startTime)
		)
	}

	const filteredEvents = props.allEvents.filter(filterFunc);

	const handleScriptLoad = () => {
    const autocompleteInput = document.getElementById('autocomplete-input-eventsMap');
    autocompleteRef.current = new props.google.maps.places.Autocomplete(autocompleteInput);
    autocompleteRef.current.addListener('place_changed', handlePlaceSelect);
  };

	const handlePlaceSelect = () => {
    const place = autocompleteRef.current.getPlace();
    if (place.geometry && place.geometry.location && mapRef.current) {
      const location = place.geometry.location;
      const newCenter = { lat: location.lat(), lng: location.lng() };
			setMapLocation(newCenter);
      
			mapRef.current.panTo(newCenter);
			// sleep to wait for map to pan
			setTimeout(() => {mapRef.current.setZoom(14);} , 200);	
    }
  };

	const clearSelection = (e) => {
		if (e.target.value === "") {
			setMapLocation(null);
		}
	}

	const goToEvent = (id) => {
		navigate("/event", {state:{ entryId: id }})
	}

	return (
		<div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
			<div className='row justify-content-start align-items-start'>
				<div className='col-8'>
					<input
						id="autocomplete-input-eventsMap"
						type="text"
						placeholder="Search events near a location"
						style={{ width: '100%', height: '40px', fontSize: '16px', padding: '0 10px' }}
						onChange={clearSelection}
					/>
				</div>
				<div className='col-4'>
      		<Filters searchLocation={mapLocation} filters={filters} setFilters={setFilters} sports={allSports} />
				</div>
			</div>
			<br />
			<div className='row justify-content-center align-items-start'>
				<Map
					google={props.google}
					zoom={12}
					initialCenter={props.initialCenter}
					onReady={(mapProps, map) => {
						mapRef.current = map;
						handleScriptLoad();
					}}
					style={{ overflowX: "hidden", overflowY: "hidden" }}
					containerStyle={{ maxWidth: "80%", maxHeight: "80%" }}
					styles={mapStyle()}
					streetViewControl={false}
					fullscreenControl={false}
					mapTypeControl={false}
				>
					{filteredEvents.map(item => 
						<Marker
							key={item[1]}
							position={{ lat: item[0].location.latitude, lng: item[0].location.longitude }}
							onClick={(props, marker) => handleMarkerClick(props, marker, item)}
						/>
					)}
					<InfoWindow
						marker={activeMarker}
						visible={showInfoWindow}
						onClose={handleInfoWindowClose}
						maxWidth={200}
						ref={infoWindowRef}
						onOpen={() => {
							const goToEventBtn = document.getElementById('goToEventBtn');
							if (goToEventBtn) {
								goToEventBtn.addEventListener('click', () => {
									goToEvent(activeEvent[1]);
								});
							}
						}}
					>
						{activeEvent && (
							<div>
								<h5>{activeEvent[0].title}</h5>
								<p>{activeEvent[0].date}</p>
								<p>{activeEvent[0].startTime} - {activeEvent[0].endTime}</p>
								<button className="btn btn-warning" id="goToEventBtn">Go To Event Page</button>
							</div>
						)}
					</InfoWindow>
				</Map>
			<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
			<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
			</div>

		</div>
			
	);
}

export default GoogleApiWrapper({
  apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
})(EventsMap);
