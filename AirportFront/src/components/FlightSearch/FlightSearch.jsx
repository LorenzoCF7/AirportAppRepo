import { useState, useEffect, useRef } from 'react';
import { Search, Plane, MapPin, X } from 'lucide-react';
import styles from './FlightSearch.module.css';

const FlightSearch = ({ onSearch, onClear, onSuggestionsRequest }) => {
  const [searchType, setSearchType] = useState('flight');
  const [searchValue, setSearchValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Solicitar sugerencias cuando cambia el valor de búsqueda
  useEffect(() => {
    if (searchValue.trim().length >= 2 && onSuggestionsRequest) {
      onSuggestionsRequest(searchType, searchValue.trim()).then(results => {
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      });
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    setSelectedIndex(-1);
  }, [searchValue, searchType, onSuggestionsRequest]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      onSearch(searchType, searchValue.trim().toUpperCase());
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    // Siempre buscar por número de vuelo cuando se selecciona una sugerencia
    const searchTerm = suggestion.flight?.iata || suggestion.flightNumber || suggestion.code;
    console.log('🔍 Vuelo seleccionado:', searchTerm, suggestion);
    
    setSearchValue(searchTerm);
    setSearchType('flight'); // Cambiar a búsqueda por vuelo
    setShowSuggestions(false);
    onSearch('flight', searchTerm); // Buscar por vuelo específico
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else if (searchValue.trim()) {
          handleSubmit(e);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  const handleClear = () => {
    setSearchValue('');
    setSuggestions([]);
    setShowSuggestions(false);
    onClear();
  };

  return (
    <div className={styles.flightSearch} ref={searchRef}>
      <div className={styles.searchHeader}>
        <h2>Buscar Vuelos</h2>
        <p>Encuentra información en tiempo real de cualquier vuelo</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.searchForm}>
        <div className={styles.searchTypeSelector}>
          <button
            type="button"
            className={`${styles.typeButton} ${searchType === 'flight' ? styles.active : ''}`}
            onClick={() => setSearchType('flight')}
          >
            <Plane size={18} />
            <span>Número de Vuelo</span>
          </button>
          <button
            type="button"
            className={`${styles.typeButton} ${searchType === 'airport' ? styles.active : ''}`}
            onClick={() => setSearchType('airport')}
          >
            <MapPin size={18} />
            <span>Aeropuerto</span>
          </button>
        </div>

        <div className={styles.searchInputWrapper}>
          <Search className={styles.searchIcon} size={20} />
          <input
            type="text"
            placeholder={
              searchType === 'flight' 
                ? 'Ej: IB, IB1001, VY2020' 
                : 'Código IATA (Ej: MAD, BCN, LHR)'
            }
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value.toUpperCase())}
            onKeyDown={handleKeyDown}
            className={styles.searchInput}
            autoComplete="off"
          />
          {searchValue && (
            <button type="button" onClick={handleClear} className={styles.clearButton}>
              <X size={18} />
            </button>
          )}
          
          {/* Sugerencias de autocompletado */}
          {showSuggestions && suggestions.length > 0 && (
            <div className={styles.suggestionsDropdown}>
              {suggestions.map((suggestion, index) => {
                console.log(`Sugerencia ${index}:`, suggestion.flight?.iata, suggestion);
                return (
                  <div
                    key={`suggestion-${index}-${suggestion.flight?.iata || suggestion.id}`}
                    className={`${styles.suggestionItem} ${index === selectedIndex ? styles.selected : ''}`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log(`Click en sugerencia ${index}:`, suggestion.flight?.iata);
                      handleSuggestionClick(suggestion);
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                  <div className={styles.suggestionMain}>
                    <Plane size={16} className={styles.suggestionIcon} />
                    <div className={styles.suggestionDetails}>
                      <span className={styles.suggestionFlight}>
                        {suggestion.flightNumber || suggestion.flight?.iata || suggestion.code}
                      </span>
                      {suggestion.airline && (
                        <span className={styles.suggestionAirline}>
                          {typeof suggestion.airline === 'string' 
                            ? suggestion.airline 
                            : suggestion.airline?.name || suggestion.airline?.iata || ''}
                        </span>
                      )}
                    </div>
                  </div>
                  {(suggestion.origin || suggestion.departure?.iata) && 
                   (suggestion.destination || suggestion.arrival?.iata) && (
                    <div className={styles.suggestionRoute}>
                      {suggestion.origin || suggestion.departure?.iata} → {suggestion.destination || suggestion.arrival?.iata}
                    </div>
                  )}
                  {suggestion.flight_status_label && (
                    <span className={`${styles.suggestionStatus} ${styles[`status${suggestion.flight_status.charAt(0).toUpperCase() + suggestion.flight_status.slice(1)}`]}`}>
                      {suggestion.flight_status_label}
                    </span>
                  )}
                </div>
                );
              })}
            </div>
          )}
        </div>

        <div className={styles.searchActions}>
          <button type="submit" className={styles.searchButton}>
            <Search size={18} />
            <span>Buscar</span>
          </button>
        </div>
      </form>

      <div className={styles.searchExamples}>
        <span className={styles.examplesLabel}>Ejemplos:</span>
        <button 
          type="button" 
          className={styles.exampleButton}
          onClick={() => {
            setSearchType('flight');
            setSearchValue('IB');
          }}
        >
          IB
        </button>
        <button 
          type="button"
          className={styles.exampleButton}
          onClick={() => {
            setSearchType('flight');
            setSearchValue('FR');
          }}
        >
          FR
        </button>
        <button 
          type="button"
          className={styles.exampleButton}
          onClick={() => {
            setSearchType('airport');
            setSearchValue('MAD');
          }}
        >
          MAD
        </button>
      </div>
    </div>
  );
};

export default FlightSearch;
