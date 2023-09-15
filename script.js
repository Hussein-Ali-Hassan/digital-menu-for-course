// search products (by name)
// sort products (cheap & expensive)
// filter products (by category)

// show categories (get from API then render to DOM)
// show products (get from API then render to DOM)
// ----------------------------------------------------------

// declare variables
const categoriesContainer = document.querySelector("#categoriesContainer");
const productsContainer = document.querySelector("#productsContainer");

const searchElement = document.querySelector("#search");
const sortElement = document.querySelector("#sort");

const PROJECT_ID = "f5uukjzq";
const API_URL = `https://${PROJECT_ID}.api.sanity.io/v2023-08-20/data/query/production`;
const IMAGES_URL = `https://cdn.sanity.io/images/${PROJECT_ID}/production`;

let categories = [];
let products = [];
let selectedCategoryId = null;

window.onload = () => {
  getProducts();
  getCategories();
};

async function getProducts() {
  // 1- get products from API
  const response = await fetch(`${API_URL}?query=*[_type == "product"]`);
  const data = await response.json();

  products = data.result.map((product) => ({
    id: product._id,
    title: product.title,
    price: product.price,
    description: product.description,
    image: product.mainImage.asset._ref
      .replace("image-", "")
      .replace(/-(?=png|jpg|jpeg|gif)/, "."),
    categoryId: product.category._ref,
  }));

  // 2- render products to DOM
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
        src=${IMAGES_URL}/${product.image}
        alt=${product.title}
        class="w-28 h-28 object-cover"/>
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

async function getCategories() {
  // 1- get categories from API
  const response = await fetch(`${API_URL}?query=*[_type == "category"]`);
  const data = await response.json();

  // format categories
  categories = data.result.map((category) => {
    return {
      id: category._id,
      title: category.title,
    };
  });

  // 2- render categories to DOM
  renderCategories();
}

function renderCategories() {
  categories.forEach((category) => {
    const categoryElement = document.createElement("button");

    // add styles and content
    categoryElement.classList.add("shadow", "py-1", "px-2", "rounded");
    categoryElement.innerText = category.title;

    // set the id (needed to filter the products later)
    categoryElement.setAttribute("id", category.id);

    // append to the container
    categoriesContainer.appendChild(categoryElement);

    // event listener for each category
    categoryElement.addEventListener("click", () => {
      if (selectedCategoryId === category.id) selectedCategoryId = null;
      else selectedCategoryId = category.id;

      // const allCategoriesBtns = document.querySelectorAll("#categoriesContainer button");
      // const allCategoriesBtns = document.querySelectorAll("#categoriesContainer").childNodes
      const allCategoriesBtns = categoriesContainer.querySelectorAll("button");

      // loop over all categories and toggle the active styles
      allCategoriesBtns.forEach((btn) => {
        // if the selectedCategoryId is equal to the current category id
        // then add the active styles
        if (selectedCategoryId === btn.id)
          btn.classList.add("bg-brand", "text-white");
        else btn.classList.remove("bg-brand", "text-white");
      });

      searchSortAndFilterProducts();
    });
  });
}

searchElement.addEventListener("input", searchSortAndFilterProducts);
sortElement.addEventListener("change", searchSortAndFilterProducts);

function searchSortAndFilterProducts() {
  // search products (by name)
  const searchValue = searchElement.value;
  const searchedProducts = products.filter((product) =>
    product.title.toLowerCase().includes(searchValue.toLowerCase())
  );

  // sort products (cheap & expensive)
  const sortValue = sortElement.value;
  if (sortValue === "cheap") {
    searchedProducts.sort(
      (product1, product2) => product1.price - product2.price
    );
  } else if (sortValue === "expensive") {
    searchedProducts.sort(
      (product1, product2) => product2.price - product1.price
    );
  }

  // filter products (by category)
  const filteredProductsByCategory = searchedProducts.filter((product) =>
    selectedCategoryId ? selectedCategoryId === product.categoryId : true
  );

  // render the udpated products array
  renderProducts(filteredProductsByCategory);
}
