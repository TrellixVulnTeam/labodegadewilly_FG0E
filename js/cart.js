const urlProductos = "./json/productos.json";

const contenedorCards = document.getElementById("js-contenedorCards");
const templateFooter = document.getElementById("js-templateFooter").content;
const templateCart = document.getElementById("js-templateCart").content;
const itemsCart = document.getElementById("js-itemsCart");
const cartFooter = document.getElementById("js-cartFooter");
const fragment = document.createDocumentFragment();
const buscarProducto = document.getElementById("js-buscarProducto");
let cart = {};

const fetchData = async () => {
  const res = await fetch("./json/productos.json");
  const data = await res.json();
  console.log(data);
  data.forEach((producto) => {
    $("#js-contenedorCards").append(templateCardHTML(producto));
  });
};

document.addEventListener("DOMContentLoaded", () => {
  fetchData();
  if (localStorage.getItem("cartKey")) {
    cart = JSON.parse(localStorage.getItem("cartKey"));
    printCart();
  }
});

contenedorCards.addEventListener("click", (e) => {
  addToCart(e);
});

itemsCart.addEventListener("click", (e) => {
  btnSumarYRestar(e);
});

const templateCardHTML = ({
  id,
  name,
  marca,
  img,
  tipo,
  varietal,
  envase,
  precio,
}) => {
  return ` <div class="cards" id=${id}>
                    <div class="imgBx">
            <img class="imgProduct" src=${img} alt= ${name} - ${tipo}  ${varietal}
              >
          </div>
          <div class="nombreyprecio ">
            <h5 class="text-white"><span class="envaseProducto text-white">${envase} </span> - <span class="fw-bold">$</span><span class="preciocondescuento">${precio}</span><span class="d-none productStock"></span></h5>
            <h5 class="tipodevino"><span class="nombreProducto">${name}</span> - <span class="tipoProduct">${tipo} </span> - <span class="varietalProduct">${varietal} </span></h5>
            <h5 class="marca fw-bold text-white">${marca}</h5>
          </div>
          <div class="contenido">
            <div>              
                <a href="#" class="btn btn-secondary agregarAlCarro"><span class="d-none idProduct">${id}</span > Agregar  </a>
            </div>  
          </div>
        </div>`;
};

document
  .getElementById("js-buscarProducto")
  .addEventListener("keyup", filtrarProductos);

function filtrarProductos() {
  $.getJSON("../json/productos.json", (data) => {
    // console.log("Modo con jQuery:");
    let dataDesdeJason = data;
    // console.log(dataDesdeJason);

    const buscarProductoValue = buscarProducto.value;
    const filteredProducts = dataDesdeJason.filter((product) => {
      const productNameLowerCase = product.marca.toLowerCase();
      // console.log(productNameLowerCase);
      const productVarietalLowerCase = product.varietal.toLowerCase();
      const productTipoLowerCase = product.tipo.toLowerCase();

      const isFiltered =
        productNameLowerCase.includes(buscarProductoValue.toLowerCase()) ||
        productVarietalLowerCase.includes(buscarProductoValue.toLowerCase()) ||
        productTipoLowerCase.includes(buscarProductoValue.toLowerCase());

      return isFiltered;
    });
    renderCardsHtml(filteredProducts, contenedorCards);
  });
}

const renderCardsHtml = (products, container) => {
  container.innerHTML = "";
  if (products.length > 0) {
    for (const product of products) {
      const cardHTML = templateCardHTML(product);

      container.innerHTML += cardHTML;
    }
  } else {
    container.innerHTML = `<h2>No se encontro ningun producto</h2>`;
  }
};

let addToCart = (e) => {
  if (e.target.classList.contains("agregarAlCarro")) {
    console.log(e);
    setCart(e.target.closest(".cards"));
  }
  e.stopPropagation();
};

