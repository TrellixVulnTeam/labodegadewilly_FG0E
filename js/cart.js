//Traigo Los elementos que voy a utilizar en la programación desde el HTML

const contenedorCards = document.getElementById("js-contenedorCards");
const templateFooter = document.getElementById("js-templateFooter").content;
const templateCart = document.getElementById("js-templateCart").content;
const itemsCart = document.getElementById("js-itemsCart");
const cartFooter = document.getElementById("js-cartFooter");
const fragment = document.createDocumentFragment();
const buscarProducto = document.getElementById("js-buscarProducto");
const barraMenu = document.getElementById("navbar");

// Inicio el carro como un objeto vacio
let cart = {};

// Traigo el JSON con Fetch para immprimir las tarjetas
const fetchData = async () => {
  const res = await fetch("json/productos.json");
  const data = await res.json();
  console.log(data);
  data.forEach((producto) => {
    $("#js-contenedorCards").append(templateCardHTML(producto));
  });
};

// A la carga del DOM ejecuto el Fetch y genero la Key en el LocalStorage
document.addEventListener("DOMContentLoaded", () => {
  fetchData();
  if (localStorage.getItem("cartKey")) {
    cart = JSON.parse(localStorage.getItem("cartKey"));
    printCart();
  }
});

//Manejo de los eventos del click
document.addEventListener("click", (e) => {
  if (e.target.matches("#js-filtrarVinos")) {
    filtroPorTipo(e.target.textContent);
  }
  if (e.target.matches("#js-filtrarEspumantes")) {
    filtroPorTipo(e.target.textContent);
  }
  if (e.target.matches("#js-filtrarDestilados")) {
    filtroPorTipo(e.target.textContent);
  }
  if (e.target.matches("#js-todosLosProductos")) {
    $.getJSON("json/productos.json", (data) => {
      let dataDesdeJason = data;
      renderCardsHtml(dataDesdeJason, contenedorCards);
    });
  }
  if (e.target.matches("#CierreCompra")) {
    finalizarCompra();
  }
});

contenedorCards.addEventListener("click", (e) => {
  addToCart(e);
});

itemsCart.addEventListener("click", (e) => {
  btnSumarYRestar(e);
});

//Template de Card que toma el JSON para crear cada tarjeta del producto
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
                <a href="#" class="btn fw-bold pt-0 pb-0 ps-4 pe-4 btn-outline-secondary agregarAlCarro"><span class="d-none idProduct">${id}</span > Agregar  </a>
            </div>  
          </div>
        </div>`;
};

//Imprimo las tarjetas en el HTML
const renderCardsHtml = (products, container) => {
  container.innerHTML = "";
  if (products.length > 0) {
    for (const product of products) {
      const cardHTML = templateCardHTML(product);

      container.innerHTML += cardHTML;
    }
  } else {
    container.innerHTML = `<h2 class="fw-bold text-white">No se encontro ningún producto</h2>`;
  }
};

// Agrego los productos seleccionados al carrito
let addToCart = (e) => {
  if (e.target.classList.contains("agregarAlCarro")) {
    setCart(e.target.closest(".cards"));
  }
  e.stopPropagation();
};

// Seteo el producto agregado para armar la Card en la ventana modal del Carro
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

  // Si el producto clickeado ya esta agregado al carrit, no lo repite, solo aumenta la cantidad.
  if (cart.hasOwnProperty(producto.id)) {
    producto.cantidad = cart[producto.id].cantidad + 1;
  }

  cart[producto.id] = { ...producto };
  printCart();
};

// imprimo la tarjeta de cada producto que se agrega en el Carrito
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

// imprimo el pie de pagina de la Ventana Modal del Carrito
function pintarFooter() {
  cartFooter.innerHTML = "";
  if (Object.keys(cart).length === 0) {
    cartFooter.innerHTML = `
        <p class="text-primary fw-bold text-center">Su carro esta Vacio</>
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

  templateFooter.querySelector("#cantidadDeProductos").textContent =
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

// Funcionalidad de los botones para sumar-restar-eliminar productos
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

// Buscar productos
document
  .getElementById("js-buscarProducto")
  .addEventListener("keyup", filtrarProductos);
// Función para filtrar los productos mientras se tipea
function filtrarProductos() {
  $.getJSON("json/productos.json", (data) => {
    // console.log("Modo con jQuery:");
    let dataDesdeJason = data;
    // console.log(dataDesdeJason);
    const buscarProductoValue = buscarProducto.value;

    const filteredProducts = dataDesdeJason.filter((product) => {
      const productNameLowerCase = product.name.toLowerCase();
      const productMarcaLowerCase = product.marca.toLowerCase();
      const productVarietalLowerCase = product.varietal.toLowerCase();
      const productTipoLowerCase = product.tipo.toLowerCase();

      const isFiltered =
        productNameLowerCase.includes(buscarProductoValue.toLowerCase()) ||
        productMarcaLowerCase.includes(buscarProductoValue.toLowerCase()) ||
        productVarietalLowerCase.includes(buscarProductoValue.toLowerCase()) ||
        productTipoLowerCase.includes(buscarProductoValue.toLowerCase());
      return isFiltered;
    });
    renderCardsHtml(filteredProducts, contenedorCards);
  });
}

// Filtra productos productos
function filtroPorTipo(fil) {
  $.getJSON("json/productos.json", (data) => {
    let dataDesdeJason = data;
    // console.log(fil);
    const filteredProducts = dataDesdeJason.filter((product) => {
      const productNameLowerCase = product.filtro;
      // console.log(productNameLowerCase);
      console.log(fil.textContent);
      const FiltroProducto = productNameLowerCase.includes(fil);
      // console.log(FiltroProducto);
      return FiltroProducto;
    });
    renderCardsHtml(filteredProducts, contenedorCards);
  });
}

// Finalizar Compra
const finalizarCompra = () => {
  const AddedToCart = document.querySelector("#js-AddedToCart");
  AddedToCart.textContent = 0;
  cart = {};
  printCart();
};
