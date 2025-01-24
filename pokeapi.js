const apiUrl = "https://pokeapi.co/api/v2/pokemon"; // URL de la PokeAPI
const limit = 20; // Número de Pokémon por página
let currentPage = 1; // Página actual
let totalPages = 0; // Total de páginas

// Referencias a elementos del DOM
const itemContainer = document.getElementById("item-container");
const selectedCardContainer = document.getElementById("selected-card-container");
const clearSelectionButton = document.getElementById("clear-selection");
const prevPageButton = document.getElementById("prev-page");
const nextPageButton = document.getElementById("next-page");
const pageInfo = document.getElementById("page-info");

// Función para obtener los Pokémon desde la API
async function fetchPokemon(page) {
  try {
    const offset = (page - 1) * limit; // Cálculo de offset
    const response = await fetch(`${apiUrl}?limit=${limit}&offset=${offset}`);
    const data = await response.json();
    totalPages = Math.ceil(data.count / limit); // Calcular el total de páginas

    const detailedPokemon = await Promise.all(
      data.results.map(async (pokemon) => {
        const res = await fetch(pokemon.url);
        return await res.json();
      })
    );

    renderItems(detailedPokemon); // Mostrar los Pokémon
    updatePagination(page); // Actualizar la paginación
  } catch (error) {
    console.error("Error al obtener los datos de la API:", error);
  }
}

// Renderiza los Pokémon obtenidos
function renderItems(items) {
  itemContainer.innerHTML = ""; // Limpiar contenedor
  items.forEach((item) => {
    const itemDiv = document.createElement("div");
    itemDiv.classList.add("item");

    itemDiv.innerHTML = `
      <img src="${item.sprites.front_default}" alt="${item.name}" />
      <h3>${item.name}</h3>
      <p>Altura: ${item.height}</p>
    `;

    itemDiv.addEventListener("click", () => {
      addSelectedCard(item);
    });

    itemContainer.appendChild(itemDiv);
  });
}

// Añadir un Pokémon a la lista seleccionada
function addSelectedCard(item) {
  const selectedCards = JSON.parse(localStorage.getItem("selectedCards")) || [];

  if (!selectedCards.some((card) => card.id === item.id)) {
    selectedCards.push({
      id: item.id,
      name: item.name,
      image: item.sprites.front_default,
      height: item.height,
    });

    localStorage.setItem("selectedCards", JSON.stringify(selectedCards));
    renderSelectedCards();
  }
}

// Renderiza los Pokémon seleccionados
function renderSelectedCards() {
  const selectedCards = JSON.parse(localStorage.getItem("selectedCards")) || [];
  selectedCardContainer.innerHTML = "";

  selectedCards.forEach((card) => {
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("card");

    cardDiv.innerHTML = `
      <img src="${card.image}" alt="${card.name}" />
      <h3>${card.name}</h3>
      <p>Altura: ${card.height}</p>
    `;

    selectedCardContainer.appendChild(cardDiv);
  });
}

// Limpiar las tarjetas seleccionadas
function clearSelectedCards() {
  localStorage.removeItem("selectedCards");
  selectedCardContainer.innerHTML = "";
}

// Actualizar los botones de paginación y la página actual
function updatePagination(page) {
  pageInfo.textContent = `Página ${page} de ${totalPages}`;
  prevPageButton.disabled = page === 1;
  nextPageButton.disabled = page === totalPages;
}

// Inicializar la aplicación
function init() {
  renderSelectedCards();
  fetchPokemon(currentPage); // Cargar los Pokémon de la primera página

  // Manejar evento de "Anterior"
  prevPageButton.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      fetchPokemon(currentPage);
    }
  });

  // Manejar evento de "Siguiente"
  nextPageButton.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      fetchPokemon(currentPage);
    }
  });

  // Evento para limpiar la selección
  clearSelectionButton.addEventListener("click", clearSelectedCards);
}

// Ejecutar la inicialización
init();
