const LIMIT = 20;
const SKIP = 0;

const debounceSearch = (fn, delay = 1000) => { 
    let timerId = null; 
    return (...args) => { 
        clearTimeout(timerId); 
        timerId = setTimeout(() => fn(...args), delay); 
    }; 
}; 

const totalPrice = (orders) => orders.reduce((sum, order) => sum + order.price, 0);

// const apiUrl = 'http://10.63.161.172:3000/api/get-product'

const localStorageService = {
  setItem: (name, value) => {
    return localStorage.setItem(name, value);
  },
  getItem: (name) => {
    return localStorage.getItem(name);
  }
}

const renderBody = (requestBody) => {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  };
};


const getProductList = (query) => {
    const { limit = LIMIT, skip = SKIP } = query;
    return fetch(`https://dummyjson.com/products?limit=${LIMIT}&skip=${skip}`);
}


const getProductDetail = (id) => {
    return fetch(`https://dummyjson.com/products/${id}`)
}

const getSearchProduct = (keyword) => {
  return fetch(`https://dummyjson.com/products/search?q=${keyword}`)
}