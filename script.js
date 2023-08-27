// declare variables
const categoriesContainer = document.querySelector("#categoriesContainer");
const productsContainer = document.querySelector("#productsContainer");

const sortElement = document.querySelector("#sort");
const searchElement = document.querySelector("#search");

const PROJECT_ID = "f5uukjzq";

const API_URL = `https://${PROJECT_ID}.api.sanity.io/v2023-08-20/data/query/production`;

const IMAGES_URL = `https://cdn.sanity.io/images/${PROJECT_ID}/production`;

let categories = [];
let selectedCategory = null;
let products = [];

window.onload = () => {
  getCategories();
  getProducts();
};

// ----------------------------------------------------------
//  get data and render to DOM
async function getCategories() {
  // get categories from API (sanity)
  const response = await fetch(`${API_URL}?query=*[_type == "category"]`);
  const data = await response.json();

  // format categories
  categories = data.result.map((category) => ({
    id: category._id,
    title: category.title,
  }));

  // loop and render each category
  categories.forEach((category) => {
    const categoryElement = document.createElement("button");

    // add styles and content
    categoryElement.classList.add("shadow", "py-1", "px-2", "rounded");
    categoryElement.innerText = category.title;

    //   set the id (needed to filter the products later)
    categoryElement.setAttribute("id", category.id);

    categoryElement.addEventListener("click", () =>
      categoryBtnListener(category.id)
    );

    // append to the container
    categoriesContainer.appendChild(categoryElement);
  });
}

async function getProducts() {
  const response = await fetch(`${API_URL}?query=*[_type == "product"]`);
  const data = await response.json();

  products = data.result.map((product) => ({
    id: product._id,
    title: product.title,
    price: product.price,
    description: product.description,
    imageRef: product.mainImage.asset._ref
      .replace("image-", "")
      .replace(/-(?=png|jpg|jpeg|gif)/, "."),
    categoryId: product.category._ref,
  }));

  renderProducts(products);
}

function renderProducts(products) {
  productsContainer.innerHTML = "";

  products.forEach((product) => {
    const productElement = document.createElement("div");
    productElement.classList.add(
      "flex",
      "space-x-2",
      "pr-2",
      "shadow-md",
      "rounded-xl",
      "overflow-hidden"
    );

    productElement.innerHTML = `
      <img
        src=${IMAGES_URL}/${product.imageRef}
        alt=${product.title}
        class="w-28 h-28 object-cover"
            />
            <div>
              <h3 class="font-semibold text-lg capitalize">${product.title}</h3>
              <p class="text-sm text-gray-400">
                ${product.description}
              </p>
              <p class="mt-3 text-brand font-bold">${product.price.toFixed(
                2
              )}$</p>
            </div>
      `;

    productsContainer.appendChild(productElement);
  });
}

function searchAndFilterProducts() {
  // filter by selected category if selected
  const filteredProducts = products.filter((product) =>
    selectedCategory ? product.categoryId === selectedCategory : true
  );

  // sort
  const sortValue = sortElement.value;
  const sortedProducts = filteredProducts.sort((a, b) => {
    if (sortValue === "cheap") {
      return a.price - b.price;
    } else if (sortValue === "expensive") {
      return b.price - a.price;
    } else return 0;
  });

  // search
  const searchValue = searchElement.value;
  const searchedProducts = sortedProducts.filter((product) =>
    product.title.toLowerCase().includes(searchValue.toLowerCase())
  );

  renderProducts(searchedProducts);
}

// ----------------------------------------------------------
// Event Listeners
searchElement.addEventListener("input", searchAndFilterProducts);
sortElement.addEventListener("change", searchAndFilterProducts);

// each category btn listener
function categoryBtnListener(id) {
  // toggle the selected category id
  if (selectedCategory === id) {
    selectedCategory = null;
  } else selectedCategory = id;

  // turn off/on the selected category
  categoriesContainer.querySelectorAll("button").forEach((button) => {
    if (button.id === selectedCategory) {
      button.classList.add("bg-brand", "text-white");
    } else {
      button.classList.remove("bg-brand", "text-white");
    }
  });

  searchAndFilterProducts();
}
