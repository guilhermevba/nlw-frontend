import { City } from "../entitities/city";

const baseUrl = "https://gentle-taiga-19543.herokuapp.com";

const api = {
  get: (url: string) =>
    fetch(`${baseUrl}/${url}`).then((result) => result.json()),
  getStates: () =>
    fetch(
      "http://servicodados.ibge.gov.br/api/v1/localidades/estados"
    ).then((result) => result.json()),
  getCitiesByStateId: (stateId: number) =>
    fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${stateId}/distritos`
    ).then((result) => result.json() as Promise<City[]>),
  post: (url: string, data: FormData) => {
    const config = {
      method: "POST",
      body: data,
    };
    console.log(config)
    return fetch(`${baseUrl}/${url}`, config).then((response) => response.json());
  },
};

export default api;
