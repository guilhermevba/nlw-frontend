import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import "./styles.css";
import { Link, useHistory } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import Logo from "../../assets/logo.svg";
import { Map, TileLayer, Marker } from "react-leaflet";
import { LeafletMouseEvent } from "leaflet";
import api from "../../services/api";
import { Item } from "../../entitities/item";
import { State } from "../../entitities/state";
import { City } from "../../entitities/city";
import { PointFormData } from "../../entitities/pointFormData";

const handleSelectState = (
  setSelectedState: (selectedState: number) => void
) => (event: ChangeEvent<HTMLSelectElement>) => {
  setSelectedState(Number(event.target.value));
};

const handleSelectCity = (setSelectedCity: (selectedCity: number) => void) => (
  event: ChangeEvent<HTMLSelectElement>
) => {
  setSelectedCity(Number(event.target.value));
};

const handleInputChange = (
  formData: PointFormData,
  setFormData: (formData: PointFormData) => void
) => (event: ChangeEvent<HTMLInputElement>) => {
  setFormData({
    ...formData,
    [event.target.name]: event.target.value,
  });
};

const handleMapClick = (
  setSelectedPosition: (selectedPosition: [number, number]) => void
) => (event: LeafletMouseEvent) => {
  setSelectedPosition([event.latlng.lat, event.latlng.lng]);
};

const handleSelectItem = (
  itemId: Number,
  selectedItemsIds: Number[],
  setSelectedItemsIds: (selectedItemsIds: Number[]) => void
) => {
  if (selectedItemsIds.includes(itemId)) {
    setSelectedItemsIds(selectedItemsIds.filter((id) => id !== itemId));
  } else {
    setSelectedItemsIds([...selectedItemsIds, itemId]);
  }
};

const handleSubmit = (
  formData: PointFormData,
  selectedItemsIds: Number[],
  selectedPosition: [Number, Number],
  state: State | undefined,
  city: City | undefined
) => {
  const [latitude, longitude] = selectedPosition;
  const data = new FormData();
  data.append("name", formData.name);
  data.append("email", formData.email);
  data.append("whatsapp", formData.whatsapp);
  data.append("uf", state ? state.sigla : "");
  data.append("city", city ? city.nome : "");
  data.append("latitude", String(latitude));
  data.append("longitude", String(longitude));
  selectedItemsIds.forEach((item) => {
    data.append("items", String(item));
  });

  return api.post("points", data).then((response) => {
    if (response.message) {
      alert("Erro ao criar ponto de Coleta. Revisar cadastro.");
      return false;
    } else {
      alert("Ponto de coleta criado!");
      return true;
    }
  });
};

const CreatePoint = () => {
  const [success, setSuccess] = useState<boolean>();
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItemsIds, setSelectedItemsIds] = useState<Number[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedState, setSelectedState] = useState(0);
  const [selectedCity, setSelectedCity] = useState(0);
  const [formData, setFormData] = useState<PointFormData>({
    name: "",
    email: "",
    whatsapp: "",
  });
  const [initialPosition, setInitialPosition] = useState<[number, number]>([
    0,
    0,
  ]);
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([
    0,
    0,
  ]);

  const history = useHistory();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      setInitialPosition([latitude, longitude]);
      setSelectedPosition([latitude, longitude]);
    });
  }, []);

  useEffect(() => {
    api.get("items").then(setItems);
  }, []);

  useEffect(() => {
    api.getStates().then(setStates);
  }, []);

  useEffect(() => {
    api.getCitiesByStateId(selectedState).then((response) => {
      setCities(response);
    });
  }, [selectedState]);

  return (
    <div id="page-create-point">
      <header>
        <img src={Logo} alt="Ecoleta" />
        <Link to="/">
          <FiArrowLeft />
          Voltar para Home
        </Link>
      </header>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit(
            formData,
            selectedItemsIds,
            selectedPosition,
            states.find(({ id }) => selectedState === id),
            cities.find(({ id }) => selectedCity === id)
          ).then(success => {
            if (success) {
              history.push('/')
            }
          });
        }}
      >
        <h1>
          Cadastro do <br /> ponto de coleta
        </h1>
        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>
          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input
              type="text"
              name="name"
              id="name"
              onChange={handleInputChange(formData, setFormData)}
            />
          </div>
          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input
                type="email"
                name="email"
                id="email"
                onChange={handleInputChange(formData, setFormData)}
              />
            </div>
            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <input
                type="text"
                name="whatsapp"
                id="whatsapp"
                onChange={handleInputChange(formData, setFormData)}
              />
            </div>
          </div>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>
          <Map
            center={initialPosition}
            zoom={15}
            onClick={handleMapClick(setSelectedPosition)}
          >
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={selectedPosition} />
          </Map>
          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select
                name="uf"
                id="uf"
                value={selectedState}
                onChange={handleSelectState(setSelectedState)}
              >
                <option key="0" value="0">
                  Selecione uma UF
                </option>
                {states.map((state) => (
                  <option
                    key={state.id}
                    value={state.id}
                  >{`${state.nome} (${state.sigla})`}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select
                name="city"
                id="city"
                value={selectedCity}
                onChange={handleSelectCity(setSelectedCity)}
              >
                <option key={"0"} value="0">
                  Selecione uma Cidade
                </option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <legend>
            <h2>Ítems de coleta</h2>
            <span>Selecione um ou mais ítems abaixo</span>
          </legend>
          <ul className="items-grid">
            {items.map((item) => (
              <li
                className={selectedItemsIds.includes(item.id) ? "selected" : ""}
                key={item.id}
                onClick={() =>
                  handleSelectItem(
                    item.id,
                    selectedItemsIds,
                    setSelectedItemsIds
                  )
                }
              >
                <img src={item.image_url} alt={item.title} />
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
        </fieldset>
        <button type="submit">Cadastrar ponto de coleta</button>
      </form>
    </div>
  );
};

export default CreatePoint;
