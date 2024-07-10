const types = {
    facility: "facility",
    service: "service",
  };
  
  const imageSrc =
    "https://imagedelivery.net/ePR8PyKf84wPHx7_RYmEag/fc0013fa-a903-475f-7bb1-4276e2c03100/86";
  
  // document.addEventListener("DOMContentLoaded", (event) => {
  let orders = JSON.parse(localStorageService.getItem("orders")) || [];
  let currentPage = 1;
  let isOpenOrder = false;
  
  const main = document.getElementById("main");
  const body = document.querySelector("body");
  const orderCount = document.querySelector(".header__cart-count");
  const inputSearch = document.querySelector(".search__input");
  
  let productDetail;
  let data = {
    limit: LIMIT,
    skip: SKIP,
    products: [],
    total: 0,
  };

  // error page
  const renderErrorPage = () => {
    const errorElm = document.createElement('div');
    errorElm.classList.add('error-page');

    errorElm.innerHTML = `
        <div class="error-page__message">Something went wrong</div>
        <div class="error-page__button">Refresh</button>
    `

    const refreshButton = errorElm.querySelector('.error-page__button');
    refreshButton.addEventListener('click', () => {
        location.reload();
    })
    body.appendChild(errorElm);
  }
  
  //  loading page
  const renderLoading = () => {
    const loading = document.createElement("div");
    loading.classList.add("loading");
    loading.innerHTML = `
        <div class="loading__spinner">
          <div class="loading__spinner-item"></div>
          <div class="loading__spinner-item"></div>
          <div class="loading__spinner-item"></div>
          <div class="loading__spinner-item"></div>
        </div>
        <div class="loading__message">Loading...</div>
      `;
  
    body.appendChild(loading);
  };

  // remove loading
  const removeLoading = () => {
    const loading = document.querySelector(".loading");
    body.removeChild(loading);
  };
  
  // get data from api
  const getData = async (skip) => {
    renderLoading();
    try {
      const res = await getProductList({ limit: LIMIT, skip });
      const _res = await res.json();
      data = _res;
      orderCount.textContent = orders.length;
  
      renderData(data);
      removeLoading();
    } catch (e) {
      console.log(e, '----');
      removeLoading();
    }
  };

  const handleInputChange = debounceSearch(async (value) => {
    renderLoading();
    try {
      const res = await getSearchProduct(value);
      const _res = await res.json();
      data = _res;
      orderCount.textContent = orders.length;
  
      renderData(data);
      removeLoading();
    } catch (e) {
      removeLoading();
    }
  }, 500);
  
  const goToOrders = () => {
    window.location.href = "html/orders.html";
  };
  
  const getDetailProduct = async (element) => {
    renderLoading();
    try {
      const res = await getProductDetail(element.id);
      const _res = await res.json();
      const _modalElm = renderModalItem(_res);
  
      renderModal(_modalElm);
      removeLoading();
    } catch (e) {
      removeLoading();
    }
  };
  
  const renderModal = (elm) => {
    const overlayDiv = document.createElement("div");
  
    overlayDiv.setAttribute("id", "overlay");
    overlayDiv.classList.add("overlay");
  
    body.appendChild(overlayDiv);
    body.appendChild(elm);
  
    overlayDiv.addEventListener("click", () => {
      body.removeChild(overlayDiv);
      body.removeChild(elm);
    });
  };

  const handleAddToCart = (data) => {
    const indexItem = orders.findIndex((item) => item.id === data.id);
    if (indexItem === -1) {
      orders = [
        ...orders,
        {
          ...data,
          quantity: 1,
        },
      ];
    } else {
      orders[indexItem] = {
        ...orders[indexItem],
        quantity: orders[indexItem].quantity + 1,
      };
    }
  
    localStorageService.setItem("orders", JSON.stringify(orders));
  
    orderCount.textContent = orders.length;
  };
  
  const renderButtonSubmit = (cb) => {
    const buttonSubmitElm = document.createElement("div");
    buttonSubmitElm.classList.add("button-submit");
    buttonSubmitElm.innerHTML = `Submit`;
  
    buttonSubmitElm.addEventListener("click", cb);
    return buttonSubmitElm;
  };
  
  const handleSubmitOrders = () => {
    const successfulElm = document.createElement("div");
    successfulElm.classList.add("successful-popup");
    successfulElm.innerHTML = `
        Submit successfully
      `;
    renderModal(successfulElm);
  };
  
  const renderPagination = (_data) => {
    const pagination = document.createElement("div");
    const paginationPrev = document.createElement("div");
    const paginationNext = document.createElement("div");
  
    pagination.classList.add("pagination");
    pagination.setAttribute("id", "pagination");
  
    paginationPrev.classList.add("pagination__prev");
    paginationNext.classList.add("pagination__next");
  
    paginationPrev.innerHTML = "Previous";
    paginationNext.innerHTML = "Next";
  
    const paginationPageCount = document.createElement("div");
    paginationPageCount.classList.add("pagination__page-info");
  
    const totalPages = Math.ceil(_data.total / LIMIT);
  
    paginationPrev.addEventListener('click', () => {
      if(currentPage > 1) {
        currentPage = currentPage - 1;
        const _skip = (currentPage - 1) * LIMIT;
        getData(_skip)
      } else return
    })
  
    paginationNext.addEventListener('click', () => {
      if(currentPage < totalPages) {
        currentPage = currentPage + 1;
        const _skip = (currentPage - 1) * LIMIT;
        getData(_skip)
      } else return
    })
  
    for (let i = 1; i <= totalPages; i++) {
      const paginationItem = renderPaginationItem(i);
      if (i == currentPage) {
        paginationItem.classList.add("active");
      }
      paginationPageCount.appendChild(paginationItem);
    }
  
    pagination.appendChild(paginationPrev);
    pagination.appendChild(paginationPageCount);
    pagination.appendChild(paginationNext);
  
    return pagination;
  };
  
  const renderPaginationItem = (pageNumber) => {
    const paginationPageItem = document.createElement("div");
    paginationPageItem.classList.add("pagination__page-item");
    paginationPageItem.innerHTML = `
        ${pageNumber}
      `;
  
    paginationPageItem.addEventListener("click", () => {
      const _skip = (pageNumber - 1) * LIMIT;
      currentPage = pageNumber;
      getData(_skip);
    });
  
    return paginationPageItem;
  };
  
  const renderOrderData = () => {
    if (!isOpenOrder) {
      isOpenOrder = true;
      const orderListElm = document.createElement("div");
      orderListElm.classList.add("order-list");
      orderListElm.setAttribute("id", "order-list");
      const buttonSubmitElm = renderButtonSubmit(handleSubmitOrders);
  
      const totalPriceElm = document.createElement("div");
      totalPriceElm.classList.add("total-price");
      totalPriceElm.innerHTML = `<div>Total: ${totalPrice(orders)}$</di>`;
  
      orders.forEach((element) => {
        const _res = renderOrderDataItem(element);
        orderListElm.appendChild(_res);
      });
  
      orderListElm.appendChild(totalPriceElm);
      orderListElm.appendChild(buttonSubmitElm);
      orderCount.appendChild(orderListElm);
    } else {
      isOpenOrder = false;
      orderCount.replaceChildren();
      orderCount.textContent = orders.length;
    }
  };
  
  const renderOrderDataItem = (data) => {
    const orderDataItemElm = document.createElement("div");
    orderDataItemElm.classList.add("order-list__item");
    orderDataItemElm.innerHTML = `
              <img src=${data.thumbnail ?? imageSrc} alt=${data.title}>
            <div class="order-list__item__content">
              <h3 class="order-list__item__title">${data.title}</h3>
              <p class="order-list__item__description">${data.description}</p>
              <div class="order-list__item__price">${data.quantity} * ${
      data.price
    }$</div>
                </div>
          `;
    return orderDataItemElm;
  };
  
  const handleRenderData = (data) => {
    const productCarts = document.createElement("div");
      productCarts.classList.add("product-list");
      productCarts.setAttribute("id", "product-list");
  
      if (data.products.length > 0) {
        data.products.forEach((element) => {
          const _res = renderDataItem(element);
          _res.addEventListener("click", () => {
            getDetailProduct(element);
          });
  
          productCarts.appendChild(_res);
        });
  
        const pagination = renderPagination(data);
  
        main.appendChild(productCarts);
        main.appendChild(pagination);
      } else {
        const noDataElm = document.createElement("div");
        noDataElm.classList.add('no-data');
        noDataElm.innerHTML = `Data not found`;
        main.appendChild(noDataElm);
      }
  }
  
  const renderData = (data) => {
    const productListId = document.getElementById("product-list");
    const paginationId = document.getElementById("pagination");
  
    if (productListId) {
      main.removeChild(productListId);
      main.removeChild(paginationId);
      handleRenderData(data);
    } else {
      handleRenderData(data);
    }
  };
  
  const renderModalItem = (data) => {
    const modalCard = document.createElement("div");
    modalCard.classList.add("modal-card");
  
    modalCard.innerHTML = `
      <div class="modal-card__image">
                      <img src=${data.thumbnail ?? imageSrc} alt=${data.title}>
                  </div>
                  <div class="modal-card__content">
                      <h3 class="modal-card__title">${data.title}</h3>
                      <p class="modal-card__description">${data.description}</p>
                      <div class="modal-card__price">${data.price}$</div>
                      <button class="modal-card__button">Add to Cart</button>
                  </div>
      `;
  
    const addToCart = modalCard.querySelector(".modal-card__button");
    addToCart.addEventListener("click", () => handleAddToCart(data));
  
    return modalCard;
  };
  
  const renderDataItem = (data) => {
    const productCartItem = document.createElement("div");
    productCartItem.classList.add("product-card");
    productCartItem.innerHTML = `
          <div class="product-card__image">
              <img src=${data.thumbnail ?? imageSrc} alt=${data.title}>
            </div>
            <div class="product-card__content">
              <h3 class="product-card__title">${data.title}</h3>
              <p class="product-card__description">${data.description}</p>
              <div class="product-card__price">${data.price}$</div>
                </div>
          `;
    return productCartItem;
  };

  getData(0);
  
  // console.log("DOM fully loaded and parsed");
  // });