const setCart = (objeto) => {
  const producto = {
    id: objeto.querySelector(".idProduct").textContent,
    nombre: objeto.querySelector(".nombreProducto").textContent,
    precio: objeto.querySelector(".preciocondescuento").textContent,
    tipo: objeto.querySelector(".tipoProduct").textContent,
    marca: objeto.querySelector(".marca").textContent,
    varietal: objeto.querySelector(".varietalProduct").textContent,
    envase: objeto.querySelector(".envaseProducto").textContent,
    imagen: objeto.querySelector(".imgProduct").src,
    cantidad: 1,
  };

  if (cart.hasOwnProperty(producto.id)) {
    producto.cantidad = cart[producto.id].cantidad + 1;
  }

  cart[producto.id] = { ...producto };
  printCart();
};

function printCart() {
  itemsCart.innerHTML = ""; //limpio el html para que no se me repitan los productos ya agregados cada vez que agrego uno nuevo

  Object.values(cart).forEach((producto) => {
    templateCart.querySelector("#idProducto").textContent = producto.id;
    templateCart.querySelector("#nameProduct").textContent = producto.nombre;
    templateCart.querySelector("#imgProductoCart").src = producto.imagen;
    templateCart.querySelector("#tipoProducto").textContent = producto.tipo;
    templateCart.querySelector("#marcaProducto").textContent = producto.marca;
    templateCart.querySelector("#cantidadProducto").textContent =
      producto.cantidad;
    templateCart.querySelector("#varietalProducto").textContent =
      producto.varietal;

    templateCart.querySelector("#precio").textContent = producto.precio;
    templateCart.querySelector("#precioXCantidad").textContent =
      producto.precio * producto.cantidad;

    //botones
    templateCart.querySelector(".btn-primary").dataset.id = producto.id;
    templateCart.querySelector(".btn-danger").dataset.id = producto.id;
    templateCart.querySelector(".btn-secondary").dataset.id = producto.id;

    const clone = templateCart.cloneNode(true);
    fragment.appendChild(clone);
  });
  itemsCart.appendChild(fragment);

  pintarFooter();

  localStorage.setItem("cartKey", JSON.stringify(cart));
}

function pintarFooter() {
  cartFooter.innerHTML = "";
  if (Object.keys(cart).length === 0) {
    cartFooter.innerHTML = `
        <p class="text-primary">Carrito vacío con innerHTML</>
        `;
    return;
  }

  // sumar cantidad y sumar totales - por cada iteracion va sumando la cantidad actual + la nueva
  const CantidadDeProductos = Object.values(cart).reduce(
    (acc, { cantidad }) => acc + cantidad,
    0
  );
  const PrecioPorCantidad = Object.values(cart).reduce(
    (acc, { cantidad, precio }) => acc + cantidad * precio,
    0
  );
  templateFooter.querySelectorAll("#tcantidadDeProductos").textContent =
    CantidadDeProductos;
  templateFooter.querySelector("#totalDeLaCompra").textContent =
    PrecioPorCantidad;
  const AddedToCart = document.querySelector("#js-AddedToCart");
  AddedToCart.textContent = CantidadDeProductos;

  const clone = templateFooter.cloneNode(true);
  fragment.appendChild(clone);

  cartFooter.appendChild(fragment);

  const EmptyCart = document.querySelector("#js-EmptyCart");
  EmptyCart.addEventListener("click", () => {
    cart = {};
    AddedToCart.textContent = 0;
    printCart();
  });
}

const btnSumarYRestar = (e) => {
  if (e.target.classList.contains("btn-primary")) {
    const producto = cart[e.target.dataset.id];
    producto.cantidad++;
    cart[e.target.dataset.id] = { ...producto };
    printCart();
  }

  if (e.target.classList.contains("btn-danger")) {
    const AddedToCart = document.querySelector("#js-AddedToCart");
    delete cart[e.target.dataset.id];
    AddedToCart.textContent = 0;
    printCart();
  }

  if (e.target.classList.contains("btn-secondary")) {
    const AddedToCart = document.querySelector("#js-AddedToCart");
    const producto = cart[e.target.dataset.id];
    producto.cantidad--;
    if (producto.cantidad === 0) {
      delete cart[e.target.dataset.id];
      AddedToCart.textContent = 0;
    } else {
      cart[e.target.dataset.id] = { ...producto };
    }
    printCart();
  }
  e.stopPropagation();
};
